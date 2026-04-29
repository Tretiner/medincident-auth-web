DC := cd .. && docker compose

.PHONY: dev build start lint clean reinstall \
        up up-dev down down-dev logs logs-dev logs-tail \
        rebuild rebuild-dev cache ps \
        proto-update proto-generate

# ─── Локальная разработка ──────────────────────────────────────────────────

dev:
	bun run dev

build:
	bun run build

start:
	bun run start

lint:
	bun run lint

# Сбросить зависимости и .next, переустановить
reinstall:
	rm -rf .next node_modules
	bun install

# ─── Docker — prod ─────────────────────────────────────────────────────────

up:
	$(DC) --profile prod up custom-ui --force-recreate --build -d

down:
	$(DC) down custom-ui

logs:
	$(DC) logs custom-ui -f

logs-tail:
	$(DC) logs custom-ui -f --tail 200

# Очистить Next.js кэш и пересобрать
rebuild: clear-cache
	$(DC) --profile prod up custom-ui --force-recreate --build -d

# ─── Docker — dev ──────────────────────────────────────────────────────────

up-dev:
	$(DC) --profile dev up custom-ui-dev --force-recreate --build -d

down-dev:
	$(DC) down custom-ui-dev

logs-dev:
	$(DC) logs custom-ui-dev -f

rebuild-dev: clear-cache
	$(DC) --profile dev up custom-ui-dev --force-recreate --build -d

# ─── Общее ─────────────────────────────────────────────────────────────────

# Статус всех контейнеров
ps:
	$(DC) ps

# Очистить только кэш Next.js (без пересборки)
clear-cache:
	rm -rf .next/cache

# ─── Protobuf ──────────────────────────────────────────────────────────────

proto-update:
	bun run proto:update

proto-generate:
	bun run proto:generate
