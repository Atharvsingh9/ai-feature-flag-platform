from enum import Enum

from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from infrastructure.database.base import Base
from infrastructure.database.mixins import TimestampMixin


class FlagStatus(str, Enum):
    OFF = "OFF"
    ROLLING_OUT = "ROLLING_OUT"
    PAUSED = "PAUSED"
    ROLLED_BACK = "ROLLED_BACK"
    FULLY_ON = "FULLY_ON"


class Flag(TimestampMixin, Base):
    __tablename__ = "flags"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    status: Mapped[FlagStatus] = mapped_column(
        SQLEnum(FlagStatus),
        default=FlagStatus.OFF,
        nullable=False,
    )

    rollout_percentage: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    quality_threshold: Mapped[float] = mapped_column(
        Float,
        default=4.0,
        nullable=False,
    )

    baseline_variant: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    experimental_variant: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )