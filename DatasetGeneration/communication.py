# rabbit_producer.py
import os
import json
import asyncio

import numpy as np
import dotenv
from pydantic import BaseModel
from rstream import Producer, AMQPMessage, ConfirmationStatus

from utils.data_structures import Scenario
from DatasetGeneration.generator import generate_functions
from utils.helpers import get_events, get_breaches

dotenv.load_dotenv()

STREAM_NAME = os.getenv("STREAM_NAME", "my_stream")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5552"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASSWORD", "guest")

BATCH_SIZE = 60
STREAM_RETENTION = 50_000_000  # 50 MB


def _json_default(o):
    if isinstance(o, np.ndarray):
        return o.tolist()
    if isinstance(o, (np.floating, np.integer)):
        return o.item()
    if isinstance(o, np.bool_):
        return bool(o)
    if isinstance(o, BaseModel):
        return json.loads(o.model_dump_json())
    raise TypeError(f"Not JSON serializable: {type(o)}")


def _serialize(obj) -> bytes:
    return json.dumps(obj, default=_json_default).encode("utf-8")


def _batch_slices(signals: dict, size: int):
    """
    Yield sub-dicts of `signals`, each containing arrays sliced to length `size`.

    Input:  {"power": np.array([...900]), "temperature": np.array([...900]), ...}
    Output: {"power": array([...60]), "temperature": array([...60]), ...}  x15
    """
    length = min(len(arr) for arr in signals.values())
    for start in range(0, length, size):
        yield {name: arr[start : start + size] for name, arr in signals.items()}


def _on_confirm(status: ConfirmationStatus) -> None:
    if not status.is_confirmed:
        print(f"[!] Message {status.message_id} not confirmed: {status.response_code}")


async def send_all(
    signals: dict,
    stream: str = STREAM_NAME,
    batch_size: int = BATCH_SIZE,
    publisher_name: str = "my-producer",
) -> None:
    async with Producer(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        username=RABBITMQ_USER,
        password=RABBITMQ_PASS,
    ) as producer:
        await producer.create_stream(
            stream,
            exists_ok=True,
            arguments={"MaxLengthBytes": STREAM_RETENTION},
        )

        total = sum(1 for _ in _batch_slices(signals, batch_size))
        sent = 0

        for slice_dict in _batch_slices(signals, batch_size):
            body = _serialize(slice_dict)
            await producer.send(
                stream=stream,
                message=AMQPMessage(body=body),
                publisher_name=publisher_name,
                on_publish_confirm=_on_confirm,
            )
            sent += 1
            print(f"[+] Sent batch {sent}/{total}")

    print(f"[✓] Done. {sent} batches published to '{stream}'.")


if __name__ == "__main__":
    events = get_events()
    breaches = get_breaches()
    scenario = Scenario(duration=900, seed=2, events=events)
    signals = generate_functions(scenario, breaches)

    asyncio.run(send_all(signals))