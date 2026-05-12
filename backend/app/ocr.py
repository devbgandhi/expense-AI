import boto3
import io
from PIL import Image
import re
from dateparser import parse as parse_date

# AWS Textract client (uses env credentials or IAM role)
_textract = boto3.client('textract')


def _extract_text_from_bytes(image_bytes: bytes) -> str:
    # Call Textract DetectDocumentText
    response = _textract.detect_document_text(Document={'Bytes': image_bytes})
    lines = []
    for item in response.get('Blocks', []):
        if item.get('BlockType') == 'LINE':
            lines.append(item.get('Text', ''))
    return '\n'.join(lines)


def _find_amounts(text: str):
    # Find currency-like patterns, return floats
    # Match $ or other currency symbols optionally, commas, decimals
    amount_regex = r"\$?\s?([0-9]{1,3}(?:[,0-9]{0,3})*(?:\.[0-9]{1,2})?)"
    matches = re.findall(amount_regex, text)
    amounts = []
    for m in matches:
        try:
            cleaned = m.replace(',', '').strip()
            amounts.append(float(cleaned))
        except:
            continue
    return amounts


def _find_dates(text: str):
    # Use dateparser to find date-like tokens — naive approach
    date_candidates = []
    for token in re.split(r"[\n,;]+", text):
        token = token.strip()
        if not token:
            continue
        dt = parse_date(token)
        if dt:
            date_candidates.append(dt.date().isoformat())
    return date_candidates


def _guess_merchant(text: str):
    # Heuristic: merchant often appears in the top lines — take first non-empty line
    for line in text.split('\n'):
        line = line.strip()
        if line and not re.search(r'\b(total|subtotal|tax|change|amount)\b', line, re.IGNORECASE):
            return line[:60]
    return None


def _categorize(merchant: str, raw_text: str, amount: float):
    # Simple keyword-based categorizer. Extendable.
    keywords = {
        'Food': ['restaurant', 'cafe', 'coffee', 'starbucks', 'dunkin', 'burger', 'mcdonald'],
        'Transport': ['uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'transport'],
        'Shopping': ['walmart', 'target', 'amazon', 'store', 'shop', 'mall'],
        'Utilities': ['electric', 'water', 'internet', 'utility', 'gas bill'],
        'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'concert'],
    }

    text = (merchant or '') + '\n' + (raw_text or '')
    text = text.lower()
    for cat, kw_list in keywords.items():
        for kw in kw_list:
            if kw in text:
                return {'category': cat, 'confidence': 0.85}
    return {'category': 'Other', 'confidence': 0.5}


def process_image_bytes(image_bytes: bytes):
    raw_text = _extract_text_from_bytes(image_bytes)

    amounts = _find_amounts(raw_text)
    dates = _find_dates(raw_text)
    merchant = _guess_merchant(raw_text)

    total = None
    if amounts:
        total = max(amounts)

    parsed = {
        'merchant': merchant,
        'total': total,
        'date': dates[0] if dates else None,
        'line_items': [],
        'categories': [],
        'raw_text': raw_text,
    }

    # Categorize
    cat = _categorize(merchant or '', raw_text, total or 0.0)
    parsed['categories'].append(cat)

    return parsed
