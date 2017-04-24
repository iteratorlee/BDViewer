from utils import *
import mpi4py.MPI as MPI  
import numpy as np
import sys

comm = MPI.COMM_WORLD  
comm_rank = comm.Get_rank()  
comm_size = comm.Get_size()  
  
def getColSum(filename, col=0):
    
    pass
