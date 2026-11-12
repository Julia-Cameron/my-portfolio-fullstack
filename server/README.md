# MyPortfolio

A full-stack personal portfolio application for presenting Julia Cameron's background, skills, projects, education, and services. The frontend is a React single-page application, and the backend provides a REST API backed by MongoDB.

## Features

- Portfolio pages for Home, About, Projects, Education, Services, and Contact
- Responsive design with an animated starry background
- Express API for authentication, contacts, projects, qualifications, and users
- MongoDB persistence through Mongoose
- JWT-based authentication for protected API routes

## Tech stack

- **Frontend:** React, React Router, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens and bcrypt

## Prerequisites

- Node.js and npm
- A MongoDB database

## Setup

1. From the `server` folder, install the backend dependencies:

   ```bash
   npm install
   ```

2. From the `server` folder, install the frontend dependencies:

   ```bash
   npm --prefix ../client install
   ```

3. Configure the `.env` file in the `server` folder:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   JWT_SECRET=<a-long-random-secret>
   PORT=3000
   ```

   Use your own MongoDB connection string and secret. Do not commit `.env` or other credentials.

4. Start the frontend and backend together from the `server` folder:

   ```bash
   npm run dev
   ```

   The Vite development server prints the frontend URL in the terminal. The Express API listens on `http://localhost:3000` by default; set `PORT` in `.env` to use another port.

## API

All endpoints are prefixed with `/api`. Resource endpoints support the methods listed below; `:id` identifies a resource.

| Resource | Endpoints | Access |
| --- | --- | --- |
| Authentication | `POST /auth/signup`, `POST /auth/signin`, `GET, POST /auth/signout` | Sign-out requires authentication |
| Contacts | `GET, POST /contacts`, `GET, PUT, DELETE /contacts/:id`, `DELETE /contacts` | POST public; reads and other changes admin only |
| Projects | `GET, POST /projects`, `GET, PUT, DELETE /projects/:id`, `DELETE /projects` | GET public; changes admin only |
| Qualifications | `GET, POST /qualifications`, `GET, PUT, DELETE /qualifications/:id`, `DELETE /qualifications` | GET public; changes admin only |
| Users | `GET, POST /users`, `GET, PUT, DELETE /users/:id`, `DELETE /users` | Admin only |

Requests that create or update resources should send JSON bodies. Protected routes require an `Authorization` header using the `Bearer` scheme and a token issued by the sign-in endpoint.
The user-management routes verify the account's current role in the database on each request. Signing up through `/auth/signup` remains public and creates a regular user.
Sign-out clears the client session; the backend does not revoke already issued JWTs,
which remain valid until they expire. The frontend uses POST; GET is also available
for compatibility with the assignment's specified sign-out route.

Contact submissions accept `name`, `email`, and `message` as nonempty strings. Updates
require all three fields. Legacy records with `firstname` and `lastname` are still
readable. The public submission endpoint has no rate limiting or spam protection;
add these before exposing it to production. Contact reads are admin-only to protect
message privacy, intentionally differing from a general user-read rule.

Qualification records can include optional education-card details such as study period,
institution, academic standing, relevant courses, activities, and a link. Existing
qualification records remain valid without these fields.

## Frontend scripts

Run these from the `client` directory, or prefix them with `npm --prefix ../client` from the `server` folder.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite frontend in development mode |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production frontend build |
| `npm run lint` | Run ESLint on the frontend |

## Project structure

```text
client/                React and Vite frontend
server/                Express backend
  controllers/         API request handlers
  middleware/          Authentication middleware
  models/              Mongoose models
  routes/api/          Express API routes
  server/              Express app configuration and asset routing
  server.js            Backend entry point
```

The frontend has its own README with additional UI details in [`client/README.md`](../client/README.md).
