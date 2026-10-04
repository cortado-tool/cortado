import logging
import pickle
import cache.cache as cache
from backend_utilities.multiprocessing.pool_factory import PoolFactory
import sys

logger = logging.getLogger("uvicorn")


async def start_app() -> None:
    logger.info("---------- Handling startup ----------")
    cache.pcache = {}

    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        cache.variants = pickle.load(open("./_internal/resources/variants.p", "rb"))
        cache.parameters = pickle.load(open("./_internal/resources/parameters.p", "rb"))
    else:
        cache.variants = pickle.load(open("./resources/variants.p", "rb"))
        cache.parameters = pickle.load(open("./resources/parameters.p", "rb"))

    # create process pool
    PoolFactory.instance()

    print("loaded parameters", cache.parameters)


async def stop_app() -> None:
    logger.info("-------- Handling application stop -----------")
