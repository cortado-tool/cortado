import logging
import pickle
from typing import Callable
import cache.cache as cache
from backend_utilities.multiprocessing.pool_factory import PoolFactory
from fastapi import FastAPI
import sys

logger = logging.getLogger("uvicorn")


def create_start_app_handler(
    app: FastAPI,
) -> Callable:
    async def start_app() -> None:
        logger.info("---------- Handling startup ----------")
        cache.pcache = {}

        if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
            cache.variants = pickle.load(open("./_internal/resources/variants.p", "rb"))
            cache.parameters = pickle.load(
                open("./_internal/resources/parameters.p", "rb")
            )
        else:
            #/home/ADMSK/ayisayev1/Downloads/AI/Code/cortado-main/src/backend/resources/variants.p
            #src/backend/resources/variants.p
            cache.variants = pickle.load(open("src/backend/resources/variants.p", "rb"))
            cache.parameters = pickle.load(open("src/backend/resources/parameters.p", "rb"))

        # create process pool
        PoolFactory.instance()

        # print("loaded parameters", cache.parameters)

    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        logger.info("-------- Handling application stop -----------")

    return stop_app
