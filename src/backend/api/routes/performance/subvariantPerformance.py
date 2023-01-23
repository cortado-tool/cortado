import cache.cache as cache
from cortado_core.performance.subvariant_performance import (
    calculate_subvariant_performance,
)
from fastapi import APIRouter
from pydantic import BaseModel, Field
from cortado_core.utils.cvariants import get_detailed_variants

router = APIRouter(tags=["subvariantPerformance"], prefix="/subvariantPerformance")


class InputPerformanceSubvariant(BaseModel):
    bid: int


@router.post("/subvariants")
async def get_subvariants(data: InputPerformanceSubvariant):
    
    sub_variants = cache.variants[data.bid][2]
    result = []

    total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

    for subvariant, traces in sub_variants.items():
        subvariant_performance = calculate_subvariant_performance(
            subvariant, traces, cache.parameters["cur_time_granularity"]
        )
        subvariant_response = {
            "variant": subvariant_performance,
            "count": len(traces),
            "percentage": round(len(traces) / total_sub_traces * 100, 2),
        }
        result.append(subvariant_response)

    return sorted(result, key=lambda x: x["count"], reverse=True)
