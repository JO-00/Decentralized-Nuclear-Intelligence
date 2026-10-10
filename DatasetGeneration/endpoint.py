# main.py  (only the endpoint changed)
import csv
import io
import random
from typing import Optional

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from utils.possible_scenarios import SCENARIOS
from DatasetGeneration.dataset_helpers import (
    generate_nominal,
    generate_single_event,
    generate_multi,
    generate_curves,
    sample_curve,
)

app = FastAPI(title="Dataset Generator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SIGNAL_NAMES = [
    "power", "neutron_flux", "control_rod_position",
    "coolant_flow", "temperature", "pressure", "pump_state",
]
N_SENSORS = 10
N_SAMPLES_PER_SIGNAL = 10
COLUMNS = [f"{s}{i}" for s in SIGNAL_NAMES for i in range(1, N_SENSORS + 1)]
SAMPLING_FREQUENCY = 1.0


def valid_scenario_names() -> set[str]:
    names = {"nominal"}
    names |= set(SCENARIOS["single_event"].keys())
    names |= set(SCENARIOS["multi_event"]["coherent"].keys())
    return names


def allocate_counts(total: int, fractions: dict[str, float]) -> dict[str, int]:
    raw = {k: v * total for k, v in fractions.items()}
    floor = {k: int(v) for k, v in raw.items()}
    leftover = total - sum(floor.values())
    order = sorted(raw, key=lambda k: raw[k] - floor[k], reverse=True)
    for k in order[:leftover]:
        floor[k] += 1
    return floor


def make_scenario(name: str, rng: random.Random):
    seed = rng.randint(1, 1_000_000)

    if name == "nominal":
        return generate_nominal(seed=seed), {
            "name": name, "seed": seed,
            "events": [], "severities": [], "onset_time_ratios": [],
        }

    if name in SCENARIOS["single_event"]:
        severity = rng.uniform(0.5, 1.0)
        onset = rng.uniform(0.0, 0.2)
        return generate_single_event(
            event_name=name, severity=severity,
            onset_time_ratio=onset, seed=seed,
        ), {
            "name": name, "seed": seed,
            "events": [name], "severities": [severity],
            "onset_time_ratios": [onset],
        }

    template = SCENARIOS["multi_event"]["coherent"][name][0]
    n = len(template.events)
    severities = tuple(rng.uniform(0.0, 1.0) for _ in range(n))
    onsets = tuple(rng.uniform(0.0, 1.0) for _ in range(n))

    return generate_multi(
        scenario_name=name, severities=severities,
        onset_time_ratios=onsets, seed=seed,
    ), {
        "name": name, "seed": seed,
        "events": [e.event for e in template.events],
        "severities": list(severities),
        "onset_time_ratios": list(onsets),
    }


class GenerateRequest(BaseModel):
    n_samples: int = Field(..., gt=0)
    fractions: dict[str, float]
    seed: Optional[int] = None


@app.post("/generate")
def generate(req: GenerateRequest):
    assert req.fractions, "fractions must not be empty"

    unknown = set(req.fractions) - valid_scenario_names()
    assert not unknown, f"unknown scenario names: {sorted(unknown)}"

    total = sum(req.fractions.values())
    assert abs(total - 1.0) < 1e-6, f"fractions must sum to 1.0, got {total}"

    assert all(0.0 <= v <= 1.0 for v in req.fractions.values())

    counts = allocate_counts(req.n_samples, req.fractions)
    rng = random.Random(req.seed)

    rows = []
    for name, count in counts.items():
        for _ in range(count):
            scenario, _meta = make_scenario(name, rng)
            curves = generate_curves(scenario, breaches=None)

            row = []
            for signal in SIGNAL_NAMES:
                curve = curves[signal]
                for _ in range(N_SENSORS):
                    sampled = sample_curve(
                        curve=curve,
                        sampling_frequency=SAMPLING_FREQUENCY,
                        rng=rng,
                        n_points=N_SAMPLES_PER_SIGNAL,
                    )
                    row.extend(sampled["values"])
            rows.append(row)

    rng.shuffle(rows)

    # Build CSV in memory and stream it back.
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(COLUMNS)
    w.writerows(rows)
    buf.seek(0)

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="dataset.csv"',
            "X-Row-Count": str(len(rows)),
            "X-Col-Count": str(len(COLUMNS)),
        },
    )

@app.get("/scenarios")
def scenarios():
    return {"scenarios": sorted(valid_scenario_names())}


# ---------------------------------------------------------------------------
# Contract registry endpoints (ported from the Express/TypeScript service)
# ---------------------------------------------------------------------------

class ContractEntry(BaseModel):
    owner_address: str
    contract_address: str


class SaveContractRequest(BaseModel):
    owner: str
    contract: str


contracts: list[ContractEntry] = [
    ContractEntry(owner_address="0.0.10871818", contract_address="0.0.10971076"),
]


@app.get("/get_contracts")
def get_contracts():
    return contracts


@app.post("/save_contract")
def save_contract(req: SaveContractRequest):
    if not req.owner or not req.contract:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="owner and contract required")

    contracts.append(ContractEntry(owner_address=req.owner, contract_address=req.contract))
    return True



@app.get("/health")
def healthcheck():
    return {"status" : "ok"}