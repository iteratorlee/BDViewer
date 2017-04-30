import pandas as pd
import os
from tornado.web import HTTPError
import matplotlib.pyplot as plt

def get_lines_skip_rows(filename, beg, end):
    '''
    Get lines from line NO.beg to line NO.end

    '''
    print("getting lines")
    reader = pd.read_csv(filename, skiprows=beg, nrows=end-beg+1)
    data = reader.to_csv().split('\n')
    

    print("beg %d, end %d" % (beg, end))
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

def draw_line_chat(filename, r1, c1, r2, c2):
    #test
    if r1 == r2:
		#do sth
        print(r1, c1, r2, c2)
        data_arr = pd.read_csv(filename, skiprows=r1, nrows=1)
        data_arr = data_arr.as_matrix()
        data_arr = data_arr[0, c1:c2]
        print(data_arr)
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
        #do sth 
        data_arr = pd.read_csv(filename, skiprows=r1, nrows=abs(r2-r1)+1)
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
