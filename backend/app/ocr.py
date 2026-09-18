import boto3
import io
from PIL import Image
import re
from dateparser import parse as parse_date

# AWS Textract client (created lazily on first use to allow region to be set)
_textract = None

def _get_textract_client():
    global _textract
    if _textract is None:
        _textract = boto3.client('textract')
    return _textract


def _extract_text_from_bytes(image_bytes: bytes) -> str:
    # Call Textract DetectDocumentText
    response = _get_textract_client().detect_document_text(Document={'Bytes': image_bytes})
    lines = []
    for item in response.get('Blocks', []):
        if item.get('BlockType') == 'LINE':
            lines.append(item.get('Text', ''))
    return '\n'.join(lines)


def _find_amounts(text: str):
    # Find currency-like patterns, return floats
    # More robust regex: match $ or other currency, commas, decimals
    # Look for total/amount/subtotal amounts specifically
    amount_regex = r"\$\s?([0-9]{1,3}(?:[,0-9]{0,3})*(?:\.[0-9]{1,2})?)"
    matches = re.findall(amount_regex, text)
    amounts = []
    for m in matches:
        try:
            cleaned = m.replace(',', '').strip()
            val = float(cleaned)
            # Filter reasonable expense amounts (0.01 to 99999.99)
            if 0.01 <= val <= 99999.99:
                amounts.append(val)
        except:
            continue
    
    # If no $ amounts found, try plain number patterns
    if not amounts:
        plain_regex = r"\b([0-9]{1,3}(?:[,0-9]{0,3})*(?:\.[0-9]{1,2})?)\b"
        matches = re.findall(plain_regex, text)
        for m in matches:
            try:
                cleaned = m.replace(',', '').strip()
                val = float(cleaned)
                if 0.01 <= val <= 99999.99:
                    amounts.append(val)
            except:
                continue
    
    return sorted(set(amounts), reverse=True)  # Unique, sorted descending


def _find_dates(text: str):
    # Use dateparser to find date-like tokens
    # Look for common date patterns in receipt text
    date_candidates = []
    
    # Split by common delimiters
    tokens = re.split(r"[\n,;:\s]+", text)
    
    for i, token in enumerate(tokens):
        token = token.strip()
        if not token or len(token) < 2:
            continue
        
        # Try to parse with dateparser (more lenient)
        try:
            dt = parse_date(token, settings={'STRICT_PARSING': False})
            if dt:
                date_str = dt.date().isoformat()
                # Avoid duplicates and far-future dates
                if date_str not in date_candidates and dt.year >= 2020:
                    date_candidates.append(date_str)
        except:
            pass
    
    # Prefer most recent date (likely transaction date)
    return sorted(date_candidates, reverse=True)


def _guess_merchant(text: str):
    # Merchant/store name — often at the top or bottom of receipt
    # Heuristic: look for lines that don't match common receipt keywords
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    if not lines:
        return None
    
    # Keywords that indicate non-merchant lines
    skip_keywords = [
        'total', 'subtotal', 'tax', 'change', 'amount', 'paid', 'card',
        'number', 'ref', 'auth', 'thank you', 'welcome', 'please',
        'date', 'time', 'balance', 'receipt', 'invoice', 'order',
        'qty', 'price', 'charged', 'till'
    ]
    
    # Try first few lines (often merchant name at top)
    for line in lines[:5]:
        line_lower = line.lower()
        # Skip if contains skip keywords or is too long/numeric
        if not any(kw in line_lower for kw in skip_keywords):
            # Skip if line is mostly numbers (qty/prices)
            if not re.match(r'^[\d\s\.\$]+$', line):
                return line[:50].strip()
    
    # Fallback to first non-empty line
    for line in lines:
        if line and not re.match(r'^[\d\s\.\$]+$', line):
            return line[:50].strip()
    
    return None


def _categorize(merchant: str, raw_text: str, amount: float):
    # Improved keyword-based categorizer with more merchants and patterns
    keywords = {
        'Food': [
            'restaurant', 'cafe', 'coffee', 'starbucks', 'dunkin', 'burger', 'mcdonald',
            'pizza', 'subway', 'taco', 'chipotle', 'shake shack', 'panera', 'chick-fil-a',
            'wendy', 'sonic', 'arbys', 'kfc', 'popeyes', 'diner', 'bistro', 'brunch',
            'lunch', 'breakfast', 'dessert', 'gelato', 'smoothie', 'juice', 'bakery',
            'bread', 'pastry', 'donut', 'bagel', 'deli', 'grill', 'bbq', 'steakhouse',
            'sushi', 'ramen', 'noodle', 'pho', 'thai', 'indian', 'mexican', 'korean',
            'italian', 'greek', 'middle east', 'mediterranean', 'buffet', 'food court',
            'gastropub', 'tavern', 'pub', 'bar & grill', 'seafood'
        ],
        'Transport': [
            'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'transport', 'transit',
            'parking', 'gas station', 'fuel', 'shell', 'exxon', 'chevron', 'bp',
            'mobil', 'speedway', 'airline', 'airport', 'amtrak', 'rail', 'mta',
            'toll', 'ferry', 'shuttle', 'car rental', 'hertz', 'avis', 'enterprise'
        ],
        'Shopping': [
            'walmart', 'target', 'amazon', 'store', 'shop', 'mall', 'retail', 'market',
            'costco', 'sams club', 'trader joe', 'whole foods', 'kroger', 'safeway',
            'publix', 'safeway', 'sprouts', 'macys', 'nordstrom', 'gap', 'forever 21',
            'h&m', 'uniqlo', 'zara', 'best buy', 'apple', 'store', 'outlet', 'depot',
            'shoes', 'apparel', 'clothing', 'fashion', 'boot', 'rack', 'goodwill'
        ],
        'Utilities': [
            'electric', 'water', 'internet', 'utility', 'gas bill', 'phone bill',
            'verizon', 'at&t', 'comcast', 'spectrum', 'time warner', 'power',
            'energy', 'utility company', 'bills'
        ],
        'Entertainment': [
            'movie', 'cinema', 'netflix', 'spotify', 'concert', 'theater', 'theatre',
            'music', 'gaming', 'game', 'playstation', 'xbox', 'nintendo', 'steam',
            'hulu', 'disney', 'hbo', 'paramount', 'apple tv', 'amazon prime', 'tickets',
            'amc', 'regal', 'cinemark', 'imax', 'bar', 'club', 'nightclub'
        ],
    }
    
    text = (merchant or '') + '\n' + (raw_text or '')
    text = text.lower()
    
    # Score each category
    scores = {}
    for cat, kw_list in keywords.items():
        score = 0
        for kw in kw_list:
            if kw in text:
                score += 1
        scores[cat] = score
    
    # Return best matching category or 'Other'
    best_cat = max(scores, key=scores.get) if max(scores.values()) > 0 else 'Other'
    confidence = min(0.95, 0.5 + (scores[best_cat] * 0.1))  # Increase confidence with more matches
    
    return {'category': best_cat, 'confidence': round(confidence, 2)}


def process_image_bytes(image_bytes: bytes):
    raw_text = _extract_text_from_bytes(image_bytes)

    amounts = _find_amounts(raw_text)
    dates = _find_dates(raw_text)
    merchant = _guess_merchant(raw_text)

    total = None
    if amounts:
        # Try to find the total/final amount
        # Look for "TOTAL", "Amount Due", "Grand Total" etc in context
        lines_with_amounts = []
        for line in raw_text.split('\n'):
            line_lower = line.lower()
            if any(kw in line_lower for kw in ['total', 'amount', 'due', 'balance', 'charged']):
                # Extract amount from this line
                amt_match = re.search(r'\$?\s?([0-9]{1,3}(?:[,0-9]{0,3})*(?:\.[0-9]{1,2})?)', line)
                if amt_match:
                    try:
                        val = float(amt_match.group(1).replace(',', ''))
                        if 0.01 <= val <= 99999.99:
                            lines_with_amounts.append(val)
                    except:
                        pass
        
        # Use total-line amount if found, else use largest amount
        if lines_with_amounts:
            total = lines_with_amounts[-1]  # Last "total" mention is usually the final
        elif amounts:
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
