# ==============================================================================
# Packaging make file
# ==============================================================================

# Default target when running `make`
all: install build-local build-cloud


dev-local:
	echo "==> Run local UI"
	VITE_CLOUD_ORIGIN=http://localhost:8080 \
	VITE_LOCAL_ORIGIN=http://localhost:20206 \
	VITE_OPERATION_MODE=Local \
	bun dev --host secretpass-local.localhost --port 3001 --strictPort


dev-cloud:
	echo "==> Run cloud UI"
	VITE_CLOUD_ORIGIN=http://localhost:8080 \
	VITE_LOCAL_ORIGIN=http://localhost:20206 \
	VITE_OPERATION_MODE=Cloud \
	bun dev --host secretpass-cloud.localhost --port 3002 --strictPort

install:
	echo "==> Install npm packages"
	bun install

build-local:
	echo "==> Build local UI"
	bun run build


build-cloud:
	echo "==> Build local UI"
	bun run build