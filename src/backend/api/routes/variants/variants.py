import dataclasses
import functools
import operator
from typing import List, Mapping, Tuple

from fastapi import APIRouter

import cache.cache as cache
import numpy as np
from cortado_core.models.infix_type import InfixType
from cortado_core.utils.split_graph import (ConcurrencyGroup, Group,
                                            SequenceGroup)
from pm4py.objects.log.obj import Trace
from pydantic import BaseModel

from fastapi import APIRouter

# i think its better to have one prefix for everything which
# is related to variants instead of defining a prefix for
# every endpoint.
# e.g. /variantQuery should be /variant/query
# because otherwise the generated api docs are not really convenient
router = APIRouter(tags=['Variants'], prefix="/variant")


class VariantFragment(BaseModel):
    fragment: dict
    infixType: str

@dataclasses.dataclass
class VariantInformation:
    infix_type: InfixType
    is_user_defined: bool


def count_fragment_occurrences(variant, fragment: Group, infixType: InfixType, idx):
    # extract group from variant
    group: Group = variant[1][0]

    # We always need a sequence group as the root of the tree
    # because we use this assumption to check the prefix/postfix
    if not isinstance(group, SequenceGroup):
        group = SequenceGroup(lst=[group])

    return group.countInfixOccurrences(fragment, infixType=infixType, isRootNode=True)


def get_trace_counts(variants: Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]]):
    return list(map(lambda variant: len(variant[1][1]), variants.items()))


def get_fragment_counts(variants: Mapping[int, Tuple[ConcurrencyGroup,
                                                     Trace, List, VariantInformation]], fragment: Group,
                        infixType: InfixType):
    return list(map(lambda variant: count_fragment_occurrences(
        variant, fragment, infixType, variant[0]), variants.items()))


@router.post("/countFragmentOccurrences")
def get_fragment_statistics(payload: VariantFragment):
    fragment: Group = Group.deserialize(payload.fragment)

    variants: Mapping[int, Tuple[ConcurrencyGroup,
                                 Trace, List, VariantInformation]] = cache.variants
    variants = {k: v for k, v in variants.items() if not v[3].is_user_defined}


    infixType = InfixType[payload.infixType]

    trace_counts = get_trace_counts(variants)
    fragment_counts = get_fragment_counts(variants, fragment, infixType)

    # number of pattern occurrences among all variants
    total_variant_occurrences = functools.reduce(operator.add, fragment_counts)
    # number of variants having at least once the pattern
    variant_occurrences = np.count_nonzero(fragment_counts)
    # number traces having at least once the pattern
    trace_occurrences = np.sum(np.array(trace_counts)[
                                   np.nonzero(fragment_counts)]).item()

    # number of pattern occurrences among all traces
    total_trace_occurrences = np.sum(
        np.array(trace_counts) * np.array(fragment_counts)).item()

    return {
        'totalOccurrences': total_variant_occurrences,
        'variantOccurrences': variant_occurrences,
        'traceOccurrences': trace_occurrences,
        'totalTraceOccurrences': total_trace_occurrences,
        'variantOccurrencesFraction': round(variant_occurrences / len(variants), 4),
        'traceOccurrencesFraction': round(trace_occurrences / np.sum(trace_counts), 4)
    }
