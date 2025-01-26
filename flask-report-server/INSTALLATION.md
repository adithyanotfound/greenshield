# PDF Extraction API Server

This project is a Flask-based API server that extracts text and image-based content (using OCR) from PDF files. The extracted content is returned directly as a JSON response.

## Features
- Extracts textual content from PDF files.
- Extracts text from images within the PDF using OCR (Tesseract).
- Returns extracted content as a JSON response without saving to disk.

## Prerequisites
Ensure the following dependencies are installed on your system:
- Python 3.8 or higher
- pip (Python package manager)
- Tesseract OCR installed on your system.

### Installing Tesseract OCR
For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install tesseract-ocr
```

For macOS (using Homebrew):
```bash
brew install tesseract
```

For Windows:
1. Download the Tesseract installer from [Tesseract GitHub](https://github.com/tesseract-ocr/tesseract).
2. Install it and add the installation path (e.g., `C:\Program Files\Tesseract-OCR`) to your system's PATH environment variable.

## Setup Instructions
1. Clone this repository:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

3. Run the server:
    ```bash
    python app.py
    ```

4. The server will start on `http://127.0.0.1:5000` by default.

## API Endpoint
### Endpoint: `/extract`
- **Method**: POST
- **Description**: Accepts a PDF file and extracts text and OCR data, returning it as a JSON response.

#### Request
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `pdf`: The PDF file to process.

#### Example using `curl`:
```bash
curl -X POST -F "pdf=@example.pdf" http://127.0.0.1:5000/extract
```

#### Example Response:
```json
{
  "message": "Text and image data extracted successfully.",
  "extracted_text": "...extracted content..."
}
```

## Notes
- Make sure the `uploads` directory is writable by the server.
- For larger PDFs, processing time may vary depending on the number of pages and embedded images.

## Troubleshooting
- **Tesseract Not Found**: Ensure Tesseract is installed and its path is added to the environment variables.
- **Permission Issues**: Check file and folder permissions for `uploads`.

## License
This project is licensed under the MIT License.

