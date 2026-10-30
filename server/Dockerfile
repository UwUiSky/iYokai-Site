FROM python:3.12-slim
RUN useradd -r -u 10001 panel
WORKDIR /srv
COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock
COPY app app
COPY policy.example.json policy.example.json
COPY site-settings.example.json commerce.example.json ./
USER panel
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log"]
