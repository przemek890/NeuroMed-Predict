# Stage 1: Build Stage
FROM python:3.12-bookworm AS builder

WORKDIR /builder

RUN pip install poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.in-project true

RUN poetry install --no-root

# Stage 2: Production Stage
FROM python:3.12-bookworm AS app

WORKDIR /app

COPY . .

COPY --from=builder /builder/.venv /app/.venv

ENV MONGO_CONNECTION_STRING=$MONGO_CONNECTION_STRING

RUN mkdir ./SSL

EXPOSE 5000

ENV PATH="/app/.venv/bin:$PATH"

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]


