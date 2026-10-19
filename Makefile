# ==============================================================================
# Packaging make file
# ==============================================================================

# Default target when running `make`
all: install build-local build-cloud


local-dev:
	echo "==> Run local UI"
	VITE_CLOUD_URL=http://localhost:8080 \
	VITE_LOCAL_URL=http://localhost:20206 \
	VITE_OPERATION_MODE=Local \
	bun dev --port 3001 --strictPort


cloud-dev:
	echo "==> Run cloud UI"
	VITE_CLOUD_URL=http://localhost:8080 \
	VITE_LOCAL_URL=http://localhost:20206 \
	VITE_OPERATION_MODE=Cloud \
	bun dev --port 3002 --strictPort

install:
	echo "==> Install npm packages"
	bun install

build-local:
	echo "==> Build local UI"
	bun run build


build-cloud:
	echo "==> Build local UI"
	bun run build