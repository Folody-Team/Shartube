# method to read all files in a directory
import os
"""
method to read all files in a directory
It will return a name filename. 
To use it use must append it to a array
"""
def readAllFile(path):
  """
    * path: path to the directory
    * return: a list of all files in the directory

    >>> readAllFile('./dir')
    >>> filename
  """
  return os.listdir(path)