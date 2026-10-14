import pytest

from app.middleware import reset_rate_limits
from app.seed import run as seed_db


@pytest.fixture(scope="session", autouse=True)
def _init_test_database():
    seed_db()


@pytest.fixture(autouse=True)
def _fresh_rate_limits():
    reset_rate_limits()
    yield
    reset_rate_limits()

