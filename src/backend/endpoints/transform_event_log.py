import os.path
import pickle
from collections import Counter, defaultdict
from typing import List, Mapping, Set, Tuple

import cache.cache as cache
from cortado_core.utils.cgroups_graph import cgroups_graph
from cortado_core.utils.cvariants import (
    get_concurrency_variants,
    get_detailed_variants,
    SubvariantNode,
)
from cortado_core.utils.split_graph import (
    ConcurrencyGroup,
    LeafGroup,
    ParallelGroup,
    SequenceGroup,
)
from pm4py.objects.log.obj import EventLog, Trace
from pm4py.util.xes_constants import DEFAULT_NAME_KEY
from cortado_core.utils.cvariants import ACTIVITY_INSTANCE_KEY

from api.routes.variants.variants import VariantInformation
from endpoints.alignments import InfixType
from endpoints.load_event_log import compute_log_stats, create_variant_object


def cache_current_data():
    if not os.path.isdir('./tmp'):
        os.mkdir('./tmp')

    pickle.dump(cache.parameters, open("tmp/parameters_cache.p", "wb"))
    pickle.dump(cache.variants, open("tmp/variants_cache.p", "wb"))


def reset_last_transaction():
    cache.variants = pickle.load(open("tmp/variants_cache.p", "rb"))
    cache.parameters = pickle.load(open("tmp/parameters_cache.p", "rb"))

    total_traces = sum([len(ts) for (_, ts, _, _) in cache.variants.values()])
    res_variants = []

    for bid, (v, ts, sv, info) in cache.variants.items():

        variant = {
            "count": len(ts),
            "variant": v.serialize(),
            "bid": bid,
            "length": len(v),
            "number_of_activities": v.number_of_activities(),
            "percentage": round(len(ts) / total_traces * 100, 2),
            "nSubVariants": len(sv),
            "userDefined": info.is_user_defined,
            "infixType": info.infix_type.value
        }

        # If the variant is only a single activity leaf, wrap it up as a sequence
        if (
                "leaf" in variant["variant"].keys()
                or "parallel" in variant["variant"].keys()
        ):
            variant["variant"] = {"follows": [variant["variant"]]}

        res_variants.append(variant)

    res_variants = sorted(
        res_variants, key=lambda variant: variant["count"], reverse=True
    )

    start_activities, end_activities, nActivities = compute_log_stats(cache.variants)

    cache.parameters["activites"] = set(nActivities.keys())
    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": cache.parameters["lifecycle_available"],
        "timeGranularity": cache.parameters["cur_time_granularity"],
    }

    print(res)

    return res


def rename_merge_activities_in_graph(
        graph: ConcurrencyGroup, oldActivityName, newActivityName
):
    graph.events[newActivityName] = graph.events.pop(oldActivityName, set()).union(
        graph.events.get(oldActivityName, set())
    )
    graph.start_activities[newActivityName] = graph.start_activities.pop(
        oldActivityName, set()
    ).union(graph.start_activities.get(oldActivityName, set()))
    graph.end_activities[newActivityName] = graph.end_activities.pop(
        newActivityName, set()
    ).union(graph.end_activities.get(oldActivityName, set()))

    new_df = {}

    for x, y in graph.directly_follows:

        if x != oldActivityName and y != oldActivityName:
            new_df[(x, y)] = new_df.get((x, y), set()).union(
                graph.directly_follows.get((x, y))
            )

        else:

            if x == oldActivityName and y == oldActivityName:

                new_df[(newActivityName, newActivityName)] = graph.directly_follows.get(
                    (x, y)
                ).union(
                    graph.directly_follows.get(
                        (newActivityName, newActivityName), set()
                    )
                )

            elif x == oldActivityName:

                new_df[(newActivityName, y)] = graph.directly_follows.get((x, y)).union(
                    graph.directly_follows.get((newActivityName, y), set())
                )

            elif y == oldActivityName:

                new_df[(x, newActivityName)] = graph.directly_follows.get((x, y)).union(
                    graph.directly_follows.get((x, newActivityName), set())
                )

    graph.directly_follows = new_df

    new_ef = {}

    for x, y in graph.follows:

        if x != oldActivityName and y != oldActivityName:
            new_ef[(x, y)] = new_ef.get((x, y), set()).union(graph.follows.get((x, y)))

        else:

            if x == oldActivityName and y == oldActivityName:
                new_ef[(newActivityName, newActivityName)] = graph.follows.get(
                    (x, y)
                ).union(graph.follows.get((newActivityName, newActivityName), set()))

            elif x == oldActivityName:
                new_ef[(newActivityName, y)] = graph.follows.get((x, y)).union(
                    graph.follows.get((newActivityName, y), set())
                )

            elif y == oldActivityName:
                new_ef[(x, newActivityName)] = graph.follows.get((x, y)).union(
                    graph.follows.get((x, newActivityName), set())
                )

    graph.follows = new_ef

    new_cc = {}

    for x, y in graph.concurrency_pairs:

        if x != oldActivityName and y != oldActivityName:
            new_cc[(x, y)] = new_cc.get((x, y), set()).union(
                graph.concurrency_pairs.get((x, y))
            )

        else:

            if x == oldActivityName and y == oldActivityName:
                pair = (newActivityName, newActivityName)

                new_cc[pair] = graph.concurrency_pairs.get((x, y)).union(
                    graph.concurrency_pairs.get(pair, set())
                )

            elif x == oldActivityName:
                pair = tuple(sorted((newActivityName, y)))

                new_cc[pair] = graph.concurrency_pairs.get((x, y)).union(
                    graph.concurrency_pairs.get(pair, set())
                )

            elif y == oldActivityName:
                pair = tuple(sorted((x, newActivityName)))

                new_cc[pair] = graph.concurrency_pairs.get((x, y)).union(
                    graph.concurrency_pairs.get(pair, set())
                )

    graph.concurrency_pairs = new_cc

    return graph


def rename_activities_in_trace(
        trace, oldActivityName, newActivityName, instanceDict=None
):
    if not instanceDict:
        instanceDict = __get_instance_dict(trace, oldActivityName, newActivityName)

    for event in trace:

        if event[DEFAULT_NAME_KEY] == newActivityName:
            event[ACTIVITY_INSTANCE_KEY] = instanceDict[
                event[DEFAULT_NAME_KEY], event[ACTIVITY_INSTANCE_KEY]
            ]

        if event[DEFAULT_NAME_KEY] == oldActivityName:
            event[ACTIVITY_INSTANCE_KEY] = instanceDict[
                event[DEFAULT_NAME_KEY], event[ACTIVITY_INSTANCE_KEY]
            ]
            event[DEFAULT_NAME_KEY] = newActivityName

    return trace


def rename_activities_in_variant_group(group, oldActivityName, newActivityName):
    if isinstance(group, LeafGroup):
        lst = group[:]
        if oldActivityName in group:
            lst.remove(oldActivityName)
            lst.append(newActivityName)
            lst.sort()

        return LeafGroup(lst)

    else:
        children = [
            rename_activities_in_variant_group(child, oldActivityName, newActivityName)
            for child in group
        ]

        if isinstance(group, ParallelGroup):
            return ParallelGroup(sorted(children))

        else:
            return SequenceGroup(children)


def __get_instance_dict(trace, activityName, newActivityName):
    instanceDict = {}

    # Compute the number of instances of both activites
    nInstances = 0
    actInstance = 0
    newInstance = 0

    for e in trace:

        if e["concept:name"] == activityName:
            instanceDict[(activityName, actInstance)] = nInstances
            actInstance += 1
            nInstances += 1

        if e["concept:name"] == newActivityName:
            instanceDict[(newActivityName, newInstance)] = nInstances
            newInstance += 1
            nInstances += 1

    return instanceDict


def rename_activites_in_subvariant(subvariants, activityName, newActivityName):
    new_subvariants = defaultdict(list)

    for sv, ts in subvariants.items():

        new_variant = []

        instanceDict = __get_instance_dict(ts[0], activityName, newActivityName)

        for node in sv:

            node: Tuple[SubvariantNode]

            for svNode in node:

                if svNode.activity == newActivityName:
                    svNode.activity_instance = instanceDict[
                        (svNode.activity, svNode.activity_instance)
                    ]

                if svNode.activity == activityName:
                    svNode.activity_instance = instanceDict[
                        (svNode.activity, svNode.activity_instance)
                    ]
                    svNode.activity = newActivityName

            new_variant.append(node)

        new_subvariants[tuple(new_variant)] += [
            rename_activities_in_trace(
                trace, activityName, newActivityName, instanceDict
            )
            for trace in ts
        ]

    return new_subvariants


def rename_activities(mergeList, renameList, activityName, newActivityName):
    if cache.parameters["activites"].discard(activityName):
        cache.parameters["activites"].add(newActivityName)

    new_variant_dict = {}
    update_res_variants = {}

    new_variant_dict, update_res_variants = handle_rename_single_variant(
        renameList, activityName, newActivityName, new_variant_dict, update_res_variants
    )

    new_variant_dict, update_res_variants = handle_rename_merge_variants(
        mergeList, activityName, newActivityName, new_variant_dict, update_res_variants
    )

    flat_list = lambda lss: [x for ls in lss for x in ls]

    no_update = set(cache.variants.keys()).difference(
        set(flat_list(mergeList) + renameList)
    )

    for bid in no_update:
        new_variant_dict[bid] = cache.variants[bid]

    cache.variants = new_variant_dict

    activities: Set = cache.parameters["activites"]
    activities.discard(activityName)
    activities.add(newActivityName)

    cache.parameters["activites"] = activities

    return update_res_variants


def handle_rename_merge_variants(
        mergeList, activityName, newActivityName, new_variant_dict, update_res_variants
):
    for ls in mergeList:
        (variant, _, _, info) = cache.variants[ls[0]]
        renamed_variant = rename_activities_in_variant_group(
            variant, activityName, newActivityName
        )

        graphs = {}

        for graph, ts in variant.graphs.items():
            new_graph = rename_merge_activities_in_graph(
                graph, activityName, newActivityName
            )
            graphs[new_graph] = graphs.get(new_graph, 0) + ts

        renamed_variant.graphs = graphs

        renamed_subvariants = defaultdict(list)
        renamed_traces = []
        are_all_user_defined = True

        for bid in ls:
            (_, traces, sv, info) = cache.variants[bid]

            are_all_user_defined &= info.is_user_defined

            if info.is_user_defined:
                new_sv = dict()
            else:
                new_sv = rename_activites_in_subvariant(sv, activityName, newActivityName)

            renamed_traces += [
                rename_activities_in_trace(trace, activityName, newActivityName)
                for trace in traces
            ]

            for s, tr in new_sv.items():
                renamed_subvariants[s] += tr

        new_variant_dict[min(ls)] = (
            renamed_variant,
            renamed_traces,
            renamed_subvariants,
            info
        )

        update_res_variants[min(ls)] = {"nSubVariants": len(renamed_subvariants.keys())}

    return new_variant_dict, update_res_variants


def handle_rename_single_variant(
        renameList, activityName, newActivityName, new_variant_dict, update_res_variants
):
    for bid in renameList:
        (variant, traces, subvariants, info) = cache.variants[bid]

        renamed_variant = rename_activities_in_variant_group(
            variant, activityName, newActivityName
        )

        graphs = {}

        if not info.is_user_defined:
            for graph, ts in variant.graphs.items():
                new_graph = rename_merge_activities_in_graph(
                    graph, activityName, newActivityName
                )
                graphs[new_graph] = graphs.get(new_graph, 0) + ts

        renamed_variant.graphs = graphs

        if info.is_user_defined:
            renamed_subvariants = dict()
        else:
            renamed_subvariants = rename_activites_in_subvariant(
                subvariants, activityName, newActivityName
            )

        renamed_traces = [
            rename_activities_in_trace(trace, activityName, newActivityName)
            for trace in traces
        ]

        update_res_variants[bid] = {"nSubVariants": len(renamed_subvariants.keys())}
        new_variant_dict[bid] = (renamed_variant, renamed_traces, renamed_subvariants, info)

    return new_variant_dict, update_res_variants


def remove_activity_from_trace(trace, activityName):
    for event in trace:

        if event[DEFAULT_NAME_KEY] == activityName:
            del event

    return trace


def remove_activitiy_from_group(group, activity_name):
    if isinstance(group, LeafGroup):
        lst = group[:]
        if activity_name in group and len(group) == 1:

            return None

        elif activity_name in group and len(group) > 1:
            lst.remove(activity_name)

        return LeafGroup(lst)

    else:

        children = [
            remove_activitiy_from_group(child, activity_name) for child in group
        ]
        children = [child for child in children if child]

        tmp = []

        for child in children:

            if type(child) == type(group):

                for cchild in child:
                    tmp.append(cchild)

            else:
                tmp.append(child)

        children = tmp

        if len(children) > 1:

            if isinstance(group, ParallelGroup):
                return ParallelGroup(sorted(children))

            else:
                return SequenceGroup(children)

        elif len(children) == 1:
            return children[0]

        else:

            return None


def create_new_graph(trace):
    c = Counter()
    activity_map = {}
    unique_trace = trace.__deepcopy__()

    for event in unique_trace:
        activity = event[DEFAULT_NAME_KEY]
        new_name = activity + str(c[activity])
        event[DEFAULT_NAME_KEY] = new_name
        activity_map[new_name] = activity
        c[activity] += 1

    graph = cgroups_graph(unique_trace, cache.parameters["cur_time_granularity"])
    id_name_map = {name: id for id, name in enumerate(activity_map.keys())}
    graph.restore_names(activity_map, id_name_map)

    return graph


def apply_filter_copy(trace, activityName):
    new_attributes = {}
    for k, v in trace.attributes.items():
        new_attributes[k] = v

    ctrace = Trace(attributes=new_attributes)
    for ev in trace._list:

        if ev[DEFAULT_NAME_KEY] != activityName:
            ctrace.append(ev)

    return ctrace


def remove_activitiy_from_subvariant(subvariants, activityName):
    new_subvariants = defaultdict(list)
    for sv, ts in subvariants.items():

        new_variant = []

        for node in sv:
            node: Tuple[SubvariantNode]

            tup = [svNode for svNode in node if not svNode.activity == activityName]

            if len(tup) > 0:
                new_variant.append(tuple(tup))

        ts = [apply_filter_copy(trace, activityName) for trace in ts]
        new_subvariants[tuple(new_variant)] += ts

    return new_subvariants


def remove_activities(
        activityName, fallthrough, delete_member_list, merge_list, delete_variant_list
):
    new_variants: Mapping[int, Tuple[ConcurrencyGroup, List]] = {}
    update_res_variants = {}

    new_variants, update_res_variants = handle_delete_member(
        activityName, delete_member_list, new_variants, update_res_variants
    )

    new_variants, update_res_variants = handle_merge_members(
        activityName, merge_list, new_variants, update_res_variants
    )

    flat_list = lambda lss: [x for ls in lss for x in ls]

    no_update = set(cache.variants.keys()).difference(
        set(
            flat_list(merge_list)
            + fallthrough
            + delete_member_list
            + delete_variant_list
        )
    )

    for bid in no_update:
        new_variants[bid] = cache.variants[bid]

    new_variants, new_res_variants, update_res_variants = handle_fallthrough(
        activityName, fallthrough, new_variants, update_res_variants
    )

    start_activities, end_activities, _ = compute_log_stats(new_variants)

    res = {
        "startActivities": list(start_activities),
        "endActivities": list(end_activities),
        "new_variants": new_res_variants,
        "update_variants": update_res_variants,
    }

    cache.variants = new_variants

    activities: Set = cache.parameters["activites"]
    activities.discard(activityName)

    cache.parameters["activites"] = activities

    return res


def handle_merge_members(activityName, merge_list, new_variants, update_res_variants):
    for ls in merge_list:
        (variant, _, _, _) = cache.variants[ls[0]]
        new_variant = remove_activitiy_from_group(variant, activityName)

        new_traces = []
        new_subvariants = defaultdict(list)

        for bid in ls:
            (_, traces, sv, info) = cache.variants[bid]
            new_traces += [apply_filter_copy(trace, activityName) for trace in traces]
            new_sv = remove_activitiy_from_subvariant(sv, activityName)

            for s, tr in new_sv.items():
                new_subvariants[s] += tr

        graphs = {}

        for trace in new_traces:
            g = create_new_graph(trace)
            graphs[g] = graphs.get(g, 0) + 1

        new_variant.graphs = graphs

        new_variants[min(ls)] = (new_variant, new_traces, new_subvariants, info)
        update_res_variants[min(ls)] = {
            "count": len(new_traces),
            "nSubVariants": len(new_subvariants.keys()),
        }

    return new_variants, update_res_variants


def handle_delete_member(
        activityName, delete_member_list, new_variants, update_res_variants
):
    for bid in delete_member_list:
        variant, traces, subvariants, info = cache.variants[bid]

        new_variant = remove_activitiy_from_group(variant, activityName)
        ts = [apply_filter_copy(trace, activityName) for trace in traces]

        graphs = {}

        for trace in ts:
            g = create_new_graph(trace)
            graphs[g] = graphs.get(g, 0) + 1

        new_variant.graphs = graphs

        new_subvariant = remove_activitiy_from_subvariant(subvariants, activityName)

        new_variants[bid] = (new_variant, ts, new_subvariant, info)

        update_res_variants[bid] = {
            "count": len(ts),
            "nSubVariants": len(new_subvariant.keys()),
        }

    return new_variants, update_res_variants


def handle_fallthrough(activityName, fallthrough, new_variants, update_res_variants):
    mergeVariants = []
    newVariants = []

    if len(fallthrough) > 0:
        cLog = []
        for bid in fallthrough:
            (_, traces, _, _) = cache.variants[bid]
            cLog.extend([apply_filter_copy(trace, activityName) for trace in traces])

        log = EventLog(cLog)

        c_variants = get_concurrency_variants(
            log, False, cache.parameters["cur_time_granularity"]
        )

        for c_variant, c_traces in c_variants.items():
            foundMatch = False
            for n_bid, (n_variant, n_traces, _, n_info) in new_variants.items():
                if str(n_variant) == str(c_variant):
                    mergeVariants.append((n_bid, c_variant, n_traces + c_traces))
                    foundMatch = True
                    break

            if foundMatch:
                new_variants[n_bid] = (n_variant, n_traces + c_traces, None, n_info)

            else:
                newVariants.append((cache.parameters["nBids"] + 1, c_variant, c_traces))
                cache.parameters["nBids"] = cache.parameters["nBids"] + 1

    new_res_variants = []

    for bid, v, ts, info in newVariants:
        variant, subvar = create_variant_object(
            cache.parameters["cur_time_granularity"], 1, bid, v, ts, info
        )

        new_variants[bid] = (v, ts, subvar, info)
        new_res_variants.append(variant)

    for bid, v, ts, info in mergeVariants:
        subvars = get_detailed_variants(
            ts, time_granularity=cache.parameters["cur_time_granularity"]
        )

        new_variants[bid] = (v, ts, subvars, info)
        update_res_variants[bid] = {
            "count": len(ts),
            "nSubVariants": len(subvars.keys()),
        }

    return new_variants, new_res_variants, update_res_variants


def remove_variant(bids):
    cache.variants = {
        bid: (v, t, sv, info) for bid, (v, t, sv, info) in cache.variants.items() if bid not in bids
    }

    start_activities, end_activities, nActivities = compute_log_stats(cache.variants)

    res = {
        "startActivities": list(start_activities),
        "endActivities": list(end_activities),
        "activities": nActivities,
    }

    cache.parameters["activites"] = set(nActivities.keys())

    return res
