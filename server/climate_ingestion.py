from dotenv import load_dotenv
import os
import logging
import requests
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# API Keys
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
NASA_API_KEY = os.getenv('NASA_API_KEY')
NOAA_API_KEY = os.getenv('NOAA_API_KEY')

# Request timeout in seconds
REQUEST_TIMEOUT = 10

def get_aqi_value(aq_data):
    """Safely extract AQI value from air quality data"""
    try:
        results = aq_data.get('results', [])
        if not results:
            return 0
        
        measurements = results[0].get('measurements', [])
        if not measurements:
            return 0
            
        return measurements[0].get('value', 0)
    except (IndexError, KeyError, TypeError) as e:
        logger.warning(f"Error extracting AQI value: {str(e)}")
        return 0

def fetch_climate_data(city):
    """Fetch climate data for a specific city"""
    try:
        logger.info(f"Fetching climate data for city: {city}")
        
        if not city:
            raise ValueError('City parameter is required')

        if not OPENWEATHER_API_KEY:
            logger.error("OPENWEATHER_API_KEY is not set in environment variables")
            raise ValueError("Weather API key is not configured")

        # Get coordinates for the city using OpenWeatherMap Geocoding API
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHER_API_KEY}"
        logger.info(f"Fetching coordinates from: {geo_url}")
        geo_response = requests.get(geo_url, timeout=REQUEST_TIMEOUT)
        geo_response.raise_for_status()
        geo_data = geo_response.json()

        if not geo_data:
            logger.warning(f"No coordinates found for city: {city}")
            raise ValueError('City not found')

        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        logger.info(f"Found coordinates: lat={lat}, lon={lon}")

        # Get weather data from OpenWeatherMap
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}"
        logger.info(f"Fetching weather data from: {weather_url}")
        weather_response = requests.get(weather_url, timeout=REQUEST_TIMEOUT)
        weather_response.raise_for_status()
        weather_data = weather_response.json()

        # Get air quality data from OpenAQ
        aq_url = f"https://api.openaq.org/v2/latest?coordinates={lat},{lon}&radius=10000"
        logger.info(f"Fetching air quality data from: {aq_url}")
        try:
            aq_response = requests.get(aq_url, timeout=REQUEST_TIMEOUT)
            aq_data = aq_response.json() if aq_response.ok else {'results': []}
        except Exception as e:
            logger.warning(f"Failed to fetch air quality data: {str(e)}")
            aq_data = {'results': []}

        # Get solar radiation data from NASA POWER API
        nasa_url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude={lon}&latitude={lat}&format=JSON&start=20240101&end=20240101"
        logger.info(f"Fetching solar radiation data from: {nasa_url}")
        try:
            nasa_response = requests.get(nasa_url, timeout=REQUEST_TIMEOUT)
            nasa_data = nasa_response.json() if nasa_response.ok else {'properties': {'parameter': {'ALLSKY_SFC_SW_DWN': {'20240101': 0}}}}
        except Exception as e:
            logger.warning(f"Failed to fetch solar radiation data: {str(e)}")
            nasa_data = {'properties': {'parameter': {'ALLSKY_SFC_SW_DWN': {'20240101': 0}}}}

        # Get precipitation data from NOAA (optional)
        noaa_data = {'properties': {'forecast': ''}}
        try:
            noaa_url = f"https://api.weather.gov/points/{lat},{lon}"
            logger.info(f"Fetching precipitation data from: {noaa_url}")
            noaa_response = requests.get(noaa_url, headers={'User-Agent': 'DigitalEarth/1.0'}, timeout=REQUEST_TIMEOUT)
            if noaa_response.ok:
                noaa_data = noaa_response.json()
        except Exception as e:
            logger.warning(f"Failed to fetch NOAA data: {str(e)}")

        # Combine all data
        climate_data = {
            'city': city,
            'temperature': round(weather_data['main']['temp'], 1),
            'feels_like': round(weather_data['main']['feels_like'], 1),
            'humidity': weather_data['main']['humidity'],
            'wind_speed': round(weather_data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
            'wind_direction': weather_data['wind']['deg'],
            'precipitation': weather_data.get('rain', {}).get('1h', 0),
            'aqi': get_aqi_value(aq_data),
            'solar_radiation': round(nasa_data.get('properties', {}).get('parameter', {}).get('ALLSKY_SFC_SW_DWN', {}).get('20240101', 0), 1),
            'uv_index': weather_data.get('uvi', 0),
            'ocean_ph': 8.1,  # Default value, as ocean pH data is not readily available through public APIs
            'last_update': datetime.utcnow().isoformat()
        }

        logger.info(f"Successfully fetched climate data for {city}")
        return climate_data

    except requests.exceptions.RequestException as e:
        logger.error(f"API request error: {str(e)}")
        logger.error(f"Request URL: {e.request.url if hasattr(e, 'request') else 'Unknown'}")
        logger.error(f"Response status: {e.response.status_code if hasattr(e, 'response') else 'Unknown'}")
        logger.error(f"Response text: {e.response.text if hasattr(e, 'response') else 'Unknown'}")
        raise Exception('Failed to fetch climate data')
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.exception("Full traceback:")
        raise
