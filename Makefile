.PHONY: build build-affected lint lint-affected test test-affected

build:
	npx turbo run build

build-affected:
	npx turbo run build --filter=[$$FROM_COMMIT...$$TO_COMMIT]

lint:
	npx turbo run lint

lint-affected:
	npx turbo run lint --filter=[$$FROM_COMMIT...$$TO_COMMIT]

test:
	npx turbo run test

test-affected:
	npx turbo run test --filter=[$$FROM_COMMIT...$$TO_COMMIT]
