# Digital Earth

An interactive 3D globe to visualize real-time and historical global data, including wildfires, climate patterns, and natural disasters.

## Features

- **Interactive 3D Globe:** Explore global datasets on a responsive 3D globe built with Three.js and React.
- **Real-time Wildfire Tracking:** Visualize active wildfires across the globe with data updated in real-time.
- **Climate Data Visualization:** (Work in Progress) View various climate patterns and metrics.
- **Natural Disaster Monitoring:** (Work in Progress) Track significant natural disasters.
- **REST API:** A Python Flask backend serves the data to the frontend.
- **Data Ingestion:** Scripts to ingest and process data from various sources into a Supabase database.

## Tech Stack

**Frontend:**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/) (via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) & [@react-three/drei](https://github.com/pmndrs/drei))
- [Tailwind CSS](https://tailwindcss.com/)
- [Material UI](https://mui.com/)
- [React Router](https://reactrouter.com/)

**Backend:**
- [Python](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Supabase](https://supabase.io/) (via `supabase-py`)

**Database:**
- [Supabase](https://supabase.io/) (PostgreSQL)

## Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (v3.8 or higher)
- A [Supabase](https://supabase.com/) account

### 1. Backend Setup

First, set up the Python environment and install dependencies.

```bash
# Navigate to the server directory
cd server

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\\Scripts\\activate`

# Install dependencies
pip install -r requirements.txt
```

Next, configure your environment variables. Create a file named `.env` inside the `server/` directory by copying the example:

```bash
# Make sure you are in the server/ directory
cp .env.example .env  # or create .env manually
```

Edit the `.env` file with your Supabase credentials:
```
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_KEY
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_KEY
```

### 2. Database Setup

The necessary tables are defined in the `supabase/migrations/` directory. Run these migrations in your Supabase project's SQL Editor to set up the database schema.

### 3. Frontend Setup

In a new terminal, navigate to the project root and install the Node.js dependencies.

```bash
# From the project root
npm install
```

## Running the Application

1.  **Start the Backend Server:**
    Make sure you are in the `server/` directory with your virtual environment activated.
    ```bash
    python app.py
    ```
    The backend will be running on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    In another terminal, from the project root directory:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## Data Ingestion

The `server/` directory contains several `*_ingestion.py` scripts. These are designed to be run manually or on a schedule to populate the database with data from external sources.

To run an ingestion script:
```bash
# Make sure you are in the server/ directory with your venv active
python fire_ingestion.py
python run_disaster_ingestion.py
```
