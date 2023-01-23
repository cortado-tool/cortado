from typing import List, Any

from cortado_core.utils.split_graph import Group
from fastapi import Response, status

import cache.cache
from api.routes.variants.variants import VariantInformation
from endpoints.alignments import InfixType
from endpoints.transform_event_log import (
    cache_current_data,
    remove_activities,
    remove_variant,
    rename_activities,
    reset_last_transaction,
)
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Log"], prefix="/modifylog")


class ChangeActivityName(BaseModel):
    mergeList: List[List[int]]
    renameList: List[int]
    activityName: str
    newActivityName: str


@router.post("/changeActivityName")
async def change_activity_name_in_log(d: ChangeActivityName):
    cache_current_data()

    update_map = rename_activities(
        d.mergeList, d.renameList, d.activityName, d.newActivityName
    )

    # TODO Return an Error if needed
    return update_map


class removeActivityName(BaseModel):
    activityName: str
    fallthrough: List[int]
    delete_member_list: List[int]
    merge_list: List[List[int]]
    delete_variant_list: List[int]


@router.post("/deleteActivity")
async def remove_activity_name_in_log(d: removeActivityName):
    cache_current_data()

    res = remove_activities(
        d.activityName,
        d.fallthrough,
        d.delete_member_list,
        d.merge_list,
        d.delete_variant_list,
    )

    return res


class removeVariants(BaseModel):
    bids: List[int]


@router.post("/deleteVariants")
async def removeVariants(d: removeVariants):
    cache_current_data()

    res = remove_variant(d.bids)

    return res


@router.post("/revertLastChange")
async def removeVariants():
    res = reset_last_transaction()

    return res


class userDefinedVariant(BaseModel):
    variant: Any
    bid: int


@router.post("/addUserDefinedVariant", status_code=201)
async def remove_activity_name_in_log(request: userDefinedVariant, response: Response):
    v = Group.deserialize(request.variant)
    if request.bid in cache.cache.variants:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return

    cache.cache.variants[request.bid] = (
        v, [], dict(), VariantInformation(infix_type=InfixType.NOT_AN_INFIX, is_user_defined=True))
    return


class userDefinedInfix(BaseModel):
    variant: Any
    bid: int
    infixType: int


@router.post("/addUserDefinedInfix", status_code=201)
async def remove_activity_name_in_log(request: userDefinedInfix, response: Response):
    v = Group.deserialize(request.variant)
    if request.bid in cache.cache.variants:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return

    infix_type = InfixType(request.infixType)

    cache.cache.variants[request.bid] = (v, [], dict(), VariantInformation(infix_type=infix_type, is_user_defined=True))
    return
