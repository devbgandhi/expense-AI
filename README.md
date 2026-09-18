# Expense AI

A React Native (Expo) mobile app that lets you snap a photo of a receipt and automatically extracts the merchant, amount, date, and spending category — backed by a FastAPI service using AWS Textract for OCR.

## Features

- **Camera capture** — take a photo of a receipt directly in the app
- **Automatic extraction** — merchant, total, date, and category are parsed from the receipt image via OCR
- **Review & edit** — confirm or correct extracted fields before saving
- **Expense tracking** — persistent local storage of expenses with category icons and colors
- **Analytics dashboard** — monthly comparisons, spending trends, and category breakdowns
- **Filtering** — browse expenses by category

## Tech Stack

**Frontend**
- React Native + Expo
- TypeScript
- AsyncStorage for persistence

**Backend**
- FastAPI (Python)
- AWS Textract for receipt OCR
- Deployed on Render

## Project Structure

```
expense-AI/
├── App.tsx                     # App entry & screen navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Expense list, stats, filtering
│   │   ├── CameraScreen.tsx    # Receipt capture
│   │   └── ReviewScreen.tsx    # Review & edit extracted data
│   └── utils/                  # Storage, analytics, categorization helpers
└── backend/
    ├── app/
    │   ├── main.py              # FastAPI app & /process-receipt endpoint
    │   └── ocr.py                # Textract OCR + parsing/categorization logic
    └── requirements.txt
```

## Getting Started

### Frontend

```bash
npm install
npm start        # then press a / i / w for Android, iOS, or web
```

See [FRONTEND_SETUP.md](FRONTEND_SETUP.md) for more detail.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your AWS credentials
uvicorn app.main:app --reload --port 8000
```

See [backend/README.md](backend/README.md) for more detail.

## How It Works

1. The user captures a receipt photo in the app.
2. The image is sent to the FastAPI backend's `/process-receipt` endpoint.
3. The backend runs AWS Textract's document text detection on the image.
4. Parsed text is scanned for amounts, dates, and merchant name, then matched against keyword rules to guess a spending category.
5. Extracted fields are returned to the app and pre-filled on the review screen for the user to confirm or edit.
6. Confirmed expenses are saved locally and reflected in the dashboard.
