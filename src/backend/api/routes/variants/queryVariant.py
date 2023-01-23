import cache.cache as cache
from endpoints.query_variant import evaluate_query_against_variant_graphs
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["variantQuery"], prefix="/variantQuery")

class variantQuery(BaseModel):
    queryString: str

@router.post("/variant-query")
def variant_query(query: variantQuery):
    res = evaluate_query_against_variant_graphs(
        query, cache.variants, cache.parameters["activites"]
    )

    for bid in res['ids']: 
        print(cache.variants[bid][0])

    return res
