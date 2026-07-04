# Serviqo

A full-stack service marketplace platform connecting customers with service providers.

**Live:** [serviqo-three.vercel.app](https://serviqo-three.vercel.app)

## Overview

Serviqo is built with a decoupled architecture: a Next.js frontend and a Node.js/Express REST API backend, communicating over JSON with JWT-based authentication. The frontend is deployed on Vercel and the backend on Render, with MongoDB Atlas as the database and Cloudinary for media storage.

## Features

- **Authentication** — JWT-based login and registration with Bcrypt password hashing and protected routes
- **Service listings** — browse, create, update, and manage service offerings
- **Media uploads** — image management via Cloudinary
- **Responsive design** — mobile-first interface built with a Tailwind CSS design system
- **Decoupled deployment** — frontend and backend developed, deployed, and scaled independently

## Tech Stack

| Layer | Technology | Deployment |
|---|---|---|
| Frontend | Next.js, Tailwind CSS | Vercel |
| Backend | Node.js, Express.js | Render |
| Database | MongoDB, Mongoose | MongoDB Atlas |
| Media storage | Cloudinary | — |
| Authentication | JWT, Bcrypt | — |

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com) account

### Installation

Clone the repository:

```bash
git clone https://github.com/Moiz-002/Serviqo.git
cd Serviqo
```

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the development server:

```bash
npm run dev
```

### Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## API Reference

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new account | No |
| POST | `/api/auth/login` | Authenticate and receive a JWT | No |
| GET | `/api/services` | Retrieve all service listings | No |
| POST | `/api/services` | Create a service listing | Yes |
| PUT | `/api/services/:id` | Update a service listing | Yes |
| DELETE | `/api/services/:id` | Delete a service listing | Yes |

## Security

- Passwords are hashed with Bcrypt before storage; plain-text passwords are never persisted
- JWT verification middleware protects all authenticated routes
- Secrets and credentials are managed through environment variables and excluded from version control

## Roadmap

- Reviews and ratings for service providers
- In-app messaging between customers and providers
- Payment integration
- Admin dashboard

## Author

**Abdul Moiz** — Full-Stack Developer

Email: abdulmoizcoms002@gmail.com
GitHub: [github.com/Moiz-002](https://github.com/Moiz-002)

## License

This project is available for review as part of my development portfolio.
