"""
FR-06: DOCX -> text via python-docx (PRD section 5.6).
"""
import docx


def extract_text_from_docx(file_path: str) -> str:
    document = docx.Document(file_path)
    return "\n".join(p.text for p in document.paragraphs)