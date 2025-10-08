# ---- Base: official Python (slim) ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Workdir
WORKDIR /app

# OS deps for building wheels (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project
COPY . /app

# Railway exposes $PORT. Default to 8000 for local.
ENV PORT=8000

# Start: ALWAYS migrate first, then run Gunicorn
CMD sh -c "python manage.py migrate --noinput && gunicorn deliverynavigatorfin.wsgi:application --bind 0.0.0.0:${PORT}"
