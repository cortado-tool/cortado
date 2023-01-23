from cortado_core.utils.split_graph import LeafGroup, LoopGroup, ParallelGroup, SequenceGroup

import cache.cache as cache
from fastapi import APIRouter
from pydantic import BaseModel

from cortado_core.subprocess_discovery.subtree_mining.treebank import (
    create_treebank_from_cv_variants,
)
from cortado_core.subprocess_discovery.subtree_mining.right_most_path_extension.min_sub_mining import (
    min_sub_mining,
)
from cortado_core.subprocess_discovery.subtree_mining.obj import (
    FrequencyCountingStrategy,
)
from cortado_core.subprocess_discovery.subtree_mining.maximal_connected_components.maximal_connected_check import (
    set_maximaly_closed_patterns,
)
from cortado_core.subprocess_discovery.subtree_mining.output import (
    dataframe_from_k_patterns,
)
from cortado_core.subprocess_discovery.subtree_mining.blanket_mining.cm_grow import (
    cm_min_sub_mining,
)
from cortado_core.subprocess_discovery.subtree_mining.folding_label import (
    fold_loops
)

import cache.cache as cache
import numpy as np

router = APIRouter(tags=["subvariantMining"], prefix="/subvariantMining")


class VariantMinerConfig(BaseModel):
    size: int
    min_sup: int
    strat: int
    algo: int
    loop: int
    algo_type: int
    artifical_start: bool


freq_strat_mapping = {
    1: FrequencyCountingStrategy.TraceTransaction,
    2: FrequencyCountingStrategy.VariantTransaction,
    3: FrequencyCountingStrategy.TraceOccurence,
    4: FrequencyCountingStrategy.VariantOccurence,
}


@router.post("/frequentSubtreeMining")
def mineFrequentSubtrees(config: VariantMinerConfig):
    print(config)

    print("K:", config.size)
    print("min_sup:", config.min_sup)
    print("Strat:", freq_strat_mapping[config.strat])
    print("Mining Algo:", config.algo)
    print("Loop", config.loop)
    print("Artif. Start", config.artifical_start)

    variants = {v: ts for _, (v, ts, _, info) in cache.variants.items() if not info.is_user_defined}

    treeBank = create_treebank_from_cv_variants(variants, config.artifical_start)

    if config.loop:
        print('Folding Loops...')
        fold_loops(treeBank, config.loop)

    print()

    if config.algo == 1:
        print("Mining K Patterns...")
        k_patterns = min_sub_mining(
            treeBank,
            frequency_counting_strat=freq_strat_mapping[config.strat],
            k_it=config.size,
            min_sup=config.min_sup,
        )

    else:

        print("Mining CM K Patterns...")
        k_patterns = cm_min_sub_mining(
            treeBank,
            frequency_counting_strat=freq_strat_mapping[config.strat],
            k_it=config.size,
            min_sup=config.min_sup,
        )

    print()
    print('Post-Processing...')
    set_maximaly_closed_patterns(k_patterns)

    df = dataframe_from_k_patterns(k_patterns)

    if not df.empty:

        df = df[df.valid]

        df['bids'] = df.obj.apply(lambda x: set(x.rmo.keys()))

        df.obj = df.obj.apply(
            lambda x: replace_loops_by_loop_group(x.to_concurrency_group()).serialize(include_performance=False)
        )
        df = df.replace({np.nan: None})

        df_dict = df.to_dict(orient="records")

    else:
        df_dict = False

    return df_dict


def replace_loops_by_loop_group(group):
    result = group
    if isinstance(group, LeafGroup):
        if group.number_of_activities() == 1 and group[0].endswith('_LOOP'):
            result = LoopGroup([LeafGroup([group[0][:-5]])])

        return result

    if isinstance(group, ParallelGroup):
        return ParallelGroup([replace_loops_by_loop_group(g) for g in group])

    if isinstance(group, SequenceGroup):
        return SequenceGroup([replace_loops_by_loop_group(g) for g in group])

    raise Exception('Group type is unknown')
