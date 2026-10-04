# rabbit_consumer.py
import os
import json,asyncio
import dotenv
from rstream import Consumer, AMQPMessage, amqp_decoder
from rstream import ConsumerOffsetSpecification, OffsetType

from model.model import predict, save_predictions

dotenv.load_dotenv()

STREAM_NAME = os.getenv("STREAM_NAME", "my_stream")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5552"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASSWORD", "guest")

CONSUMER_NAME = os.getenv("CONSUMER_NAME", "my_consumer")

BATCH_SIZE = 60
SUB_BATCH_SIZE = 10

PREDICTIONS = []
BUFFER = []


def _slice_batch(data: dict, start: int, size: int) -> dict:
    """Take elements [start : start + size] from every array in the batch."""
    return {
        key: arr[start : start + size]
        for key, arr in data.items()
    }


async def on_message(message: AMQPMessage, message_context) -> None:
    data = json.loads(message.body.decode("utf-8"))

    for key, arr in data.items():
        print(f"  {key}: {len(arr)} values")
    print(f"[✓] Received batch: {list(data.keys())}")

    BUFFER.append(data)

    total = sum(len(next(iter(b.values()))) for b in BUFFER)

    # Wait until we've accumulated a full batch of BATCH_SIZE samples
    if total < BATCH_SIZE:
        return

    # Flatten the buffer into a single batch of BATCH_SIZE samples
    merged = {}
    for key in BUFFER[0].keys():
        merged[key] = []
        for b in BUFFER:
            merged[key].extend(b[key])

    # Trim in case buffer overshot BATCH_SIZE
    merged = {k: v[:BATCH_SIZE] for k, v in merged.items()}
    BUFFER.clear()

    # Run inference on sub-batches of SUB_BATCH_SIZE
    for start in range(0, BATCH_SIZE, SUB_BATCH_SIZE):
        sub_batch = _slice_batch(merged, start, SUB_BATCH_SIZE)
        result = predict(sub_batch)
        PREDICTIONS.append(result)

        print(
            f"[→] Sub-batch [{start}:{start + SUB_BATCH_SIZE}] "
            f"→ is_anomaly={result['is_anomaly']} "
            f"score={result['score']:.4f}"
        )

    save_predictions(PREDICTIONS)


async def main_consumer() -> None:
    consumer = Consumer(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        username=RABBITMQ_USER,
        password=RABBITMQ_PASS,
    )

    await consumer.start()
    try:
        await consumer.subscribe(
            stream=STREAM_NAME,
            callback=on_message,
            subscriber_name=CONSUMER_NAME,
            offset_specification=ConsumerOffsetSpecification(OffsetType.OFFSET, 0),
            decoder=amqp_decoder,
        )
        await consumer.run()
    finally:
        await consumer.close()

if __name__ == '__main__':
    asyncio.run(main_consumer())

    