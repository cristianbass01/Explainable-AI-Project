# Dockerfile
FROM python:3.6.15-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat postgresql-client mime-support \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project code into the container
COPY . .

# Expose the port (Cloud Run uses the PORT environment variable)
ENV PORT 8000
EXPOSE 8000

# Run the Django development server
RUN  python3 manage.py makemigrations
RUN  python3 manage.py migrate
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
