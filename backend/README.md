# Expense-AI Backend (FastAPI + AWS Textract)

This small backend provides endpoints to process receipt images using AWS Textract and return parsed fields (merchant, total, date, categories, raw_text).

Prerequisites
- Python 3.11+
- AWS credentials available in the environment (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) or an EC2/ECS role with Textract permissions.

Quick start (local):

1. Create a virtualenv and install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

3. Test the /process-receipt endpoint

```bash
curl -F "file=@/path/to/receipt.jpg" http://localhost:8000/process-receipt
```

Notes
- This prototype uses AWS Textract's DetectDocumentText API for line-level text extraction. For higher quality structured extraction, consider StartDocumentAnalysis / AnalyzeExpense or Google Vision Document OCR.
- The categorizer is a simple keyword-based heuristic and should be replaced by an ML model for production use.
- For privacy, images are not stored by default — they are processed in-memory and discarded.

Environment variables
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION - for boto3

Deployment
- A Dockerfile is included for quick container deployment.
