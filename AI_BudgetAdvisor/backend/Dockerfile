FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling numerical models
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies list
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Ensure datasets and models folders exist
RUN mkdir -p datasets models

# Run the automatic Kaggle/synthetic setup script to load dataset on container start
RUN python scripts/download_datasets.py

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
