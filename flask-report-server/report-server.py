from flask import Flask, request, jsonify
import pymupdf
import pytesseract
from PIL import Image
import io
import os

app = Flask(__name__)

def pdf_to_text_with_graphics(pdf_path):
    try:
        if not os.path.exists(pdf_path):
            return f"Error: The file '{pdf_path}' does not exist.", None

        doc = pymupdf.open(pdf_path)
        extracted_text = ""

        for page_num, page in enumerate(doc):
            # Extract text from the page
            extracted_text += page.get_text()

            # Extract images from the page
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image = Image.open(io.BytesIO(image_bytes))
                ocr_text = pytesseract.image_to_string(image)
                extracted_text += f"\n[Image Text (Page {page_num + 1}, Image {img_index + 1})]:\n{ocr_text}\n"

        return "Text and image data extracted successfully.", extracted_text

    except Exception as e:
        return f"An error occurred: {e}", None

@app.route('/extract', methods=['POST'])
def extract_pdf():
    try:
        pdf_file = request.files['pdf']

        # Save the uploaded PDF file
        pdf_path = os.path.join("uploads", pdf_file.filename)
        if not os.path.exists("uploads"):
            os.makedirs("uploads")

        pdf_file.save(pdf_path)

        # Process the PDF
        message, extracted_text = pdf_to_text_with_graphics(pdf_path)

        if extracted_text:
            return jsonify({"message": message, "extracted_text": extracted_text}), 200
        else:
            return jsonify({"error": message}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    if not os.path.exists("uploads"):
        os.makedirs("uploads")

    app.run(debug=True)
