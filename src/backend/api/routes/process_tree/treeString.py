from backend_utilities.process_tree_conversion import (
    dict_to_process_tree,
    process_tree_to_dict,
)
from fastapi import APIRouter
from pm4py.objects.process_tree.utils.generic import parse
from pydantic import BaseModel

router = APIRouter(tags=["treeSting"], prefix="/treeSting")


class InputTreeStringFromTree(BaseModel):
    pt: dict


@router.post("/computeTreeStringFromTree")
async def computeTreeStringFromTree(d: InputTreeStringFromTree):
    res = str(dict_to_process_tree(d.pt)[0])
    return res


class InputTreeFromTreeString(BaseModel):
    pt_string: str


@router.post("/parseStringToPT")
async def parseStringToPT(d: InputTreeFromTreeString):
    res = dict()
    try:
        d.pt_string = d.pt_string.replace("*tau*", "τ")
        pt = parse(d.pt_string)
        res["tree"] = process_tree_to_dict(pt)
        res["errors"] = None
    except:
        res["tree"] = None
        res["errors"] = "Error occurred during backend parsing"

    return res
