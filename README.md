# Social Media Application

## Overview

Social Media Application is a TypeScript-based backend for a social networking platform. It provides REST APIs for authentication, user profiles, and posts. Media uploads are handled via AWS S3 utilities, with caching handled by Redis, and push notifications via Firebase Admin.

---

## Tech Stack

- Node.js / TypeScript
- Express.js
- MongoDB (Mongoose)
- Redis (session/caching)
- AWS S3 (media storage)
- Multer (multipart uploads)
- Firebase Admin (push notifications)
- Zod (validation)
- JWT (authentication)
- Nodemailer (email)
- Security & utilities: CORS, bcrypt password hashing

---

## Major Features

- **Authentication (authModule)**  
  Signup, login, email verification, token rotation, JWT-based authentication.

- **User Management (userModule)**  
  User profiles, profile retrieval, profile deletion, avatar and cover uploads.

- **Posts (postModule)**  
  Create, read, update posts with validation, media attachment handling, and post reactions.

- **Uploads & Storage**  
  AWS S3 helpers, pre-signed upload URLs, and cloud Multer configuration.

- **Caching & Real-time Integration**  
  Redis initialization for token management/caching and Firebase notifications.

- **Email**  
  Confirmation codes and email delivery using Nodemailer.

---

## Application Flow

- `src/main.ts` starts the application.
- `app.bootstrap.ts`:
  - Applies security middlewares (CORS) and JSON parsing
  - Initializes Database and Redis connections
  - Registers REST routes (`/auth`, `/user`, `/post`)
  - Configures utility routes (AWS S3 file streaming and pre-signed assets)
  - Registers the global error handler
- `src/modules/index.ts` mounts all feature routers and exports them.

---

## Full Project Structure

```
SOCIAL_APP/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── dist/                          # Compiled JavaScript output
└── src/
    ├── app.bootstrap.ts           # App bootstrap, middlewares
    ├── main.ts                    # App entry point
    ├── config/
    │   └── config.ts              # Environment variables
    ├── DB/
    │   ├── connection.db.ts       # MongoDB connection
    │   ├── repository/
    │   │   ├── base.repository.ts
    │   │   ├── post.repository.ts
    │   │   └── user.repository.ts
    │   └── model/
    │       ├── post.model.ts
    │       └── user.model.ts
    ├── common/
    │   ├── enums/                 # email, multer, post, token, user enums
    │   ├── exceptions/            # application, domain exceptions
    │   ├── interfaces/            # pagination, post, user interfaces
    │   ├── response/              # success response formatters
    │   ├── services/
    │   │   ├── notification.service.ts
    │   │   ├── redis.service.ts
    │   │   ├── s3.service.ts
    │   │   └── token.service.ts
    │   ├── types/
    │   ├── utils/
    │   │   ├── email/             # email templates, sending utilities
    │   │   ├── multer/            # cloud multer configuration
    │   │   └── security/          # encryption and hashing
    │   └── validation/            # general validation schemas
    ├── middleware/
    │   ├── authentication.middleware.ts
    │   ├── authorization.middleware.ts
    │   ├── error.middleware.ts
    │   └── validation.middleware.ts
    └── modules/
        ├── index.ts               # Export all routers
        ├── auth/
        │   ├── auth.controller.ts
        │   ├── auth.dto.ts
        │   ├── auth.entity.ts
        │   ├── auth.service.ts
        │   └── auth.validation.ts
        ├── post/
        │   ├── post.controller.ts
        │   ├── post.dto.ts
        │   ├── post.service.ts
        │   └── post.validation.ts
        └── user/
            ├── user.controller.ts
            └── user.service.ts
```

## Environment Variables

Create `.env.development`

```
NODE_ENV=development
PORT=7000
APPLICATION_NAME=SocialApp

DB_URI=mongodb://localhost:27017/social_app
REDIS_URI=redis://localhost:6379

SALT_ROUND=10
IV_LENGTH=16
ENC_SECRET_KEY=your_encryption_secret

USER_ACCESS_TOKEN_SECRET_KEY=your_user_access_secret
USER_REFRESH_TOKEN_SECRET_KEY=your_user_refresh_secret
SYSTEM_ACCESS_TOKEN_SECRET_KEY=your_system_access_secret
SYSTEM_REFRESH_TOKEN_SECRET_KEY=your_system_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=1800
REFRESH_TOKEN_EXPIRES_IN=86400

EMAIL_APP=you@example.com
EMAIL_APP_PASSWORD=your_app_password

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket_name
AWS_EXPIRES_IN=120

FACEBOOK_LINK=https://facebook.com/yourpage
TWITTER_LINK=https://twitter.com/yourpage
INSTEGRAM_LINK=https://instagram.com/yourpage
AUDIENCE=your_audience_identifier
```

---

## How to Run

```bash
npm install
npm run start:dev
```

Server runs on `http://localhost:PORT`. To run in production, use `npm run start:prod`.

---

## API Routes

All routes are mounted in `src/app.bootstrap.ts`.

### Base Routes

```
/auth
/user
/post
/uploads
/pre-signed
```

### Auth Routes (`/auth`)

| Method | Endpoint                     | Description               |
| ------ | ---------------------------- | ------------------------- |
| POST   | `/auth/signup`               | Register user             |
| POST   | `/auth/login`                | Login                     |
| PATCH  | `/auth/confirm-email`        | Confirm email using token |
| PATCH  | `/auth/resend-confirm-email` | Resend confirmation email |

### User Routes (`/user`)

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/user`                      | Get current user profile |
| PATCH  | `/user/profile-image`        | Update profile image     |
| PATCH  | `/user/profile-cover-images` | Update cover images      |
| DELETE | `/user`                      | Delete user profile      |
| POST   | `/user/logout`               | Logout                   |
| POST   | `/user/rotate-token`         | Rotate refresh token     |

### Post Routes (`/post`)

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| GET    | `/post`               | Get paginated posts       |
| POST   | `/post`               | Create post + attachments |
| PATCH  | `/post/:postId`       | Update post + attachments |
| PATCH  | `/post/:postId/react` | React/Unreact to post     |

### Utility Routes

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/uploads/*path`     | Stream S3 assets (supports `download`) |
| GET    | `/pre-signed/*path`  | Generate S3 pre-signed upload link     |
| POST   | `/send-notification` | Push notification test endpoint        |

---

## Security Notes

- JWT-based authentication (access & refresh tokens with rotation)
- Password hashing with bcrypt
- Data validation enforced using Zod
- AWS S3 resources secured behind pre-signed URL generation

---

## License

ISC
