# Project Management Tool

A comprehensive project management application built with a modern tech stack.

## Tech Stack

### Frontend

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI
- **State Management:** TanStack React Query
- **Charts:** Recharts
- **HTTP Client:** Axios

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT, Google Auth
- **Email:** Nodemailer

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Local or Atlas connection string)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-management-tool
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory with the necessary environment variables (e.g., PORT, MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID).

Start the backend server:

```bash
npm run dev
```

The server will typically run on `http://localhost:5000`.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the `frontend` directory if needed (e.g., for `NEXT_PUBLIC_API_URL`).

Start the frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Features

- User Authentication (Email/Password & Google Login)
- Project & Task Management
- Team Collaboration
- Dashboard with Analytics
- Responsive Design
