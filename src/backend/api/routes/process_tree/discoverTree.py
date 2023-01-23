import multiprocessing
from typing import Any, List

from cortado_core.process_tree_utils.reduction import apply_reduction_rules
from cortado_core.utils.sequentializations import generate_sequentializations
from cortado_core.utils.split_graph import Group

from backend_utilities.configuration.repository import ConfigurationRepositoryFactory
from backend_utilities.multiprocessing.pool_factory import PoolFactory
from backend_utilities.process_tree_conversion import (
    dict_to_process_tree,
    process_tree_to_dict,
)
from backend_utilities.variant_trace_conversion import variant_to_trace
from cortado_core.utils.alignment_utils import trace_fits_process_tree
from endpoints.add_variants_to_process_model import add_variants_to_process_model
from fastapi import APIRouter
from pm4py.discovery import discover_process_tree_inductive
from pm4py.objects.log.obj import Event, EventLog, Trace
from pm4py.objects.process_tree.obj import ProcessTree
from pydantic import BaseModel

router = APIRouter(tags=["discoverTree"], prefix="/discoverTree")


class InputDiscoverProcessModelFromVariants(BaseModel):
    variants: List[Any]


def discover_process_model_from_variants(variants):
    log = EventLog()
    for v in variants:
        t = Trace()
        for e in v:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        log.append(t)
    pt: ProcessTree = discover_process_tree_inductive(log)
    apply_reduction_rules(pt)
    res = process_tree_to_dict(pt)
    return res


@router.post("/discoverProcessModelFromConcurrencyVariants")
async def discover_process_model_from_cvariants(
        d: InputDiscoverProcessModelFromVariants,
):
    config = ConfigurationRepositoryFactory().get_config_repository().get_configuration()
    n_sequentializations = -1 if not config.is_n_sequentialization_reduction_enabled else config.number_of_sequentializations_per_variant

    all_variants = set(
        [
            tuple(variant)
            for cvariant in d.variants
            for variant in
            generate_sequentializations(Group.deserialize(cvariant), n_sequentializations=n_sequentializations)
        ]
    )
    print(f"nVariants: {len(all_variants)}")
    res = discover_process_model_from_variants(all_variants)
    return res


class InputAddVariantsToProcessModel(BaseModel):
    fitting_variants: List[Any]
    variants_to_add: List[Any]
    pt: dict


@router.post("/addConcurrencyVariantsToProcessModel")
async def add_cvariants_to_process_model(d: InputAddVariantsToProcessModel):
    config = ConfigurationRepositoryFactory().get_config_repository().get_configuration()
    n_sequentializations = -1 if not config.is_n_sequentialization_reduction_enabled else config.number_of_sequentializations_per_variant
    fitting_variants = set(
        [
            tuple(variant)
            for cvariant in d.fitting_variants
            for variant in
            generate_sequentializations(Group.deserialize(cvariant), n_sequentializations=n_sequentializations)
        ]
    )
    to_add = set(
        [
            tuple(variant)
            for cvariant in d.variants_to_add
            for variant in
            generate_sequentializations(Group.deserialize(cvariant), n_sequentializations=n_sequentializations)
        ]
    )
    return add_variants_to_process_model(d.pt, fitting_variants, to_add, PoolFactory.instance().get_pool())


class InputAddVariantsToProcessModelUnknownConformance(BaseModel):
    selected_variants: List[Any]
    pt: dict


@router.post("/addConcurrencyVariantsToProcessModelUnknownConformance")
async def add_cvariants_to_process_model_unknown_conformance(
        d: InputAddVariantsToProcessModelUnknownConformance,
):
    config = ConfigurationRepositoryFactory().get_config_repository().get_configuration()
    n_sequentializations = -1 if not config.is_n_sequentialization_reduction_enabled else config.number_of_sequentializations_per_variant
    selected_variants = set(
        [
            tuple(variant)
            for cvariant in d.selected_variants
            for variant in
            generate_sequentializations(Group.deserialize(cvariant), n_sequentializations=n_sequentializations)
        ]
    )

    fitting_variants = set()
    variants_to_add = set()
    process_tree, _ = dict_to_process_tree(d.pt)
    for selected_variant in selected_variants:
        t = variant_to_trace(selected_variant)
        if trace_fits_process_tree(t, process_tree):
            fitting_variants.add(selected_variant)
        else:
            variants_to_add.add(selected_variant)

    return add_variants_to_process_model(d.pt, fitting_variants, variants_to_add, PoolFactory.instance().get_pool())
