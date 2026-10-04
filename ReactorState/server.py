from fastapi import FastAPI, HTTPException, Query
from contextlib import asynccontextmanager
import asyncio

import consumer  # import the module, not the name

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(consumer.main_consumer())
    try:
        yield
    finally:
        task.cancel()

app = FastAPI(lifespan=lifespan)

@app.get("/inference")
def inference(
    batch_id_start: int = Query(..., ge=0),
    batch_id_end: int = Query(..., ge=0),
):
    PREDICTIONS = consumer.PREDICTIONS   # read attribute each request

    if not PREDICTIONS:
        raise HTTPException(status_code=404, detail="no inference runs yet")

    if batch_id_start > batch_id_end:
        raise HTTPException(
            status_code=400,
            detail="batch_id_start must be <= batch_id_end",
        )

    if batch_id_end >= len(PREDICTIONS):
        raise HTTPException(
            status_code=404,
            detail=(
                f"batch_id_end={batch_id_end} out of range; "
                f"only {len(PREDICTIONS)} prediction batches available"
            ),
        )

    return {"predictions": PREDICTIONS[batch_id_start : batch_id_end + 1]}

@app.get("/health")
def healthcheck():
    return {"status" : 200}