from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from . import ocr

app = FastAPI(title="Expense AI OCR API")

# Allow requests from the Expo app (adjust origin as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:19006", "exp://localhost:19000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/process-receipt")
async def process_receipt(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        contents = await file.read()
        # Delegate to OCR module
        result = ocr.process_image_bytes(contents)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
