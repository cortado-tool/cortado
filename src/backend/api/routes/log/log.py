import itertools
import pickle
from typing import Optional

import cache.cache as cache
from cortado_core.utils.timestamp_utils import TimeUnit

from endpoints.load_event_log import calculate_event_log_properties
from fastapi import APIRouter
from pm4py.objects.log.obj import EventLog
from pydantic import BaseModel, Field

router = APIRouter(tags=["Log"], prefix="/log")


class PropertiesParams(BaseModel):
    time_granularity: Optional[TimeUnit] = Field(alias="timeGranularity")


@router.post("/properties")
async def get_event_log_properties(params: PropertiesParams):

    traces = list(itertools.chain(*[ts for _, (_, ts, _, _) in cache.variants.items()]))
    log = EventLog(traces, **cache.parameters["log_info"])

    properties = calculate_event_log_properties(log, params.time_granularity)
    return properties


@router.get("/granularity")
async def get_event_log():
    return cache.parameters["cur_time_granularity"]


@router.get("/resetLogCache")
async def reset_log_cache():
    cache.variants = pickle.load(open("./resources/variants.p", "rb"))
    cache.parameters = pickle.load(open("./resources/parameters.p", "rb"))
