import os
import requests
import logging
from datetime import datetime
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from supabase import create_client, Client
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Constants
FIRMS_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/c6.1/csv/MODIS_C6_1_Global_24h.csv"

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# Initialize geocoder
geolocator = Nominatim(user_agent="digital_earth")

def get_location_name(lat, lng):
    """Get location name from coordinates using reverse geocoding"""
    try:
        location = geolocator.reverse(f"{lat}, {lng}", language='en')
        if location:
            address = location.raw.get('address', {})
            # Get the most specific location name available
            city = address.get('city') or address.get('town') or address.get('village') or address.get('suburb')
            state = address.get('state') or address.get('province') or address.get('region')
            country = address.get('country')
            
            # If we have a city and state, use them as the full address
            if city and state:
                full_address = f"{city}, {state}"
                if country:
                    full_address += f", {country}"
            # If we only have a state and country
            elif state and country:
                full_address = f"{state}, {country}"
            # If we only have a country
            elif country:
                full_address = country
            # Fallback to the complete address from the geocoding service
            else:
                full_address = location.address

            return {
                'city': city,
                'state': state,
                'country': country,
                'full_address': full_address
            }
        
        # If geocoding fails, return coordinates as the location
        return {
            'city': None,
            'state': None,
            'country': None,
            'full_address': f"{lat}, {lng}"
        }
    except GeocoderTimedOut:
        logger.warning(f"Geocoding timed out for coordinates: {lat}, {lng}")
        return {
            'city': None,
            'state': None,
            'country': None,
            'full_address': f"{lat}, {lng}"
        }
    except Exception as e:
        logger.error(f"Error in geocoding: {str(e)}")
        return {
            'city': None,
            'state': None,
            'country': None,
            'full_address': f"{lat}, {lng}"
        }

def store_fire_data(fire_data):
    """Store fire data in Supabase if location not in recent 25 records."""
    try:
        location = fire_data.get('location')
        if not location or not location.strip():
            logger.warning("Location field is empty. Skipping insert.")
            return

        fire_location = location.strip().lower()

        # Fetch last 25 records
        recent_check = supabase.table('wildfires')\
            .select('location, id, last_update')\
            .order('last_update', desc=True)\
            .limit(25)\
            .execute()

        recent_locations = [
            record['location'].strip().lower()
            for record in recent_check.data
            if record.get('location')
        ]

        if fire_location not in recent_locations:
            logger.info(f"Inserting new fire data for location: {fire_data['location']}")
            response = supabase.table('wildfires').insert(fire_data).execute()
            if response.data:
                logger.info(f"Inserted fire data for {fire_data['location']} with ID: {response.data[0]['id']}")
            else:
                logger.error(f"Insert response had no data for location: {fire_data['location']}")
        else:
            logger.info(f"Skipped duplicate fire data for {fire_data['location']} (found in recent records)")

    except Exception as e:
        logger.error(f"Error storing fire data: {str(e)}")
        logger.exception("Full traceback:")


def fetch_and_store_fires():
    """Fetch fire data from NASA FIRMS API and store in database"""
    try:
        logger.info("Fetching data from NASA FIRMS API...")
        # Fetch data from NASA FIRMS API
        response = requests.get(FIRMS_URL)
        response.raise_for_status()

        # Process the CSV data
        lines = response.text.strip().split('\n')
        headers = lines[0].split(',')
        logger.info(f"Received {len(lines)-1} fire records from NASA API")
        logger.info(f"CSV Headers: {headers}")
        
        processed_count = 0
        error_count = 0
        
        # Process each line of data
        for line in lines[1:]:
            parts = line.split(',')
            if len(parts) >= 5:
                try:
                    lat = float(parts[0])
                    lng = float(parts[1])
                    
                    # Get location name from coordinates
                    location_data = get_location_name(lat, lng)
                    logger.info(f"Geocoded location for {lat}, {lng}: {location_data['full_address']}")
                    
                    fire_data = {
                        'location': location_data['full_address'],
                        'city': location_data['city'],
                        'state': location_data['state'],
                        'country': location_data['country'],
                        'full_address': location_data['full_address'],
                        'coordinates': {
                            'lat': lat,
                            'lng': lng
                        },
                        'latitude': lat,
                        'longitude': lng,
                        'intensity': 'High' if float(parts[3]) > 0.8 else 'Medium' if float(parts[3]) > 0.4 else 'Low',
                        'size': f"{float(parts[2]):.1f} km²",
                        'temperature': f"{float(parts[3]) * 100:.1f}°C",
                        'wind_speed': f"{float(parts[4]):.1f} km/h",
                        'status': 'Active',
                        'cause': 'Unknown',
                        'threat': 'High' if float(parts[3]) > 0.8 else 'Medium' if float(parts[3]) > 0.4 else 'Low',
                        'last_update': datetime.utcnow().isoformat()
                    }
                    
                    store_fire_data(fire_data)
                    processed_count += 1
                    
                    # Log progress every 100 records
                    if processed_count % 100 == 0:
                        logger.info(f"Processed {processed_count} records...")
                    
                except (ValueError, IndexError) as e:
                    error_count += 1
                    logger.error(f"Error processing line: {line}. Error: {str(e)}")
                    continue

        logger.info(f"Fire data ingestion completed. Processed {processed_count} records with {error_count} errors.")

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from NASA API: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.exception("Full traceback:")

if __name__ == "__main__":
    fetch_and_store_fires() 