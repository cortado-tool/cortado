from typing import List, Mapping, Tuple

from cortado_core.clustering.agglomerative_edit_distance_clusterer import (
    AgglomerativeEditDistanceClusterer,
)
from cortado_core.clustering.clusterer import Clusterer
from cortado_core.clustering.label_vector_clusterer import LabelVectorClusterer
from cortado_core.utils.split_graph import ConcurrencyGroup, Group, SequenceGroup
from pm4py.objects.log.obj import Trace

from api.routes.variants.models import (
    ClusteringAlgorithm,
    ClusteringParameters,
    VariantInformation,
)
from cache import cache, cache_util
from endpoints.alignments import InfixType
from endpoints.load_event_log import create_variant_object


def count_fragment_occurrences(variant, fragment: Group, infixType: InfixType, idx):
    # extract group from variant
    group: Group = variant[1][0]

    # We always need a sequence group as the root of the tree
    # because we use this assumption to check the prefix/postfix
    if not isinstance(group, SequenceGroup):
        group = SequenceGroup(lst=[group])

    return group.countInfixOccurrences(fragment, infixType=infixType, isRootNode=True)


def get_trace_counts(
    variants: Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]],
):
    return list(map(lambda variant: len(variant[1][1]), variants.items()))


def get_fragment_counts(
    variants: Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]],
    fragment: Group,
    infixType: InfixType,
):
    return list(
        map(
            lambda variant: count_fragment_occurrences(
                variant, fragment, infixType, variant[0]
            ),
            variants.items(),
        )
    )


def get_clusterer(params: ClusteringParameters) -> Clusterer:
    if params.algorithm == ClusteringAlgorithm.AGGLOMERATIVE_EDIT_DISTANCE_CLUSTERING:
        max_distance = params.params["maxDistance"]
        clusterer: Clusterer = AgglomerativeEditDistanceClusterer(
            max_distance=max_distance
        )
    elif params.algorithm == ClusteringAlgorithm.LABEL_VECTOR_CLUSTERING:
        n_clusters = params.params["nClusters"]
        clusterer: Clusterer = LabelVectorClusterer(n_clusters=n_clusters)

    return clusterer


def map_clusters(clusters):
    result = []

    for idx, cluster in enumerate(clusters):
        cluster_result = []  # list of variants for a single cluster
        for group in cluster:
            variant_id, variant = cache_util.map_group_to_cached_variant(
                group
            )  # get the cached version

            print(cache.parameters)
            # create object that structure that can be handled by the frontend
            variant, _ = create_variant_object(
                cache.parameters["cur_time_granularity"],
                cache_util.get_log_length(),
                variant_id,
                cache_util.get_variant(variant),
                cache_util.get_traces(variant),
                cache_util.get_variant_info(variant),
            )
            variant["clusterId"] = idx
            cluster_result.append(variant)

        result.append(cluster_result)

    return result
