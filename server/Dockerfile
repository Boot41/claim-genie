FROM python:3.10-slim

# Install Tesseract OCR and clean up apt cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project
COPY . .

EXPOSE 8000

# Run Gunicorn instead of Django's runserver
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]