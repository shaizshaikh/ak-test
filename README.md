# Quiz Application

A real-time quiz application with React frontend and Node.js backend, designed for Azure Web App deployment.

## Local Development

1. **Install dependencies and build:**
   ```bash
   npm run install-deps
   npm run build-frontend
   ```

2. **Start the application:**
   ```bash
   npm start
   ```
   The app will run on http://localhost:5000

3. **For development with hot reload:**
   - Backend: `npm run dev:backend` (runs on port 5000)
   - Frontend: `npm run dev:frontend` (runs on port 5173)

## Azure Web App Deployment

The application is configured for Azure Web App with Node.js 20 runtime.

### Environment Variables (Set in Azure App Settings):
```
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-app-name.azurewebsites.net
MONGO_URI=your-cosmos-db-connection-string
```

### Deployment:
1. Push to GitHub - Azure will automatically build and deploy
2. The build process will:
   - Install all dependencies
   - Build the React frontend
   - Start the Node.js server

## Project Structure

```
├── backend/           # Node.js server with Express and Socket.IO
├── frontend/          # React application
├── package.json       # Root package.json for Azure deployment
├── web.config         # IIS configuration for Azure
├── .env              # Environment variables
└── README.md         # This file
```

## Features

- Real-time quiz management with Socket.IO
- MongoDB/Cosmos DB integration
- Responsive React frontend
- Azure Web App ready deployment
- Single command deployment (`npm start`)

## Database

The application uses Cosmos DB with MongoDB API. Collections and documents are created automatically when data is first saved.