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
    --mount=type=bind,source=app-classification/requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt gunicorn

# Copy the application code before changing the user
COPY app-classification/. .

# Change ownership of the /app directory and its contents to appuser
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 5000

CMD ["gunicorn", "-w", "3", "-b", ":5000", "--timeout", "300", "app"]
