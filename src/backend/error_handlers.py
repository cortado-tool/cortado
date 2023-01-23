from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError

from backend_utilities.util import build_json_error_rsp, get_trace


async def http_exception_handler(request: Request, exc: HTTPException):
    return build_json_error_rsp(exc.detail, get_trace(exc), exc.status_code)


async def exception_handler(request: Request, exc: Exception):
    return build_json_error_rsp(str(exc), get_trace(exc), 500)


async def validation_exception_handler(request, exc: RequestValidationError):
    return build_json_error_rsp(exc.errors(), get_trace(exc), status_code=422)
