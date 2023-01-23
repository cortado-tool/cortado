from typing import List
from enum import Enum

from pm4py.objects.log.obj import Trace, Event
from pm4py.objects.petri_net.utils.align_utils import STD_MODEL_LOG_MOVE_COST
from pm4py.objects.process_tree.obj import ProcessTree
from pm4py.algo.conformance.alignments.process_tree.variants import search_graph_pt as tree_alignment
from cortado_core.alignments.infix_alignments import algorithm as infix_alignments
from cortado_core.alignments.prefix_alignments import algorithm as prefix_alignments
from cortado_core.alignments.suffix_alignments import algorithm as suffix_alignments


class InfixType(Enum):
    PROPER_INFIX = 1
    PREFIX = 2
    POSTFIX = 3
    NOT_AN_INFIX = 4

# @lru_cache(maxsize=None)


def calculate_alignment(variant, pt: ProcessTree, infix_type: InfixType):
    # this function uses the specific tree alignment calculation
    trace = Trace()
    for a in variant:
        e = Event()
        e["concept:name"] = a
        trace.append(e)

    if infix_type == InfixType.PROPER_INFIX:
        align = infix_alignments.calculate_optimal_infix_alignment(trace, pt,
                                                                   infix_alignments.VARIANT_TREE_BASED_PREPROCESSING,
                                                                   naive=False, use_dijkstra=True)
    elif infix_type == InfixType.PREFIX:
        align = prefix_alignments.calculate_optimal_prefix_alignment(
            trace, pt, use_dijkstra=True)
    elif infix_type == InfixType.POSTFIX:
        align = suffix_alignments.calculate_optimal_suffix_alignment(
            trace, pt, naive=False, use_dijkstra=True)
    else:
        align = tree_alignment.apply_from_variants_list([tuple(variant)], pt)
        align = align[0]
        align['deviation'] = align['cost'] > 0

    if infix_type != InfixType.NOT_AN_INFIX:
        align['deviation'] = align['cost'] >= STD_MODEL_LOG_MOVE_COST

    # remove non essential information
    res = {k: align[k] for k in ['alignment', 'cost', 'deviation']}

    return res
