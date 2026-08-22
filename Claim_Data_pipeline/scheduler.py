from apscheduler.schedulers.blocking import BlockingScheduler
from pipeline.main import run_pipeline
from config.settings import FETCH_INTERVAL_MINUTES
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def start_scheduler():
    scheduler = BlockingScheduler()
    
    # Run once at start
    logger.info("Initial run...")
    run_pipeline()
    
    # Schedule periodic runs
    logger.info(f"Scheduling pipeline to run every {FETCH_INTERVAL_MINUTES} minutes.")
    scheduler.add_job(run_pipeline, 'interval', minutes=FETCH_INTERVAL_MINUTES)
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")

if __name__ == "__main__":
    start_scheduler()
