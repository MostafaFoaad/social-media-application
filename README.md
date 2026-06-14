# Chat App — Backend (Part 1)

A concise, production-ready backend for a chat application, built with TypeScript, Express, MongoDB (Mongoose), Redis, and Firebase Admin. This repository contains core modules for authentication, user management, and posts, plus utilities for email, file uploads (S3), and token management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Running the App](#running-the-app)
- [API Overview](#api-overview)
- [Architecture & Services](#architecture--services)
- [Testing & Linting](#testing--linting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- Authentication with JWT and refresh tokens
- User management endpoints
- Post creation and retrieval
- File upload support via AWS S3
- Email notifications (nodemailer + templating)
- Redis support for caching / session-like usage
- Firebase Admin integration for push notifications

## Tech Stack

- Node.js + TypeScript
- Express (v5)
- MongoDB (Mongoose)
- Redis
- AWS S3 (via AWS SDK v3)
- Firebase Admin SDK
- Zod for validation

## Project Structure

Top-level layout (src):

- `src/main.ts` — application entry
- `src/app.bootstrap.ts` — app bootstrap and wiring
- `src/modules/` — feature modules (`auth`, `user`, `post`)
- `src/common/` — shared code (services, utils, enums, middleware)
- `src/DB/` — database connection, models, repositories

See the `src` folder for details and module-level README patterns.

## Prerequisites

- Node.js >= 18
- npm (or yarn)
- MongoDB instance (local or remote)
- Redis instance (local or remote)
- AWS credentials if using S3 uploads
- Firebase service account JSON (used by Firebase Admin)

## Installation

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd chat-app-part1
npm install
```

## Configuration

Configuration is controlled via environment variables and the `config/` folder.

Common environment variables (adjust to your environment):

- `PORT` — application port (default: `3000`)
- `NODE_ENV` — `development` | `production`
- `MONGO_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection URL
- `JWT_SECRET` — JWT signing secret
- `JWT_ACCESS_EXPIRES_IN` — access token TTL
- `JWT_REFRESH_EXPIRES_IN` — refresh token TTL
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` — for S3
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — for sending email
- `FIREBASE_SERVICE_ACCOUNT` — path to Firebase service account JSON (or provide via `config/`)

The repository includes a Firebase service account JSON under `config/` for local testing. Replace it with your production credentials as appropriate.

## Scripts

Available npm scripts defined in `package.json`:

- `npm run start:dev` — Run in development (TypeScript watch + node watch)
- `npm run start:prod` — Run in production mode

Example (development):

```bash
npm run start:dev
```

## Running the App

1. Ensure MongoDB and Redis are accessible and environment variables are set.
2. Install dependencies (`npm install`).
3. Start in development: `npm run start:dev`.

The server entrypoint is `src/main.ts` and compiled output is `dist/` when TypeScript runs.

## API Overview

This backend provides REST endpoints for authentication, users, and posts. High-level routes are grouped in modules under `src/modules`.

- `POST /auth/register` — register a new user
- `POST /auth/login` — obtain access and refresh tokens
- `POST /auth/refresh` — refresh tokens
- `GET /users/:id` — get user profile
- `POST /posts` — create a post (auth required)
- `GET /posts` — list posts

Refer to the controllers in `src/modules/*/*.controller.ts` for full request/response schemas and validation rules.

## Architecture & Services

- `src/common/services/redis.service.ts` — Redis client abstraction
- `src/common/services/s3.service.ts` — S3 upload utilities
- `src/common/services/token.service.ts` — JWT handling
- `src/common/services/notification.service.ts` — email & Firebase notifications
- `src/DB/repository/` — repository layer for DB operations

The app uses middleware for authentication, authorization, validation, and error handling located in `src/middleware/`.

## Testing & Linting

This repository does not include a test suite by default. To add tests consider using Jest or Vitest and add scripts:

```bash
npm run test
npm run test:watch
```

Also consider adding ESLint and Prettier for consistent code style.

## Deployment

Recommendations for deployment:

- Use a process manager (PM2 or systemd) or containerize with Docker.
- Provide environment variables securely via your hosting provider.
- Use managed MongoDB and Redis for reliability.
- Store Firebase and AWS credentials in a secure secrets store.

## Contributing

Contributions are welcome. Please open issues or pull requests. Follow the repository conventions and add unit tests for new features.

## License

This project is provided under the ISC license as declared in `package.json`.

---

If you'd like, I can also generate a Postman collection or Swagger/OpenAPI spec for the available endpoints. Want me to add that next?
