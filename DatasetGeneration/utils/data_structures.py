from pydantic import BaseModel, field_validator , ValidationInfo
import config


class Event(BaseModel):
    target : str
    event : str
    severity : float
    onset_time_ratio : float


    @field_validator('event', mode='before')
    def is_valid_event(cls, event: str) -> str:
        if event not in config.POSSIBLE_EVENTS:
            raise ValueError(f'event = {event} is invalid')
        return event

    @field_validator('target', mode='before')
    def is_valid_target(cls, target: str) -> str:
        if target not in config.STATE:
            raise ValueError(f'event = {target} is invalid')
        return target

    @field_validator('severity', 'onset_time_ratio', mode='before')
    def is_in_unit_interval(cls, value: float, info: ValidationInfo) -> float:
        if 0 <= value <= 1:
            return value
        raise ValueError(f'{info.field_name} = {value} is invalid')



class Scenario(BaseModel):
    events : list[Event]
    seed : int
    duration : int # in seconds


class DatasetConfig(BaseModel):
    n_samples: int
    distribution: dict[str, float]
    test_size : int = 0.2

    @field_validator("distribution", mode="before")
    def verify(cls, distribution: dict[str, float]):
        expected = {
            "nominal",
            "single_event",
            "multi_event_coherent"
        }

        if set(distribution.keys()) != expected:
            raise ValueError(
                f"invalid distribution keys = {distribution.keys()}"
            )

        if not all(0 <= value <= 1 for value in distribution.values()):
            raise ValueError(
                f"distribution values must be in [0, 1]: {distribution}"
            )

        if abs(sum(distribution.values()) - 1.0) > 1e-6:
            raise ValueError(
                f"distribution must sum to 1: {distribution}"
            )

        return distribution


class Breach(BaseModel):
    relevant_columns: list[str]

    @field_validator("relevant_columns", mode="before")
    @classmethod
    def check_columns(cls, relevant_columns):
        if len(relevant_columns) < 2:
            raise ValueError("a breach must involve at least two columns")

        invalid = [
            column
            for column in relevant_columns
            if column not in config.STATE
        ]

        if invalid:
            raise ValueError(f"invalid columns = {invalid}")

        return relevant_columns

from pydantic import BaseModel, field_validator
from config import STATE


class Measurements(BaseModel):
    measurements: dict[str, list[float]]

    @field_validator("measurements", mode="before")
    @classmethod
    def validate_measurements_format(cls, measurements):
        if set(measurements.keys()) == set(STATE):
            return measurements
        raise ValueError(f"invalid measurements = {measurements}")