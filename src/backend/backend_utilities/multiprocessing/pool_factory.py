import multiprocessing

from backend_utilities.multiprocessing.singleton import Singleton


@Singleton
class PoolFactory:
    def __init__(self):
        self.pool = multiprocessing.Pool()

    def get_pool(self):
        return self.pool

    def restart_pool(self):
        self.pool.terminate()
        self.pool.join()

        self.pool = multiprocessing.Pool()
