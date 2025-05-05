# Full-Stack Mini-Notizblock (React + Node.js + Docker)

This project demonstrates a simple full-stack note-taking application.

*   **Frontend:** React application built with Vite (`vite-project` directory).
*   **Backend:** Node.js Express API (`backend` directory).
*   **Deployment:** Both frontend and backend are containerized using Docker and run as separate containers.

## Project Structure

```
node-container/
├── backend/             # Node.js Express API
│   ├── node_modules/    # (Generated)
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js        # API logic
│   ├── Dockerfile       # Backend Docker configuration
│   └── .dockerignore
├── vite-project/        # React Frontend
│   ├── dist/            # (Generated build output)
│   ├── node_modules/    # (Generated)
│   ├── public/
│   ├── src/             # Frontend source code
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile       # Frontend Docker configuration (Nginx)
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md        # Frontend specific README
│   └── vite.config.js
└── README.md            # This file (Overall project README)
```

## Running the Application with Docker

**Prerequisites:** Docker Desktop installed and running.

**1. Build the Backend Docker Image:**

   Navigate to the root directory (`node-container`) in your terminal.

   ```bash
   docker build -t mini-notizblock-backend ./backend
   ```

**2. Build the Frontend Docker Image:**

   The frontend needs to know the URL of the backend API *at build time*. Since we'll run the backend container exposing port 3000 on the host machine, the frontend (running in the browser) can access it via `http://localhost:3000`. We pass this URL as a build argument.

   ```bash
   docker build -t mini-notizblock-frontend --build-arg VITE_API_URL=http://localhost:3000/api ./vite-project
   ```
   *(Note: If your backend runs on a different host or port visible to your browser, adjust the `VITE_API_URL` accordingly)*

**3. Run the Backend Container:**

   This command runs the backend container in detached mode (`-d`), maps the host's port 3000 to the container's port 3000 (`-p 3000:3000`), sets the `PORT` environment variable inside the container (`-e PORT=3000`), and names the container `backend-app`.

   ```bash
   docker run -d -p 3000:3000 --name backend-app -e PORT=3000 mini-notizblock-backend
   ```
   You can check backend logs with: `docker logs backend-app`

**4. Run the Frontend Container:**

   This command runs the frontend container in detached mode (`-d`), maps the host's port 8080 to the container's port 80 (where Nginx listens) (`-p 8080:80`), and names the container `frontend-app`.

   ```bash
   docker run -d -p 8080:80 --name frontend-app mini-notizblock-frontend
   ```

**5. Access the Application:**

   Open your web browser and navigate to: [http://localhost:8080](http://localhost:8080)

   The React application should load, and it will make API calls to the backend running at `http://localhost:3000/api`.

**6. Stopping and Removing Containers:**

   ```bash
   docker stop frontend-app backend-app
   docker rm frontend-app backend-app
   ```

## Development (Without Docker)

**1. Run Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   (API runs on http://localhost:3000 by default)

**2. Run Frontend:**
   ```bash
   cd ../vite-project
   npm install
   npm run dev
   ```
   (Frontend runs on http://localhost:5173 by default and will use the fallback API URL `http://localhost:3000/api` defined in `App.jsx`)

## Configuration

*   **Backend Port:** Configured via the `PORT` environment variable (passed during `docker run` or system environment). Defaults to 3000.
*   **Frontend API URL:** Configured via the `VITE_API_URL` build argument during the `docker build` step for the frontend image. This value is baked into the static frontend files.