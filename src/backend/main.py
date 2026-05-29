import os
from multiprocessing import cpu_count, freeze_support

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    exception_handler,
)
from api.routes.api import router as api_router
from core.events import create_start_app_handler, create_stop_app_handler
from error_handlers import http_exception_handler, validation_exception_handler
from middleware.http_middleware import http_middleware
import argparse

CORTADO_DEBUG = os.getenv("CORTADO_DEBUG", "0") == "1"


def get_application():
    app = FastAPI()
    add_event_handlers(app)
    add_middleware(app)
    add_exception_handlers(app)
    app.include_router(api_router)
    return app


def add_event_handlers(app: FastAPI):
    app.add_event_handler(
        "startup",
        create_start_app_handler(app),
    )
    app.add_event_handler(
        "shutdown",
        create_stop_app_handler(app),
    )


def add_middleware(app: FastAPI):
    app.middleware("http")(http_middleware)
    origins = ["http://localhost", "http://localhost:8080", "http://localhost:4444"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def add_exception_handlers(app: FastAPI):
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, exception_handler)


app = get_application()


@app.get("/info")
async def get_info():
    return {}


# Using FastAPI instance
@app.get("/url-list")
def get_all_urls():
    url_list = [{"path": route.path, "name": route.name} for route in app.routes]
    return url_list


if __name__ == "__main__":
    # IMPORTANT: No other code between the `if __name__ == '__main__'` and freeze_support()
    freeze_support()
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--WEBSERVER_PORT",
        default="40000",
        type=int,
        help="Specify the webserver port, defaults to  40000",
    )
    args = parser.parse_args()

    import os
    os.environ["CORTADO_DEBUG"] = "1"

    # print(DEFAULT_LP_SOLVER_VARIANT)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        # host="127.0.0.1",
        port=args.WEBSERVER_PORT,
        workers=1,
        reload=CORTADO_DEBUG,
    )
    # dev mode
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
