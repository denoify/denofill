test: generate-keys
	deno test --allow-read --location http://localhost test.ts
	deno test --allow-read --unstable --location http://localhost test.ts

generate-keys:
	deno run --allow-write=deno-keys.ts generate-keys.ts
	deno run --allow-write=deno-keys.ts --unstable generate-keys.ts unstable
