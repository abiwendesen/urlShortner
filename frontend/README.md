# Frontend (React)

Simple React frontend for the URL shortener backend.

## Run

1. Start backend at project root:
   - `npm start`
2. In a second terminal:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
3. Open `http://localhost:5173`

## Integration details

- Frontend calls `POST /api/short`.
- Vite proxy forwards `/api/*` to `http://localhost:5000/*`.
- Backend response expected:
  - Success: `{ "message": "http://localhost:5000/<code>" }`
  - Error: `{ "message": "..." }`
