import itertools
import pickle
from typing import Optional

import cache.cache as cache
from cortado_core.utils.timestamp_utils import TimeUnit

from endpoints.load_event_log import calculate_event_log_properties
from fastapi import APIRouter
from pm4py.objects.log.obj import EventLog
from pydantic import BaseModel, Field
import sys

router = APIRouter(tags=["Log"], prefix="/log")


class PropertiesParams(BaseModel):
    time_granularity: Optional[TimeUnit] = Field(None, alias="timeGranularity")


@router.post("/properties")
async def get_event_log_properties(params: PropertiesParams):
    traces = list(itertools.chain(*[ts for _, (_, ts, _, _) in cache.variants.items()]))
    log = EventLog(traces, **cache.parameters["log_info"])

    properties, _ = calculate_event_log_properties(log, params.time_granularity)
    return properties


@router.get("/granularity")
async def get_event_log():
    return cache.parameters["cur_time_granularity"]


@router.get("/resetLogCache")
async def reset_log_cache():
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        cache.variants = pickle.load(open("./_internal/resources/variants.p", "rb"))
        cache.parameters = pickle.load(open("./_internal/resources/parameters.p", "rb"))
    else:
        cache.variants = pickle.load(open("src/backend/resources/variants.p", "rb"))
        cache.parameters = pickle.load(open("src/backend/resources/parameters.p", "rb"))
