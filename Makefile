# ==============================================================================
# Packaging make file
# ==============================================================================

.SILENT:

# Default target when running `make`
all: install build-local build-cloud


dev-local:
	@echo "==> Run local UI"
	NODE_ENV=development \
	VITE_API_BASE_URL=http://localhost:20206 \
	VITE_OPERATION_MODE=Local \
	bun dev --host secretpass-local.localhost --port 3001 --strictPort


dev-cloud:
	@echo "==> Run cloud UI"
	NODE_ENV=development \
	VITE_API_BASE_URL=http://localhost:8080 \
	VITE_OPERATION_MODE=Cloud \
	bun dev --host secretpass-cloud.localhost --port 3002 --strictPort

install:
	@echo "==> Install npm packages"
	bun install

build-local:
	@echo "==> Build local UI"
	NODE_ENV=production \
	VITE_API_BASE_URL=http://localhost:20206 \
	VITE_OPERATION_MODE=Local \
	bun run build

build-cloud:
	@echo "==> Build cloud UI"
	NODE_ENV=production \
	VITE_API_BASE_URL=https://api.secretpass.cloud \
	VITE_OPERATION_MODE=Cloud \
	bun run build
