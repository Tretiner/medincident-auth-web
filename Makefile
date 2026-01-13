dev: redis-reset
	npm run dev --turbo

release: redis-reset
	npm run build
	npm run start

build:
	npm run build

invalidate:
	powershell -Command "Remove-Item -Recurse -Force .next, node_modules, package-lock.json"
	npm install


redis-up:
	docker run -d -p 6379:6379 --name my-redis redis

redis-down:
	docker stop my-redis || true
	docker rm my-redis || true

redis-reset: redis-down redis-up


foldermap:
	py folder_map.py -fcg --hide-empty --no-format -o folder_map.txt --match "^(?!package-lock|README)"