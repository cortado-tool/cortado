import itertools
from typing import Dict, List, Mapping, Tuple
from cortado_core.utils.split_graph import Group
from pm4py.objects.log.obj import EventLog, Trace
from cache import cache
from api.routes.variants.variants import VariantInformation


def get_variant(variant: Tuple[Group, List[Trace], List, VariantInformation]) -> Group:
    return variant[0]


def get_traces(
    variant: Tuple[Group, List[Trace], List, VariantInformation],
) -> List[Trace]:
    return variant[1]


def get_variant_info(
    variant: Tuple[Group, List[Trace], List, VariantInformation],
) -> List[Trace]:
    return variant[3]


def get_id_to_group_mapping(include_user_defined=False) -> Dict:
    variants: Mapping[int, Tuple[Group, Trace, List, VariantInformation]] = (
        cache.variants
    )
    variants = {
        k: v[0]
        for k, v in variants.items()
        if (v[3].is_user_defined and include_user_defined) or (not v[3].is_user_defined)
    }

    return variants


def get_variant_list(include_user_defined=False) -> List[Group]:
    return list(
        get_id_to_group_mapping(include_user_defined=include_user_defined).values()
    )


def get_group_hash_to_id_mapping(include_user_defined=False) -> Dict[str, int]:
    variants: Mapping[int, Group] = get_id_to_group_mapping(
        include_user_defined=include_user_defined
    )
    return {hash(v): k for k, v in variants.items()}


def map_group_to_cached_variant(group: Group):
    variants: Mapping[str, int] = get_group_hash_to_id_mapping(
        include_user_defined=True
    )

    variant_id = variants.get(hash(group))
    return variant_id, cache.variants.get(variant_id)


def get_event_log() -> EventLog:
    traces = get_all_traces()
    log = EventLog(traces, **cache.parameters["log_info"])
    return log


def get_all_traces() -> List["Trace"]:
    return list(itertools.chain(*[ts for _, (_, ts, _, _) in cache.variants.items()]))


def get_log_length():
    return len(get_all_traces())
