FROM python:3.9.5-slim as app-base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=app-email/requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt gunicorn

USER appuser

COPY app-email/. .

EXPOSE 5000

CMD ["faststream", "run", "app-email:app"]
