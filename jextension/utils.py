import pandas as pd
import numpy as np
import os
import sys
from tornado.web import HTTPError
import matplotlib.pyplot as plt
from jextension.parallel import *
from ctypes import *

def formatSize(_bytes):
    '''
    return file size (an integer)
    '''
    try:
        _bytes = float(_bytes)
        kb = _bytes / 1024
    except:
        print("Bad format")
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
    app = cdll.LoadLibrary(os.path.dirname(os.path.realpath(__file__)) + '/lib/count_line.so')
    return app.get_line_number(filename)

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
    print("getting lines")
    print("beg %d, end %d" % (beg, end))
    if beg < 0 or end < 0:
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
        #print(bcontent)
        return bcontent
    except UnicodeError:
        raise HTTPError(
            400,
            "%s is not UTF-8 encoded" % filename,
            reason='bad format'
        )
    return ""

def get_lines_after_sort(filename, col):
    lines = sort_by_col(filename, col)
    try:
        bcontent = ''
        for line in lines:
            bcontent = bcontent + line + '\n'
        return bcontent
    except UnicodeError:
        raise HTTPError(
            400,
            "%s is not UTF-8 encoded" % filename,
            reason='bad format'
        )
    return ''

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

def get_row_sum(filename, row):
    data_arr = pd.read_csv(filename, index_col=False, skiprows=row, nrows=1)
    return np.sum(data_arr.as_matrix())

def get_row_ave(filename, row):
    data_arr = pd.read_csv(filename, index_col=False, skiprows=row, nrows=1)
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

def cal_freq(filename, col):
    freq = cal_freq_parallel(filename, col)
    return dict(freq)

def draw_line_chat(filename, r1, c1, r2, c2):
    if r1 == r2:
        print(r1, c1, r2, c2)
        data_arr = pd.read_csv(filename, index_col=False, skiprows=r1, nrows=1)
        data_arr = data_arr.as_matrix()
        data_arr = data_arr[0, c1:c2]
        datasize = len(data_arr)
        x = range(datasize)

        plt.title('Untitled')
        plt.xlabel('index')
        plt.ylabel('Row ' + str(r1))
        plt.plot(x, data_arr, 'r', label='Untitled')
        plt.xticks(x, x, rotation=0)

        plt.legend(bbox_to_anchor=[0.3, 1])
        plt.grid()
        plt.show()
    elif c1 == c2:
        data_arr = pd.read_csv(filename, index_col=False, skiprows=r1, nrows=abs(r2-r1)+1)
        data_arr = data_arr.as_matrix()
        data_arr = data_arr[:, c1]
        datasize = len(data_arr)
        x = range(datasize)

        plt.title('Untitled')
        plt.xlabel('index')
        plt.ylabel('Column ' + str(c1))
        plt.plot(x, data_arr, 'r', label='Untitled')
        plt.xticks(x, x, rotation=0)

        plt.legend(bbox_to_anchor = [0.3, 1])
        plt.grid()
        plt.show()

def draw_bar_chat(filename, r1, c1, r2, c2):
    
    pass

def draw_pie_chat(filename, r1, c1, r2, c2):
    pass
