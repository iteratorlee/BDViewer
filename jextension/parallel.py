import findspark
findspark.init()

from pyspark import SparkConf, SparkContext
import os
import subprocess
import jextension.log as log

logger = log.getLogger("parallel", log.DEBUG)

APP_NAME = "Notebook Extension"
conf = SparkConf().setAppName(APP_NAME)
conf = conf.setMaster("local[*]")
sc = SparkContext(conf=conf)

def sort_by_col_spark(filename, col):
    '''
    deprecated
    '''
    if not os.path.exists(filename):
        logger.ERROR("File not exist")
        return
    lines = sc.textFile(filename).flatMap(lambda x : x.split('\n'))
    lines = lines.map(lambda x : (float(x.split(',')[col]), x))
    lines = lines.sortByKey().map(lambda x, y : y).collect()
    lines = lines[0:1000]

    return lines

def sort_by_col(filename, col):
    if not os.path.exists(filename):
        logger.ERROR("File not exist")
        return

    cmd = 'mpirun -np 4 /usr/lib/python3.5/jextension/lib/dc_top_k ' + filename + ' ' + str(col) + ' 1000'
    prog = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE)
    data = prog.stdout.read().decode()
    
    return data.strip().split('\t')


def get_col_sum(filename, col):
    if not os.path.exists(filename):
        logger.ERROR("File not exist")
        return

    lines = sc.textFile(filename).flatMap(lambda x : x.split('\n'))
    lines = lines.map(lambda x : float(x.split(',')[col]))
    ret = lines.reduce(lambda x, y : x + y)

    return ret

def get_col_ave(filename, col):
    if not os.path.exists(filename):
        logger.ERROR("File not exist")
        return

    lines = sc.textFile(filename).flatMap(lambda x : x.split('\n'))
    lines = lines.map(lambda x : float(x.split(',')[col]))
    ret = lines.reduce(lambda x, y : x + y)
    line_num = lines.count()

    return ret / float(line_num)

def cal_index(x, col_min, section_size):
    if section_size == 0:
        return 50
    else:
        return int((x - col_min) / section_size)

def cal_freq_parallel(filename, col):
    if not os.path.exists(filename):
        logger.ERROR("File not exist")
        return

    lines = sc.textFile(filename).flatMap(lambda x : x.split('\n'))
    lines = lines.map(lambda x : float(x.split(',')[col]))
    col_max = lines.max()
    col_min = lines.min()
    
    inter_size = col_max - col_min
    line_num = lines.count()
    inter_cnt = 100
    section_size = inter_size / inter_cnt
    
    lines = lines.map(lambda x : cal_index(x, col_min, section_size))
    freq = lines.countByValue()

    return freq
