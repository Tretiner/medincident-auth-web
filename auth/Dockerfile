FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY . .

EXPOSE 3000

# --bun = нативный Bun runtime вместо Node.js compat
# WATCHPACK_POLLING = hot reload работает через Docker bind mount
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

CMD ["bun", "--bun", "run", "next", "dev", "--turbopack", "-H", "0.0.0.0", "-p", "3000"]
