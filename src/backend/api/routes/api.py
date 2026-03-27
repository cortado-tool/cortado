"""Import routes here"""

from fastapi import APIRouter

from api.websocket import main as websocket
from api.routes.configuration import configuration
from api.routes.conformance import treeConformance
from api.routes.input_output import exporting, importing
from api.routes.log import log, modifyLog
from api.routes.performance import (
    subvariantPerformance,
    treePerformance,
    variantPerformance,
)
from api.routes.process_tree import discoverTree, modifyTree, treeString
from api.routes.variants import (
    variants,
    queryVariant,
    subvariantMining,
    sequentializer,
    lpmMiner,
)
from api.websocket import main

router = APIRouter()
router.include_router(log.router)
router.include_router(modifyLog.router)
router.include_router(exporting.router)
router.include_router(importing.router)
router.include_router(configuration.router)

router.include_router(main.router)
router.include_router(treeConformance.router)
router.include_router(treePerformance.router)
router.include_router(subvariantPerformance.router)
router.include_router(variantPerformance.router)
router.include_router(discoverTree.router)
router.include_router(modifyTree.router)
router.include_router(treeString.router)
router.include_router(variants.router)
router.include_router(queryVariant.router)
router.include_router(subvariantMining.router)
router.include_router(sequentializer.router)
router.include_router(lpmMiner.router)
router.include_router(websocket.router)
