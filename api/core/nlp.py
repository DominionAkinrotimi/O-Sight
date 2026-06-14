import re
from difflib import SequenceMatcher

def clean_counterparty(raw_name):
    if not raw_name:
        return ""
    # Remove special characters and normalize spacing
    cleaned = re.sub(r'[+]|\.{3,}|[^a-zA-Z\s]', ' ', raw_name)
    cleaned = ' '.join(cleaned.split()).strip().upper()
    
    # Sort name parts alphabetically to ensure "FIRST LAST" == "LAST FIRST"
    parts = cleaned.split()
    parts.sort()
    return ' '.join(parts)

def fuzzy_deduplicate(names, threshold=0.85):
    """Merge similar names within a merchant list"""
    merged_map = {}
    used = set()
    
    for i, name1 in enumerate(names):
        if name1 in merged_map:
            continue
        group = [name1]
        for j, name2 in enumerate(names[i+1:], i+1):
            if name2 in used or name2 in merged_map:
                continue
            ratio = SequenceMatcher(None, name1, name2).ratio()
            if ratio > threshold:
                group.append(name2)
                used.add(name2)
        # Pick the most frequent or shortest as canonical
        canonical = max(group, key=lambda x: len(x))
        for n in group:
            merged_map[n] = canonical
            
    return merged_map

# ============================================================
# PART 1: BASE BANK ANALYZER (Data Ingestion & Parsing)
# ============================================================
