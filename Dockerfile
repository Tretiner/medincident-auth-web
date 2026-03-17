FROM node:20-alpine
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем зависимости (это требует немного RAM, но терпимо)
RUN npm ci

# Копируем весь оставшийся код
COPY . .

# Пробрасываем порт
EXPOSE 3000

# Запускаем напрямую через Next CLI, игнорируя твой env-cmd из package.json, 
# так как Docker Compose сам прокинет переменные окружения
CMD ["npx", "next", "dev", "-p", "3000"]