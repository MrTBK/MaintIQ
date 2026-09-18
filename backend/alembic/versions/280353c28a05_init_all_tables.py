"""init all tables (metadata-driven; autogenerate saw a pre-created dev DB)

Revision ID: 280353c28a05
Revises:
Create Date: 2026-09-18 05:18:18.890393

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '280353c28a05'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all tables from model metadata (fresh databases)."""
    from app.db import Base
    import app.models  # noqa: F401 -- register tables
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    """Drop all tables."""
    from app.db import Base
    import app.models  # noqa: F401
    Base.metadata.drop_all(bind=op.get_bind())
