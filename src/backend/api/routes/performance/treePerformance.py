from typing import List, Optional

import cache.cache as cache
from backend_utilities.process_tree_conversion import (
    dict_to_process_tree,
    process_tree_to_dict,
)
from cortado_core.performance import tree_performance
from cortado_core.performance import utils as performance_utils
from cortado_core.performance.aggregators import avg, noop, stats
from cortado_core.utils.process_tree import CortadoProcessTree, convert_tree
from fastapi import APIRouter
from pm4py.algo.conformance.alignments.petri_net import algorithm as net_alignment
from pm4py.objects.log.obj import EventLog
from cortado_core.process_tree_utils.miscellaneous import is_tau_leaf
from pydantic import BaseModel

router = APIRouter(tags=["treePerformance"], prefix="/treePerformance")


def merge_performance(all_performances):
    merged = {}
    for performance in all_performances:
        for tree in performance:
            p = merged.get(tree, [])
            if performance[tree]:
                p.extend(performance[tree])
            merged[tree] = p
    return merged


class InputCalculatePerformance(BaseModel):
    pt: dict
    variants: List[int]
    delete: Optional[List[int]]


pcache = {}


def tau_0_values(tree_nodes, perf_stats):
    for t in [t for t in tree_nodes if is_tau_leaf(t)]:
        perf_stats[str(t)] = {
            "service_time": stats([0]),
            "cycle_time": stats([0]),
            "waiting_time": stats([0]),
            "idle_time": stats([0]),
        }


def get_merged_performances(pt: CortadoProcessTree):
    tree_nodes = performance_utils.get_all_nodes(pt)
    tree_cache_key = str(pt)

    all_service_times = [
        cache.pcache[tree_cache_key][k]["service_times"]
        for k in cache.pcache[tree_cache_key]
    ]
    all_waiting_times = [
        cache.pcache[tree_cache_key][k]["waiting_times"]
        for k in cache.pcache[tree_cache_key]
    ]
    all_cycle_times = [
        cache.pcache[tree_cache_key][k]["cycle_times"]
        for k in cache.pcache[tree_cache_key]
    ]
    all_idle_times = [
        cache.pcache[tree_cache_key][k]["idle_times"]
        for k in cache.pcache[tree_cache_key]
    ]

    merged_service_times = merge_performance(all_service_times)
    merged_waiting_times = merge_performance(all_waiting_times)
    merged_cycle_times = merge_performance(all_cycle_times)
    merged_idle_times = merge_performance(all_idle_times)

    merged_performances = {
        str(t): {
            "service_time": stats(merged_service_times[t])
            if t in merged_service_times
            else None,
            "cycle_time": stats(merged_cycle_times[t])
            if t in merged_cycle_times
            else None,
            "waiting_time": stats(merged_waiting_times[t])
            if t in merged_waiting_times
            else None,
            "idle_time": stats(merged_idle_times[t])
            if t in merged_idle_times
            else None,
        }
        for t in tree_nodes
    }
    tau_0_values(tree_nodes, merged_performances)
    pt_dict = process_tree_to_dict(pt, performance=merged_performances)
    return pt_dict


@router.post("/calculateVariantsPerformance")
async def calculate_variant_performance(d: InputCalculatePerformance):
    pt, _ = dict_to_process_tree(d.pt)
    pt = convert_tree(pt)
    tree_nodes = performance_utils.get_all_nodes(pt)
    variants_tree_performance = []

    tree_cache_key = str(pt)
    variants_fitness = []

    if d.delete:
        for bid in d.delete:
            if tree_cache_key in pcache and bid in cache.pcache[tree_cache_key]:
                del cache.pcache[tree_cache_key][bid]

    for bid in d.variants:
        (_, traces, _, info) = cache.variants[bid]
        if info.is_user_defined:
            continue
        if tree_cache_key in cache.pcache and bid in cache.pcache[tree_cache_key]:

            p_values = cache.pcache[tree_cache_key][bid]
            service_times_aggregated = p_values["service_times"]
            idle_times_aggregated = p_values["idle_times"]
            waiting_times_aggregated = p_values["waiting_times"]
            cycle_times_aggregated = p_values["cycle_times"]
            mean_fitness = p_values["mean_fitness"]

        else:

            test_log = traces
            test_log = EventLog(test_log)

            (
                service_times,
                idle_times,
                waiting_times,
                cycle_times,
            ), mean_fitness = tree_performance.get_tree_performance_intervals(
                pt,
                test_log,
                alignment_variant=net_alignment.Variants.VERSION_STATE_EQUATION_A_STAR,
            )

            service_times_aggregated = tree_performance.apply_aggregation(
                service_times, noop, avg, avg
            )
            idle_times_aggregated = tree_performance.apply_aggregation(
                idle_times, noop, avg, avg
            )
            waiting_times_aggregated = tree_performance.apply_aggregation(
                waiting_times, noop, avg, avg
            )
            cycle_times_aggregated = tree_performance.apply_aggregation(
                cycle_times, noop, avg, avg
            )

        perf_stats = {
            str(t): {
                "service_time": stats(service_times_aggregated[t])
                if t in service_times_aggregated
                else None,
                "cycle_time": stats(cycle_times_aggregated[t])
                if t in cycle_times_aggregated
                else None,
                "waiting_time": stats(waiting_times_aggregated[t])
                if t in waiting_times_aggregated
                else None,
                "idle_time": stats(idle_times_aggregated[t])
                if t in idle_times_aggregated
                else None,
            }
            for t in tree_nodes
        }

        tau_0_values(tree_nodes, perf_stats)

        pt_dict_variant = process_tree_to_dict(pt, performance=perf_stats)
        variants_tree_performance.append(pt_dict_variant)
        variants_fitness.append(mean_fitness)

        if tree_cache_key not in cache.pcache:
            cache.pcache[tree_cache_key] = {}

        cache.pcache[tree_cache_key][bid] = {
            "service_times": service_times_aggregated,
            "idle_times": idle_times_aggregated,
            "cycle_times": cycle_times_aggregated,
            "waiting_times": waiting_times_aggregated,
            "mean_fitness": mean_fitness,
        }

    pt_dict = get_merged_performances(pt)

    return {
        "merged_performance_tree": pt_dict,
        "variants_tree_performance": variants_tree_performance,
        "fitness_values": variants_fitness,
    }
