import logging
import traceback

from fastapi import Request

from backend_utilities.util import build_json_error_rsp, get_trace

logger = logging.getLogger("uvicorn")


async def http_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(
            "".join(
                traceback.format_exception(etype=type(e), value=e, tb=e.__traceback__)
            )
        )
        return build_json_error_rsp(str(e), get_trace(e), 500)
