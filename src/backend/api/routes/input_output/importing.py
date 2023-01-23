from collections import defaultdict

from cortado_core.utils.collapse_variants import collapse_variant

import cache.cache as cache
import pm4py.objects.log.importer.xes.importer as xes_importer
from backend_utilities.configuration.repository import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)
from backend_utilities.process_tree_conversion import process_tree_to_dict
from endpoints.load_event_log import calculate_event_log_properties
from fastapi import APIRouter, Depends, File, UploadFile
from pm4py.objects.log.importer.xes.importer import apply as xes_import
from pm4py.objects.process_tree.importer.importer import apply as import_pt_from_ptml
from pydantic import BaseModel

router = APIRouter(tags=["importing"], prefix="/importing")


def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()


@router.post("/uploadfile")
async def create_upload_file(
        file: UploadFile = File(...),
        config_repo: ConfigurationRepository = Depends(get_config_repo),
):
    cache.pcache = {}

    content = "".join([line.decode("UTF-8") for line in file.file])
    event_log = xes_importer.deserialize(content)
    use_mp = (
            len(event_log) > config_repo.get_configuration().min_traces_variant_detection_mp
    )
    info = calculate_event_log_properties(event_log, use_mp=use_mp)
    return info


class FilePathInput(BaseModel):
    file_path: str


@router.post("/loadEventLog")
async def load_event_log_from_file_path(
        d: FilePathInput, config_repo: ConfigurationRepository = Depends(get_config_repo)
):
    cache.pcache = {}
    event_log = xes_import(d.file_path)

    use_mp = (
            len(event_log) > config_repo.get_configuration().min_traces_variant_detection_mp
    )
    info = calculate_event_log_properties(event_log, use_mp=use_mp)
    return info


@router.post("/loadProcessTreeFromPtmlFile")
async def load_process_tree_from_file_path(d: FilePathInput):
    pt = import_pt_from_ptml(d.file_path)
    res = process_tree_to_dict(pt)
    return res


@router.get("/collapsedVariants")
async def load_loop_collapsed_variants():
    collapsed_variants = defaultdict(list)

    for bid, (variant, _, _, info) in cache.variants.items():
        collapsed_variant = collapse_variant(variant)
        collapsed_variants[(collapsed_variant, info.infix_type)].append(bid)

    return [{'variant': v.serialize(), 'ids': bids} for (v, _), bids in collapsed_variants.items()]
