import logging
import sys

NOTSET=logging.NOTSET
DEBUG=logging.DEBUG
INFO=logging.INFO
WARNING=logging.WARNING
ERROR=logging.ERROR
CRITICAL=logging.CRITICAL


def getLoggerWithoutConfig(app_name):
    return logging.getLogger(app_name)

def getLoggerInternal(app_name):
    logger = getLoggerWithoutConfig(app_name)
    
    formatter = logging.Formatter('%(asctime)s %(levelname)-8s: %(message)s')
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger

def getLogger(app_name, level=logging.WARN):
    logger = getLoggerInternal(app_name)
    logger.setLevel(level)

    return logger
