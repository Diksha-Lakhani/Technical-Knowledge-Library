# Technical Knowledge Library

An internal knowledge portal where employees look up IT problems and their solutions, and contribute new ones. Contributions go through an admin approval workflow, so the knowledge base stays curated.

**Stack:** React 19 + Vite (frontend) · FastAPI (backend) · MySQL 8 (database)

## Features

- **Browse and filter** recent problems by category and location
- **Search** problems by keyword (live search in the navbar)
- **View a problem** with its solutions and attachments
- **Contribute**: submit a new problem + solution, or add, update, or request deletion of a solution
- **Admin review queue**: admins approve or reject every submitted change, with remarks
- **Request history**: approved and rejected requests are archived
- **Trends dashboard** (admin): charts of which categories and locations are viewed most
- **Profile page**: account details, password change, and your contributions
- **File attachments** on problems and solutions
- Light/dark theme

## Project structure

```
epskp/
├── attachments/        # Uploaded files (contents are gitignored)
├── backend/
│   ├── main.py         # FastAPI app: all routes
│   ├── requirements.txt
│   └── .env.example
├── database/
│   └── schema.sql      # MySQL schema (tables only, no data)
└── frontend/
    ├── src/
    │   ├── components/   # navbar, problem card, solution card
    │   ├── pages/        # login, signup, forgot, home, addProb, viewProb, profile
    │   └── pages_admin/  # trends, request (review queue)
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Python 3.10+
- Node.js 18+ (20+ recommended) and npm
- MySQL 8.x

## Setup

### 1. Database

```bash
mysql -u <your_user> -p < database/schema.sql
```

This creates the epskp database and all tables. The schema contains **no seed data**, so you need to populate the lookup tables before the app is usable.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Windows: copy .env.example .env
```

Edit .env according to the .env.example file:

**Linux/macOS gotcha:** USER is also a standard shell environment variable (your OS username), and python-dotenv does not override variables that are already set. If the backend connects as the wrong MySQL user, rename the variable (e.g. DB_USER) in both .env and main.py.

Start the API:

```bash
uvicorn main:app --reload
```

It runs on `http://127.0.0.1:8000`. Interactive API docs are at /docs.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend at `127.0.0.1:8000` (stripping the `/api` prefix), so no CORS configuration is needed in development.

The navbar expects a logo at `frontend/public/logo.png`. You can add your own logo in the public file.

## Scripts (frontend)

| Command           | Description                    |
| ----------------- | ------------------------------ |
| npm run dev     | Start the dev server           |
| npm run build   | Production build into dist/    |
| npm run preview | Preview the production build   |
| npm run lint    | Run ESLint                     |

## How the approval workflow works

1. A user submits a change. It is stored in admin_req with a status of pending. Request types are:
   - `create_prob_sol`: new problem with a solution
   - `create_sol`: new solution for an existing problem
   - `update_sol`: edit an existing solution
   - `delete_sol`: remove a solution
2. An admin opens **Requests**, reviews each one, and approves or rejects it with remarks.
3. On approval, the change is applied to problem / solution / attachment. Either way, the outcome is recorded in history.

## Database overview

| Table        | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `user`       | Employees (empid, role, location)                  |
| `problem`    | Problem title, description, category, location       |
| `solution`   | Solutions linked to a problem                        |
| `attachment` | Files linked to a problem or solution                |
| `admin_req`  | Pending change requests                              |
| `history`    | Archive of approved/rejected requests                |
| `trend`      | Problem view log used for the trends dashboard       |
| `category`, `location` | Lookup tables                              |

## API endpoints

All endpoints are called through the `/api` prefix from the frontend.

| Method | Path                | Purpose                              |
| ------ | ------------------- | ------------------------------------ |
| POST   | `/login`            | Authenticate                         |
| POST   | `/signin`           | Register a user                      |
| POST   | `/recent`           | List problems (category/location filter) |
| POST   | `/getProb`          | Get one problem with solutions       |
| POST   | `/search`           | Keyword search                       |
| POST   | `/createProbSolnReq`| Submit new problem + solution        |
| POST   | `/addSolnReq`       | Submit a new solution                |
| POST   | `/updateSolnReq`    | Submit a solution edit               |
| POST   | `/deleteSolnReq`    | Submit a solution deletion request   |
| POST   | `/getReq`           | Fetch pending requests               |
| POST   | `/reviewReq`        | Approve or reject a request (admin)  |
| POST   | `/deleteProb`       | Delete a problem                     |
| GET    | `/viewTrends`       | Trend data for the dashboard         |
| POST   | `/viewProfile`, `/viewContri`, `/changePass` | Profile and contributions |
| GET    | `/attachments/*`    | Serve uploaded files                 |

## Known limitations

This is an early-stage project. Before any real deployment, address the following:

- **Passwords are stored and compared in plain text** (user.password is varchar(20)). Hash them with bcrypt or argon2.
- **No server-side authentication or authorization.** Login returns the role to the client, which keeps it in sessionStorage; endpoints such as /reviewReq and /deleteProb don't verify the caller. Add token- or session-based auth and enforce roles on the server.
- Database SSL is disabled (ssl_disabled=True), intended for local development only.
- The frontend route guards for private pages are not implemented yet (see the note at the top of App.jsx).

## Author
Diksha Lakhani