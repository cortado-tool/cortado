from cortado_core.variant_query_language.check_query_tree_against_graph import (
    check_query_tree,
)
from cortado_core.variant_query_language.error_handling import LexerError, ParseError
from cortado_core.variant_query_language.parse_query import parse_query_to_query_tree
from cortado_core.utils.split_graph import ConcurrencyGroup
from cortado_core.visual_query_language.query import create_query_instance, QueryType
from cortado_core.visual_query_language.query import PatternQuery
from cortado_core.utils.split_graph import Group

from typing import Tuple, Mapping, Any


def evaluate_query_against_variant_graphs(query, variants, activities):
    ids = []

    try:
        qt = parse_query_to_query_tree(query.queryString)

        for bid, (variant, _, _, info) in variants.items():
            for g in variant.graphs.keys():
                b = check_query_tree(qt, g, activities, True)

                if b:
                    ids.append(bid)
                    break

    except ParseError as PE:
        res = {"error": PE.msg, "error_index": PE.column}
        return res

    except LexerError as LE:
        res = {"error": LE.msg, "error_index": LE.column}
        return res

    return {"ids": ids}


def evaluate_logical_query(
    logical_query: any,
    query_type: QueryType,
    variants: Mapping[int, Tuple[ConcurrencyGroup, Any, Any, Any]],
):
    node_type = logical_query.get("type")
    if node_type == "query":
        pattern = Group.deserialize(logical_query.get("pattern"))
        query = create_query_instance(pattern, query_type=query_type)
        return evaluate_visual_query_against_variant_graphs(query, variants)
    elif node_type == "and":
        results = [
            evaluate_logical_query(child, query_type, variants)
            for child in logical_query.get("children", [])
        ]
        return list(set.intersection(*(set(r) for r in results)) if results else set())
    elif node_type == "or":
        results = [
            evaluate_logical_query(child, query_type, variants)
            for child in logical_query.get("children", [])
        ]
        return list(set.union(*(set(r) for r in results)) if results else set())
    else:
        return []


def evaluate_visual_query_against_variant_graphs(
    query: PatternQuery,
    variants: Mapping[int, Tuple[ConcurrencyGroup, Any, Any, Any]],
):
    try:
        return [
            id for id, (variant, _, _, _) in variants.items() if query.match(variant)
        ]
    except Exception as e:
        return {"error": str(e)}
