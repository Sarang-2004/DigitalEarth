from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from supabase import create_client, Client
from fire_ingestion import fetch_and_store_fires
from climate_ingestion import fetch_climate_data
import logging
from datetime import datetime
import requests
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# API Keys
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
NASA_API_KEY = os.getenv('NASA_API_KEY')
NOAA_API_KEY = os.getenv('NOAA_API_KEY')

@app.route('/api/climate')
def get_climate_data():
    """Get climate data for a specific city"""
    try:
        city = request.args.get('city')
        logger.info(f"Received request for climate data: city={city}")
        climate_data = fetch_climate_data(city)
        return jsonify(climate_data)
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error fetching climate data: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({'error': 'Failed to fetch climate data', 'details': str(e)}), 500

@app.route('/api/fires')
def get_fires():
    """Get all fires from the database"""
    try:
        # Get fires ordered by last_update in descending order
        response = supabase.table('wildfires')\
            .select('*')\
            .order('last_update', desc=True)\
            .execute()
            
        if not response.data:
            logger.warning("No fire data found in database")
            return jsonify([])
            
        logger.info(f"Retrieved {len(response.data)} fire records")
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error fetching fires: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({'error': 'Failed to fetch fire data'}), 500

@app.route('/api/test-nasa')
def test_nasa():
    """Test endpoint to fetch and store fire data"""
    try:
        fetch_and_store_fires()
        return jsonify({'message': 'Fire data updated successfully'})
    except Exception as e:
        logger.error(f"Error in test-nasa endpoint: {str(e)}")
        return jsonify({'error': 'Failed to update fire data'}), 500

@app.route('/api/disasters')
def get_disasters():
    try:
        # Fetch disasters from Supabase, ordered by creation date
        response = supabase.table('disasters').select('*').order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        logger.error(f"Error fetching disasters: {str(e)}")
        return jsonify({'error': 'Failed to fetch disaster data'}), 500

if __name__ == '__main__':
    app.run(debug=True) 