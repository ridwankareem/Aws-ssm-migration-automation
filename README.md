# AWS SSM Parameter Migration & Loader

This repository provides a set of tools for managing environment variables and secrets using AWS Systems Manager Parameter Store. It includes a migration script to securely convert existing parameters to `SecureString` and a runtime loader to automatically inject these secrets into your Node.js or NestJS application.

-----

## 📌 Features

  * **Migrate:** Safely convert existing `String` parameters to `SecureString`.
  * **Recursive Fetching:** Supports fetching all parameters under a given path, bypassing the 10-item limit with pagination.
  * **Dry-run Mode:** Preview changes before they are applied, ensuring a safe migration.
  * **Runtime Loader:** Automatically decrypts `SecureString` values and loads them into `process.env`.
  * **Secure:** Secrets are never hardcoded or committed to Git.

-----

## 🚀 Migration Script

The `migrate-params.ts` script fetches all parameters under a specified path and converts their type to `SecureString` using AWS KMS encryption.

### 1️⃣ Dry Run (Preview Changes)

To see which parameters would be converted without making any actual changes, use the `--dry-run` flag:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' migrate-params.ts --dry-run
```

This command will list all parameters found under the configured path and show which ones would be updated.

### 2️⃣ Real Migration (Apply Changes)

To perform the migration and overwrite the parameters, run the script without the `--dry-run` flag:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' migrate-params.ts
```

This will change the parameter type to `SecureString`, encrypting the values.

-----

## 🛠 Runtime Loader

The `ssm-loader.ts` module provides a function to fetch and decrypt parameters at runtime. Simply import and call the function at the start of your application.

### Example Usage

```typescript
import { loadEnvFromParameterStore } from "./ssm-loader";

async function bootstrap() {
  await loadEnvFromParameterStore(); // fetch & decrypt from SSM
  console.log("✅ Environment variables loaded");

  // Example: check one variable
  console.log("BLOC_BASE_URL:", process.env.BLOC_BASE_URL);

  // Continue bootstrapping your NestJS app or other application logic...
}

bootstrap();
```

-----

## 🔐 Security

  * Parameters are stored as **`SecureString`** in AWS SSM, encrypted with AWS KMS.
  * At runtime, values are injected into `process.env` and **never hardcoded**.
  * Ensure that only trusted **IAM roles or users** have access to the parameter path.
  * The `kms:Decrypt` permission is required for the runtime loader to function correctly.

-----

## 📦 Requirements

  * Node.js \>= 14
  * TypeScript
  * `@aws-sdk/client-ssm`
  * `ts-node`

### Installation

```bash
npm install
```

-----

## 👨‍💻 Contributing

  * Always use `--dry-run` to preview changes before a real migration.
  * Open Pull Requests (PRs) for new features or improvements.
  * **Never log or commit secrets** to the repository.
