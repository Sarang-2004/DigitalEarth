import time
import logging
from disaster_ingestion import fetch_and_store_disasters

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting disaster data ingestion process")
    
    while True:
        try:
            fetch_and_store_disasters()
            logger.info("Waiting 15 minutes before next ingestion cycle")
            time.sleep(15 * 60)  # Wait 15 minutes between cycles
        except Exception as e:
            logger.error(f"Error in ingestion cycle: {str(e)}")
            logger.info("Waiting 5 minutes before retrying")
            time.sleep(5 * 60)  # Wait 5 minutes before retrying on error

if __name__ == "__main__":
    main() 