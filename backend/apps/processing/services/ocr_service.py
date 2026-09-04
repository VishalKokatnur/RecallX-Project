"""
FR-06: Image -> text via Tesseract OCR (pytesseract wrapper).
Switched from PaddleOCR due to a PaddlePaddle/oneDNN compatibility bug on Windows.
"""
import pytesseract
from PIL import Image

# Point pytesseract at your Tesseract install.
# Adjust this path if you installed it somewhere other than the default.
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image(file_path: str) -> str:
    image = Image.open(file_path)
    return pytesseract.image_to_string(image)