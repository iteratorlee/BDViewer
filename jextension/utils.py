import pandas as pd
import numpy as np
import os
import sys
import jextension.log as log
from tornado.web import HTTPError

logger = log.getLogger(app_name='utils', filename='/var/log/BDViewer/jextension.log', level=log.DEBUG)

def formatSize(_bytes):
    '''
    return file size (an integer)
    '''
    try:
        _bytes = float(_bytes)
        kb = _bytes / 1024
    except:
        logger.warn("Bad format")
        return "Error"

    if kb >= 1024:
        M = kb / 1024
        if M >= 1024:
            G = M / 1024
            G = int(G)
            return "%dG" % (G)
        else:
            M = int(M)
            return "%dM" % (M)
    else:
        if kb >= 1:
            kb = int(kb)
            return "%dK" % (kb)
        else:
            _bytes = int(_bytes)
            return "%dB" % _bytes

def get_line_num_py(filename):
    with open(filename) as fd:
        line_num = sum(1 for i in fd)
        return line_num

def get_line_num(filename):
    return get_line_num_py(filename)

def get_tail_lines(filename):
    fd = open(filename)
    cnt = 0
    pos = 0
    while True:
        pos -= 1
        try:
            fd.seek(pos, 2)
            if fd.read(1) == '\n':
                cnt += 1
            if cnt == 1000:
                fd.seek(pos, 2)
                data = fd.readlines()
                content = ''
                for i in range(len(data)):
                    if data[i] == '' or data[i] == '\n':
                        continue
                    data[i] = data[i].strip()
                    content += (data[i] + '\n')
                return content
        except:
            fd.seek(0, 0)
            data = fd.readlines()
            content = ''
            for i in range(len(data)):
                data[i] = data[i].strip()
                content += (data[i] + '\n')
            return content

def get_lines_skip_rows(filename, beg, end):
    '''
    Get lines from line NO.beg to line NO.end

    '''
    logger.debug("getting lines of %s beg %d, end %d" % (filename, beg, end))
    if beg < 0 or end < 0:
        logger.debug('getting tail lines of %s' % filename)
        data = get_tail_lines(filename)
        return data

    reader = pd.read_csv(filename, index_col=False, skiprows=beg, nrows=end-beg+1)
    data = reader.to_csv().split('\n')

    for i in range(len(data)):
        data[i] = data[i][data[i].find(',') + 1 : len(data[i])]
        data[i] = data[i] + '\n'
    
    try:
        bcontent = ''
        for line in data:
            bcontent = bcontent + line
        return bcontent
    except UnicodeError:
        raise HTTPError(
            400,
            "%s is not UTF-8 encoded" % filename,
            reason='bad format'
        )
    return ""

def get_lines_after_sort(filename, col):
    data_arr = pd.read_csv(filename, index_col=False, header=None, usecols=[col])
    res = data_arr.sort_values(by=col)[0:1000].to_csv().split('\n')[1:]
    bcontent = ''
    for line in res:
        if line == '': continue
        bcontent += (line.strip().split(',')[1] + '\n')
    return bcontent

def get_col_sum(filename, col):
    data_arr = pd.read_csv(filename, index_col=False, header=None, usecols=[col])
    return data_arr.sum()[col]

def get_col_ave(filename, col):
    data_arr = pd.read_csv(filename, index_col=False, header=None, usecols=[col])
    return data_arr.mean()[col]

def get_row_sum(filename, row):
    data_arr = pd.read_csv(filename, index_col=False, skiprows=row, nrows=1, header=None)
    return np.sum(data_arr.as_matrix())

def get_row_ave(filename, row):
    data_arr = pd.read_csv(filename, index_col=False, skiprows=row, nrows=1, header=None)
    return np.mean(data_arr.as_matrix())

def get_data_feature(filename, feature_type, dim, index):
    '''
    Get the summision or average value of a column or a row
    '''
    if dim == 0:
        #column
        if feature_type == 0:
            ret = get_col_sum(filename, index)
        elif feature_type == 1:
            ret = get_col_ave(filename, index)
        else:
            ret = -1
    elif dim == 1:
        #row
        if feature_type == 0:
            ret = get_row_sum(filename, index)
        elif feature_type == 1:
            ret = get_row_ave(filename, index)
        else:
            ret = -2

    return ret

def get_file_line_number_rough(filename):
    '''
    Get line number of a file roughly,
    according to the size of first 100 lines
    '''
    file_size = os.path.getsize(filename)
    cmd = 'head -n 100 ' + filename
    header = os.popen(cmd).read()
    header_size = len(header) / 100 + 1
    line_no = file_size / header_size
    
    return line_no

def get_file_line_number(filename):
    '''
    Get line number of a file accurately
    '''
    with open(filename) as fp:
        return sum(1 for x in fp)

