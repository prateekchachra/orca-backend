# Orca Challenge - Vessel Tracking Application - Backend

This is an Express backend  created for the front end project [`orca-frontend`](https://github.com/prateekchachra/orca-frontend).

## Tech Stack
- Frontend: React Native with MapLibreGL for interactive maps
- Backend: Node.js with WebSocket server and PostgreSQL database
- Database: PostgreSQL for storing vessel data and locations
- WebSocket: Real-time communication for sending and receiving vessel data


## Get started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (for backend database)

### Installation

For installing the frontend please follow the instructions given in the  [Orca challenge frontend repository](https://github.com/prateekchachra/orca-frontend/README.md)

1. Clone the repository:

   ```bash
   git clone https://github.com/prateekchachra/orca-backend.git
   cd orca-backend
   ```
2. Install dependencies
   
   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npm run start
   ```

## API

### WebSocket Endpoint

- **URL:** ws://localhost:5020
The WebSocket server listens for incoming connections from clients and sends vessel data within a specified geographic bounding box.

### Backend Routes

-**GET /:** Returns a simple message indicating the backend is running.
