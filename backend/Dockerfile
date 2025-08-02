FROM python:3.9-slim

WORKDIR /app

ARG GUNICORN_WORKERS=4
ARG GUNICORN_TIMEOUT=120

ENV GUNICORN_WORKERS=${GUNICORN_WORKERS}
ENV GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT}

RUN apt-get update && apt-get install -y ffmpeg
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "$GUNICORN_WORKERS", "--timeout", "$GUNICORN_TIMEOUT", "run:app"]