# Stage 1 – Build the Frontend
FROM node:22.14.0-alpine as client_build

WORKDIR /code

# Copy the entire client folder
COPY ./client /code

# Install dependencies and build the frontend
RUN npm install
RUN npm run build

# Stage 2 – Build the Backend
FROM python:3.12.3-slim

# Install system dependencies (e.g. Tesseract)
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Install Python dependencies
COPY ./server/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir gunicorn
RUN pip install --no-cache-dir -r requirements.txt

# This COPY instruction expects the build output in /code/build/
# but Vite (from package.json) outputs to a folder called "dist".
COPY --from=client_build /code/dist/ /code/static/

# Copy Django backend code
COPY ./server /code

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]