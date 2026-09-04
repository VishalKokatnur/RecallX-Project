"""
FR-06: PDF -> text via PyMuPDF (PRD section 5.5).
"""
import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text