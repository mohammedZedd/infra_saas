"""merge migration heads

Revision ID: 2b9f64a879a6
Revises: 20260308_01, ead2583b604d
Create Date: 2026-03-08 02:37:05.476263

"""
from typing import Sequence, Union
from uuid import UUID

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b9f64a879a6'
down_revision: Union[str, None] = ('20260308_01', 'ead2583b604d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
