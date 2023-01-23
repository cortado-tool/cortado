from backend_utilities.process_tree_conversion import (
    dict_to_process_tree,
    process_tree_to_dict,
)
from cortado_core.freezing.reinsert_frozen_subtrees import post_process_tree
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["modifyTree"], prefix="/modifyTree")


class ReduceData(BaseModel):
    pt: dict


@router.post("/applyReductionRulesToTree")
async def applyTreeReductionRules(d: ReduceData):
    pt, frozen_subtrees = dict_to_process_tree(d.pt)
    return process_tree_to_dict(post_process_tree(pt, frozen_subtrees), frozen_subtrees)
