FROM python:3.11-slim

WORKDIR /app

# Ensure all scripts can resolve imports from /app
ENV PYTHONPATH=/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      gcc \
      libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt


# Install Terraform
RUN apt-get update && apt-get install -y wget unzip \
  && wget https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip \
  && unzip terraform_1.6.6_linux_amd64.zip \
  && mv terraform /usr/local/bin/ \
  && rm terraform_1.6.6_linux_amd64.zip \
  && terraform version \
  && apt-get remove -y wget unzip \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
