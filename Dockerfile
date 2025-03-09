# 1) Build client
FROM node:22.14.0-alpine as client_builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client .
RUN npm run build

# 2) Build Django backend
FROM python:3.10-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY server/requirements.txt .
RUN pip install --upgrade pip && \
    pip install gunicorn && \
    pip install -r requirements.txt

COPY server .

# Copy built client into /app/static/client
RUN mkdir -p static/client
COPY --from=client_builder /app/dist/ static/client/

# Collect static -> /app/staticfiles
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "-b", "0.0.0.0:8000", "backend.wsgi:application"]
