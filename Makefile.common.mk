# Shared Makefile included by each package.
# Override any variable below in the including Makefile as needed.
JEST_FLAGS       ?=
ESBUILD_ENTRY    ?= src/index.ts
ESBUILD_PLATFORM ?= node
ESBUILD_TARGET   ?= node16
TSCONFIG_LIB     ?= ./tsconfig.lib.json

.PHONY: build build-cjs build-esm build-types lint test

build: build-cjs build-esm build-types
	cp dist/index.d.ts dist/index.d.mts

build-cjs:
	npx esbuild $(ESBUILD_ENTRY) \
		--bundle \
		--platform=$(ESBUILD_PLATFORM) \
		--target=$(ESBUILD_TARGET) \
		--format=cjs \
		--outfile=dist/index.cjs

build-esm:
	npx esbuild $(ESBUILD_ENTRY) \
		--bundle \
		--platform=$(ESBUILD_PLATFORM) \
		--target=$(ESBUILD_TARGET) \
		--format=esm \
		--outfile=dist/index.mjs

build-types:
	npx tsc --project $(TSCONFIG_LIB)

lint:
	npx tsc --noEmit
	npx eslint . --ext .ts

test:
	npx jest $(JEST_FLAGS)
