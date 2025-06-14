import os
import logging
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role key instead of anon key
)

def fetch_gdacs_data():
    """Fetch disaster data from GDACS API"""
    try:
        # GDACS RSS feed URL for recent disasters
        url = "https://www.gdacs.org/xml/rss.xml"
        response = requests.get(url)
        response.raise_for_status()
        
        # Parse the XML response
        from xml.etree import ElementTree
        root = ElementTree.fromstring(response.content)
        
        disasters = []
        for item in root.findall('.//item'):
            try:
                title = item.find('title').text
                description = item.find('description').text
                pub_date = item.find('pubDate').text
                link = item.find('link').text
                
                # Extract disaster type and severity from title
                disaster_type = 'Unknown'
                severity = 'Low'
                
                if 'earthquake' in title.lower():
                    disaster_type = 'Earthquake'
                elif 'flood' in title.lower():
                    disaster_type = 'Flood'
                elif 'tropical cyclone' in title.lower() or 'hurricane' in title.lower():
                    disaster_type = 'Hurricane'
                elif 'volcano' in title.lower():
                    disaster_type = 'Volcano'
                elif 'tsunami' in title.lower():
                    disaster_type = 'Tsunami'
                
                if 'red' in title.lower():
                    severity = 'High'
                elif 'orange' in title.lower():
                    severity = 'Medium'
                
                # Extract location from title (usually in format "Disaster in Location")
                location = title.split(' in ')[-1].strip()
                
                disasters.append({
                    'title': title,
                    'description': description,
                    'type': disaster_type,
                    'severity': severity,
                    'location': location,
                    'source': 'GDACS',
                    'status': 'Active',
                    'url': link,
                    'created_at': pub_date,
                    'last_update': datetime.utcnow().isoformat()
                })
            except Exception as e:
                logger.error(f"Error processing GDACS item: {e}")
                continue
                
        return disasters
    except Exception as e:
        logger.error(f"Error fetching GDACS data: {e}")
        return []

def fetch_usgs_earthquakes():
    """Fetch earthquake data from USGS API"""
    try:
        # USGS API endpoint for significant earthquakes in the last 30 days
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        earthquakes = []
        for feature in data['features']:
            try:
                properties = feature['properties']
                geometry = feature['geometry']
                
                # Calculate severity based on magnitude
                magnitude = properties['mag']
                if magnitude >= 6.0:
                    severity = 'High'
                elif magnitude >= 5.0:
                    severity = 'Medium'
                else:
                    severity = 'Low'
                
                earthquakes.append({
                    'title': f"Earthquake M{magnitude}",
                    'description': properties['title'],
                    'type': 'Earthquake',
                    'severity': severity,
                    'location': properties['place'],
                    'source': 'USGS',
                    'status': 'Active',
                    'url': properties['url'],
                    'magnitude': magnitude,
                    'latitude': geometry['coordinates'][1],
                    'longitude': geometry['coordinates'][0],
                    'created_at': datetime.fromtimestamp(properties['time'] / 1000).isoformat(),
                    'last_update': datetime.utcnow().isoformat()
                })
            except Exception as e:
                logger.error(f"Error processing USGS earthquake: {e}")
                continue
                
        return earthquakes
    except Exception as e:
        logger.error(f"Error fetching USGS data: {e}")
        return []

def store_disaster_data(disaster_data):
    """Store disaster data in Supabase"""
    try:
        # Check if disaster already exists (using title and source as unique identifier)
        response = supabase.table('disasters').select('*').eq('title', disaster_data['title']).eq('source', disaster_data['source']).execute()
        
        if response.data:
            # Update existing record
            disaster_id = response.data[0]['id']
            supabase.table('disasters').update(disaster_data).eq('id', disaster_id).execute()
            logger.info(f"Updated disaster data for ID: {disaster_id}")
        else:
            # Insert new record
            response = supabase.table('disasters').insert(disaster_data).execute()
            logger.info(f"Inserted new disaster data with ID: {response.data[0]['id']}")
    except Exception as e:
        logger.error(f"Error storing disaster data: {e}")

def fetch_and_store_disasters():
    """Main function to fetch and store disaster data"""
    try:
        # Fetch data from all sources
        gdacs_disasters = fetch_gdacs_data()
        usgs_earthquakes = fetch_usgs_earthquakes()
        
        # Combine all disasters
        all_disasters = gdacs_disasters + usgs_earthquakes
        
        # Store each disaster
        for disaster in all_disasters:
            try:
                store_disaster_data(disaster)
            except Exception as e:
                logger.error(f"Error storing disaster: {e}")
                continue
        
        logger.info(f"Disaster data ingestion completed. Processed {len(all_disasters)} disasters.")
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        logger.exception("Full traceback:")

if __name__ == "__main__":
    fetch_and_store_disasters() 