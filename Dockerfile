FROM python:3.11-alpine

# Install dependencies
RUN apk add --no-cache build-base curl

# Install uv package manager
RUN curl -Ls https://astral.sh/uv/install.sh | sh && \
    mv ~/.local/bin/uv /usr/local/bin/

WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

COPY ./app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]