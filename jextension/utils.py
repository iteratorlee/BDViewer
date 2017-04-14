import pandas as pd
import os

def get_lines_skip_rows(filename, beg, end):
	'''Get lines from line NO.beg to line NO.end

	'''
	reader = pd.read_csv(filename, skiprows=beg, nrows=end-beg+1)
	data = reader.to_csv().split('\n')

	for i in range(len(data)):
		data[i] = data[i][data[i].find(',') + 1 : len(data[i])]
		data[i] = data[i] + '\n'
	
	return data

def get_file_line_number(filename):
	'''Get line number of a file

	'''
	file_size = os.path.getsize(filename)
	cmd = 'head -n 100 ' + filename
	header = os.popen(cmd).read()
	header_size = len(header) / 100 + 1
	line_no = file_size / header_size
	
	return line_no


