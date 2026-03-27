import cache.cache as cache
from endpoints.query_variant import (
    evaluate_logical_query,
    evaluate_query_against_variant_graphs,
)
from fastapi import APIRouter
from pydantic import BaseModel
from cortado_core.visual_query_language.query import create_query_instance, QueryType

from endpoints.query_variant import evaluate_visual_query_against_variant_graphs
from cortado_core.utils.split_graph import Group
from typing import Any

router = APIRouter(tags=["variantQuery"], prefix="/variantQuery")


class variantQuery(BaseModel):
    queryString: str


class visualQuery(BaseModel):
    pattern: Any = None
    type: Any = None


@router.post("/variant-query")
def variant_query(query: variantQuery):
    res = evaluate_query_against_variant_graphs(
        query, cache.variants, cache.parameters["activites"]
    )
    print(res)
    for bid in res["ids"]:
        print(cache.variants[bid][0])

    return res


@router.post("/queryPattern")
def query_pattern(query: visualQuery):
    print("Received visual query:", query)
    pattern = Group.deserialize(query.pattern)
    print("Deserialized pattern:", pattern)
    query_type = QueryType[query.type]
    query = create_query_instance(pattern, query_type=query_type)
    result = evaluate_visual_query_against_variant_graphs(query, cache.variants)
    print("Query result:", result)
    return result


@router.post("/queryLogicalPattern")
def query_logical_pattern(query: visualQuery):
    query_type = QueryType[query.type]
    return evaluate_logical_query(
        logical_query=query.pattern,
        query_type=query_type,
        variants=cache.variants,
    )
