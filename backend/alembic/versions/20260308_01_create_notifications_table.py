"""
Create notifications table
"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
import uuid

# revision identifiers, used by Alembic.
revision = '20260308_01'
down_revision = 'e1b0d4c3f9a1'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'notifications',
        sa.Column('id', pg.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', pg.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('type', sa.Enum(
            'project_created', 'terraform_plan_success', 'terraform_plan_failed',
            'terraform_apply_success', 'terraform_apply_failed', 'resource_limit_warning',
            'team_invite', 'system_update', 'cost_alert',
            name='notificationtype'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('read', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('project_id', pg.UUID(as_uuid=True), sa.ForeignKey('projects.id'), nullable=True),
        sa.Column('project_name', sa.String(255), nullable=True),
        sa.Column('action_url', sa.String(255), nullable=True),
    )

def downgrade():
    op.drop_table('notifications')
