"""extend project_files structure

Revision ID: e1b0d4c3f9a1
Revises: c9e2f1d4a8b7
Create Date: 2026-03-07 11:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e1b0d4c3f9a1"
down_revision: Union[str, None] = "c9e2f1d4a8b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("project_files", sa.Column("filename", sa.String(length=255), nullable=True))
    op.add_column("project_files", sa.Column("parent_path", sa.Text(), nullable=True))
    op.add_column("project_files", sa.Column("content_type", sa.String(length=30), nullable=False, server_default="other"))
    op.add_column("project_files", sa.Column("is_directory", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.create_index(op.f("ix_project_files_parent_path"), "project_files", ["parent_path"], unique=False)

    op.execute("UPDATE project_files SET filename = name WHERE filename IS NULL")
    op.execute("UPDATE project_files SET is_directory = (file_type = 'folder')")
    op.execute("UPDATE project_files SET content_type = 'terraform' WHERE path LIKE '%.tf'")
    op.execute("UPDATE project_files SET content_type = 'terragrunt' WHERE path LIKE '%.hcl'")
    op.execute("UPDATE project_files SET content_type = 'markdown' WHERE path LIKE '%.md'")
    op.execute("UPDATE project_files SET content_type = 'folder' WHERE is_directory = true")

    op.alter_column("project_files", "filename", nullable=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_project_files_parent_path"), table_name="project_files")
    op.drop_column("project_files", "is_directory")
    op.drop_column("project_files", "content_type")
    op.drop_column("project_files", "parent_path")
    op.drop_column("project_files", "filename")
