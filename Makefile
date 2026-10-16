# Makefile for LLM Multi-Tester with Supabase Database Integration

# Variables
IMAGE_NAME = llm-tester
CONTAINER_NAME = llm-tester-container
PORT = 3000
DATABASE_URL ?= $(SUPABASE_DB_URL)

.PHONY: help build run up down stop clean logs shell dev test lint supabase-init supabase-schema supabase-verify

help:
	@echo "Available commands:"
	@echo "  --- Application Development ---"
	@echo "  make dev             - Start the Vite development server (port 3000)"
	@echo "  make build           - Build the production web bundle"
	@echo "  make test            - Run Vitest unit & integration test suites"
	@echo "  make lint            - Run TypeScript type checks"
	@echo ""
	@echo "  --- Supabase Database Integration ---"
	@echo "  make supabase-init   - Create tables, indexes & RLS policies in Supabase"
	@echo "                         Usage: make supabase-init [DATABASE_URL=postgres://...]"
	@echo "  make supabase-schema - Print or inspect the Supabase PostgreSQL schema file"
	@echo "  make supabase-verify - Check Supabase connectivity and table status"
	@echo ""
	@echo "  --- Docker & Deployment ---"
	@echo "  make docker-build    - Build the Docker image"
	@echo "  make docker-run      - Run the Docker container"
	@echo "  make up              - Run with docker-compose"
	@echo "  make down            - Stop docker-compose"
	@echo "  make stop            - Stop the Docker container"
	@echo "  make clean           - Remove Docker image and container"
	@echo "  make logs            - View container logs"
	@echo "  make shell           - Access container shell"

# --- Dev / App commands ---
dev:
	npm run dev

build:
	npm run build

test:
	npm test

lint:
	npm run lint

# --- Supabase Database Commands ---
supabase-init:
	@chmod +x scripts/setup_supabase.sh
	@./scripts/setup_supabase.sh "$(DATABASE_URL)"

supabase-schema:
	@cat scripts/supabase_schema.sql

supabase-verify:
	@node scripts/init_supabase.mjs "$(DATABASE_URL)"

# --- Docker Commands ---
docker-build:
	docker build -t $(IMAGE_NAME) .

docker-run:
	docker run -d -p $(PORT):$(PORT) --name $(CONTAINER_NAME) $(IMAGE_NAME)

up:
	docker-compose up -d --build

down:
	docker-compose down

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

clean: stop
	docker rmi $(IMAGE_NAME) || true

logs:
	docker logs -f $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh
