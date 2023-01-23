from cortado_core.performance.variant_performance import assign_variants_performances
from fastapi import APIRouter
from pydantic import BaseModel

from cache import cache

router = APIRouter(tags=["variantPerformance"], prefix="/variantPerformance")


class InputLogBasedVariantPerformance(BaseModel):
    start: int
    end: int


@router.post("/logBasedVariantPerformance")
async def calculate_log_based_performance(data: InputLogBasedVariantPerformance):
    variants = {bid: var for bid, var in cache.variants.items() if data.start <= bid <= data.end}
    
    
    assign_variants_performances(variants)

    return {bid: v[0].serialize(include_performance=True) for bid, v in variants.items()}
