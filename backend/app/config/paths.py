import os
import logging

logger = logging.getLogger(__name__)

# Log the path calculation process
config_file_dir = os.path.dirname(__file__)
logger.info(f"Config file directory: {config_file_dir}")

relative_path = '../../resources/rulebooks'
logger.info(f"Relative path from config: {relative_path}")

RULEBOOKS_PATH = os.path.abspath(
    os.path.join(config_file_dir, relative_path)
)

logger.info(f"Calculated RULEBOOKS_PATH: {RULEBOOKS_PATH}")
logger.info(f"RULEBOOKS_PATH exists: {os.path.exists(RULEBOOKS_PATH)}")

# List contents if directory exists
if os.path.exists(RULEBOOKS_PATH):
    logger.info("Contents of RULEBOOKS_PATH:")
    for item in os.listdir(RULEBOOKS_PATH):
        item_path = os.path.join(RULEBOOKS_PATH, item)
        if os.path.isdir(item_path):
            logger.info(f"  Directory: {item}")
            # List PDFs in subdirectories
            for subitem in os.listdir(item_path):
                if subitem.endswith('.pdf'):
                    logger.info(f"    PDF: {subitem}")
        elif item.endswith('.pdf'):
            logger.info(f"  PDF: {item}")
else:
    logger.warning(f"RULEBOOKS_PATH does not exist: {RULEBOOKS_PATH}")
    # Try to find where we are and what's around
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info("Contents of current directory:")
    for item in os.listdir('.'):
        logger.info(f"  {item}")
    
    # Check if resources directory exists elsewhere
    if os.path.exists('resources'):
        logger.info("Found 'resources' directory in current directory")
        resources_path = os.path.abspath('resources')
        logger.info(f"Resources path: {resources_path}")
        if os.path.exists(os.path.join(resources_path, 'rulebooks')):
            logger.info("Found rulebooks directory in resources")
        else:
            logger.info("No rulebooks directory found in resources")
