#core data models for ai feature flags
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import UUID, uuid4
from enum import Enum

class FlagStatus(str, Enum):

    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ROLLED_BACK = "rolled_back"

class ConfigurationType(str, Enum):

    PROMPT = "prompt"
    MODEL = "model"
    PIPELINE = "pipeline"
    AGENT="agent"

@dataclass(frozen=True, slots=True)
class VariantConfiguration:
   
   type: ConfigurationType
   version: str
   config: dict[str, Any]

@dataclass(frozen=True, slots=True)
class RollbackTrigger:

    enabled: bool
    min_quality_score: float=0.70
    evaluation_window: int=100

def __post_init__(self) -> None:
        if not 0.0 <= self.min_quality_score <=1.0:
             raise ValueError("min_quality_score must be between 0.0 and 1.0")
        if self.evaluation_window <= 0:
                raise ValueError("evaluation_window must be greater than 0")

@dataclass(frozen=True, slots=True)
class AIFlag:
     
     name: str
     rollout_percentage: float
     quality_threshold: float
     baseline: VariantConfiguration

     description: str=""
     enabled: bool= False
     rollback_trigger: RollbackTrigger = field(_default_factory=RollbackTrigger)

     status: FlagStatus=FlagStatus.DRAFT
     id: UUID = field(default_factory=uuid4)

     def __post_init__(self) -> None:
          if not self.name.strip():
               raise  ValueError("Flag Cannot be empty")
          
          if not 0.0 <= self.rollout_percentage <= 100.0:
               raise ValueError(
                    "rollout_percentage must be between 0.0 and 100.0"
               )
          if not 0.0 <= self.quality_threshold <= 1.0:
               raise ValueError(
                    "quality_threshold must be between 0.0 and 1.0"
               )