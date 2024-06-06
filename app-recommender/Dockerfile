FROM python:3.9.5-slim as app-base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TRANSFORMERS_CACHE=/tmp

WORKDIR /app

COPY app-recommender/requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install -r requirements.txt gunicorn

COPY app-recommender/. .

EXPOSE 5000

CMD ["faststream", "run", "app-recommender:app"]
