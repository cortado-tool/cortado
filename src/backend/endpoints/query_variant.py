from cortado_core.variant_query_language.check_query_tree_against_graph import (
    check_query_tree,
)
from cortado_core.variant_query_language.error_handling import LexerError, ParseError
from cortado_core.variant_query_language.parse_query import parse_query_to_query_tree


def evaluate_query_against_variant_graphs(query, variants, activities):
    ids = []

    try:

        qt = parse_query_to_query_tree(query.queryString)

        for bid, (variant, _, _, info) in variants.items():
            if info.is_user_defined:
                continue
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
