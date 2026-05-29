FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Если зависимости требуют сборки (часто нужно)
RUN apt-get update && apt-get install -y --no-install-recommends git \
&& rm -rf /var/lib/apt/lists/*

# Вариант A: есть requirements.txt
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# потом код
COPY . .

EXPOSE 40000
CMD ["python", "main.py"]
