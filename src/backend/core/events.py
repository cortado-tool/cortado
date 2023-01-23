import logging
import pickle
from typing import Callable

import cache.cache as cache
from backend_utilities.multiprocessing.pool_factory import PoolFactory

from endpoints import load_event_log
from fastapi import FastAPI

logger = logging.getLogger("uvicorn")


def create_start_app_handler(
    app: FastAPI,
) -> Callable:
    async def start_app() -> None:
        logger.info("---------- Handling startup ----------")
        cache.pcache = {}
        cache.variants = pickle.load(open("./resources/variants.p", "rb"))
        cache.parameters = pickle.load(open("./resources/parameters.p", "rb"))
        # create process pool
        PoolFactory.instance()
        
        print('loaded parameters', cache.parameters)
    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        logger.info("-------- Handling application stop -----------")
    return stop_app