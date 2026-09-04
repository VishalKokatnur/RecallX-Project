"""
FR-07: Remove extra spaces, empty lines, invalid characters, repeats.
"""
import re


def clean_text(raw_text: str) -> str:
    text = re.sub(r"[ \t]+", " ", raw_text)
    text = re.sub(r"\n{2,}", "\n", text)
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return text.strip()
