#!/bin/bash
cd /Users/devgandhi/Desktop/expense-AI/expense-AI/backend
export AWS_PROFILE=expense-ai-dev
export AWS_DEFAULT_REGION=us-east-1
export PYTHONPATH=/Users/devgandhi/Desktop/expense-AI/expense-AI/backend:$PYTHONPATH
/Users/devgandhi/Desktop/expense-AI/expense-AI/backend/.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
