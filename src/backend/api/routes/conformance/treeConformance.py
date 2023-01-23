from typing import List, Optional
from typing_extensions import TypedDict
from collections import defaultdict
from fastapi import APIRouter
from pydantic import BaseModel
from cortado_core.utils.process_tree import convert_tree
from cortado_core.utils.sequentializations import generate_variants
from cortado_core.utils.split_graph import Group
from pm4py.objects.process_tree.obj import ProcessTree

from cache import cache

from backend_utilities.process_tree_conversion import dict_to_process_tree, process_tree_to_dict
from endpoints.alignments import InfixType, calculate_alignment

router = APIRouter(tags=["treeConformance"], prefix="/treeConformance")


class ConformanceVariant(TypedDict):
    variant: dict
    count: int
    infixType: InfixType


class InputCalculateConformance(BaseModel):
    pt: dict
    variants: List[ConformanceVariant]


@router.post("/calculateVariantsConformance")
async def calculate_tree_conformance(d: InputCalculateConformance):
    pt, _ = dict_to_process_tree(d.pt)
    pt = convert_tree(pt)
    variants_tree_conformance = []
    all_conf_stats = []

    for c_variant in d.variants:
        # calc alignment
        c_variant_group = Group.deserialize(c_variant['variant'])
        variants = generate_variants(c_variant_group)
        variant_tree_conformances = []
        for variant in variants:
            alignment = calculate_alignment(
                variant, pt, c_variant['infixType'])

            conf_stats = defaultdict(lambda: {'value': None, 'weight': 0})
            for (log_move, model_move) in alignment['alignment']:
                if isinstance(model_move, ProcessTree):
                    model_move = model_move.label

                if(model_move == '>>'):
                    continue

                if conf_stats[model_move.full]['value'] is None:
                    conf_stats[model_move.full]['value'] = 0

                conf_stats[model_move.full]['weight'] += 1

                # when move is properly aligned
                if(
                    log_move == model_move or
                    (
                        # when model move only is tau
                        log_move == '>>' and model_move == None
                    )
                ):
                    conf_stats[model_move.full]['value'] += 1

            for key, conf_stat in conf_stats.items():
                conf_stats[key] = {
                    "weighted_equally": {
                        'value': conf_stat['value'] / conf_stat['weight'],
                        'weight': conf_stat['weight']
                    },
                    "weighted_by_counts": None
                }

            variant_tree_conformances.append(conf_stats)

        variant_conf_stats = merge_conf_stats(variant_tree_conformances)
        all_conf_stats.append(variant_conf_stats)
        variants_tree_conformance.append(process_tree_to_dict(
            pt, conformance=variant_conf_stats))

    return {
        "merged_conformance_tree":
            process_tree_to_dict(pt, conformance=merge_conf_stats(
                all_conf_stats, list(map(lambda x: x['count'], d.variants)))),
        "variants_tree_conformance": variants_tree_conformance,
    }


def merge_conf_stats(conf_stats: List[dict], counts=None):
    merged_stats = {}
    if len(conf_stats) >= 1:
        keys = set(
            [key for conf_stat in conf_stats for key in conf_stat.keys()])
        for key in keys:
            values = []
            equal_weights = []
            count_weights = []
            for index, stats in enumerate(conf_stats):
                if key in stats:
                    values.append(stats[key]['weighted_equally']['value'])
                    equal_weights.append(
                        stats[key]['weighted_equally']['weight'])
                    if counts is not None:
                        count_weights.append(
                            stats[key]['weighted_equally']['weight'] * counts[index])
            merged_stats[key] = {
                "weighted_equally": {
                    'value': sum([value * weight for value, weight in zip(values, equal_weights)]) / sum(equal_weights),
                    'weight': sum(equal_weights)
                },
                "weighted_by_counts": {
                    'value': sum([value * weight for value, weight in zip(values, count_weights)]) / sum(count_weights),
                    'weight': sum(count_weights)
                } if counts is not None else None
            }
        return merged_stats
    return None
