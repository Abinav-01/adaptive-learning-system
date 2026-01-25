# Use python image
FROM python:3.9-slim

WORKDIR /app

# FIXED: Replaced 'libgl1-mesa-glx' with 'libgl1' for newer Debian versions
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your app files
COPY . .

# Run the app
CMD ["python", "app.py"]