import time
import unittest

from backend.backend_utilities.timeout.helper_functions import (
    TimeoutException,
    execute_with_timeout,
)


class TimeoutTest(unittest.TestCase):
    def test_raise_exception_when_timeout_occurs(self):
        def test_func():
            try:
                time.sleep(5)
            except TimeoutException as t:
                self.assertIsInstance(t, TimeoutException)

        try:
            execute_with_timeout(test_func, 1)
        except TimeoutException as t:
            self.assertIsInstance(t, TimeoutException)

    def test_return_result_if_timeout_does_not_occur(self):
        def test_func() -> int:
            return 5

        result = execute_with_timeout(test_func, 10)
        self.assertEqual(result, 5)

    def test_raise_exception_from_inner_func_if_timeout_does_not_occur_before(self):
        def test_func() -> int:
            raise Exception("inner_exception")

        try:
            execute_with_timeout(test_func, 10)
        except Exception as e:
            self.assertEqual(str(e), "inner_exception")

    def test_can_handle_function_with_arguments(self):
        def test_func(a: int, b: int) -> int:
            return a + b

        result = execute_with_timeout(test_func, 5, args=(2, 6))
        self.assertEqual(result, 8)


if __name__ == "__main__":
    unittest.main()
