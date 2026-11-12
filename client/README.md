# Julia Cameron's Portfolio

A personal portfolio website presenting Julia Cameron's background, skills, projects, education, and services. The site is built with React and Vite, with page navigation handled by React Router.

## Sections

- **Home**: portfolio introduction
- **About**: biography, resume, and interactive skill-category badges
- **Projects**: project cards loaded from the backend
- **Education**: qualifications loaded from the backend
- **Services**: software development services loaded from the backend
- **Contact**: contact form and direct contact information
- **Sign In**: sign in with an existing account and sign out
- **Sign Up**: create a regular user account, then sign in

The interface uses a cosmic night-sky theme with an animated starry background.

## Getting Started

### Requirements

- Node.js (LTS recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal when the server starts.
In development, Vite forwards `/api` requests to `http://localhost:3000`.
If the backend uses another address, set `BACKEND_URL` in the terminal before starting Vite.
Sign-in state is held in memory and is cleared when the page is refreshed or closed.
For a deployed frontend, configure the hosting server to forward `/api` requests to the backend;
the Vite development proxy does not apply to production builds.

The Projects page reads records from MongoDB. To copy the four original portfolio cards,
sign in as an admin, open the import section on that page, and enter the required owner
fields. Project API responses are public, including the owner email; use an address you
are comfortable publishing. The import does not overwrite existing records. Repeating it
skips records previously imported by this tool, but records created separately may be duplicates.
If an import is interrupted, retry it to import the remaining cards.
Signed-in admins can also add, edit, and delete projects on the Projects page. Editing
preserves an existing card's image. New projects do not currently support image uploads.

The Education page reads qualifications from MongoDB. An admin can import the two
original cards using the import section on that page. Qualification API responses
are public, including the owner email; use an address you are comfortable publishing.
The import does not overwrite existing records. Retrying skips records previously
imported by this tool, but records created separately may be duplicates.
Signed-in admins can add, edit, and delete education records from the Education page.
Education cards are ordered by end date, newest first; ongoing studies come first and
undated records last. Enter a completion date or mark the record as currently studying.
For older records without these fields, study periods such as `2001 - 2006` or
`January 2026 - present` are recognized; a year-only end is sorted as January 1 of
that year. Other free-text periods are not interpreted. The ordering is applied on
the Education page and does not change existing database records.

The Services page reads from MongoDB. Signed-in admins can add, edit, and delete services;
while no services exist, an admin can import the four original cards with one click.
Retrying the import skips records previously imported by this tool.

The Contact form saves submissions to MongoDB, then sends them through EmailJS.
If email delivery fails after saving, the visitor is told not to resubmit. If the
save cannot be confirmed, the email is not sent and the visitor is directed to use
the direct email address. Admins can read, edit, and delete saved contacts on the
Contact page. Regular users cannot read them, to protect message privacy.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server with hot reloading. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. Run `npm run build` first. |
| `npm run lint` | Run ESLint across the project. |

## Technology

- React
- Vite
- React Router
- EmailJS Browser SDK
- ESLint

## Project Structure

```text
src/
	assets/      Images, resume, and other static assets
	pages/       Home, About, Projects, Education, Services, and Contact pages
	App.jsx      Application layout and route definitions
	App.css      Shared application and page styles
	Footer.jsx   Site footer
	main.jsx     Application entry point
```
