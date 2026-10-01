# Quick Chat

Quick Chat is a real-time messaging app built with React, Express, MongoDB, and Socket.IO. Users can create an account, update their profile, see who is online, and exchange text and image messages.

## Features

- Account signup and login with JWT authentication
- One-to-one messaging with live delivery through Socket.IO
- Online user presence and unread message counts
- Image attachments and profile pictures uploaded to Cloudinary
- Profile name and bio editing

## Requirements

- Node.js and npm
- MongoDB, either a local instance or a MongoDB Atlas cluster
- A Cloudinary account for image uploads

## Setup

1. Install dependencies in both application folders:

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. Create `server/.env` with your own service credentials:

   ```dotenv
   MONGODB_URI=mongodb://127.0.0.1:27017
   PORT=5000
   JWT_SECRET=replace-with-a-long-random-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   The server adds the `chat-app` database name to `MONGODB_URI`. For MongoDB Atlas, use your cluster connection URI in place of the local URI.

3. Create `client/.env`:

   ```dotenv
   VITE_BACKEND_URL=http://localhost:5000
   ```

   Keep both `.env` files local. Do not commit credentials; rotate any credentials that have been exposed.

## Run Locally

Start the backend from the `server` directory:

```bash
npm start
```

In a second terminal, start the frontend from the `client` directory:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The backend status endpoint is available at `http://localhost:5000/api/status`.

## Scripts

### Client (`client`)

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build in `dist`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

### Server (`server`)

- `npm start` starts the Express and Socket.IO server.
- `npm run server` starts the server with Nodemon, if Nodemon is installed.

## Project Structure

```text
client/   React application and Vite configuration
server/   Express API, Socket.IO server, and MongoDB models
```

The API exposes authentication routes under `/api/auth` and messaging routes under `/api/messages`. Protected routes require authentication.