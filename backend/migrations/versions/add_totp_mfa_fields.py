"""Add TOTP MFA fields to users table

Revision ID: add_totp_mfa_fields
Revises: 
Create Date: 2026-02-02 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_totp_mfa_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add totp_secret column (nullable string)
    op.add_column('users', sa.Column('totp_secret', sa.String(32), nullable=True))
    
    # Add mfa_enabled column (boolean with default False)
    op.add_column('users', sa.Column('mfa_enabled', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    # Remove columns in reverse order
    op.drop_column('users', 'mfa_enabled')
    op.drop_column('users', 'totp_secret')
