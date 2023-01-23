import threading
import ctypes


class TimeoutException(BaseException):
    pass


def execute_with_timeout(func, timeout, args=()):
    result = []
    exception = []

    def func_wrapper(*args_wrapper):
        try:
            result.append(func(*args_wrapper))
        except Exception as e:
            exception.append(e)

    t = threading.Thread(target=func_wrapper, args=args)
    t.start()
    t.join(timeout=timeout)

    if t.is_alive():
        raise_in_thread(t, TimeoutException())

    if len(result) != 0:
        return result[0]

    if len(exception) != 0:
        raise exception[0]

    raise TimeoutException()


def raise_in_thread(thread, exception):
    # see https://stackoverflow.com/questions/36484151/throw-an-exception-into-another-thread
    ret = ctypes.pythonapi.PyThreadState_SetAsyncExc(ctypes.c_long(thread.ident), ctypes.py_object(exception))
    if ret == 0:
        raise ValueError("Invalid thread ID")
    elif ret > 1:
        ctypes.pythonapi.PyThreadState_SetAsyncExc(thread.ident, None)
        raise SystemError("PyThreadState_SetAsyncExc failed")
