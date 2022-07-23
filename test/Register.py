import requests
import json
import os

# read all file in RegisterCase folder
def read_all_file(path):
    files = os.listdir(path)
    return files


files = [e for e in read_all_file('./RegisterCase') if e.endswith('.txt')]

content = [txt.read() for txt in [open('./RegisterCase/' + f) for f in files]]


for i in range(len(files)):
  mutation = f"""{content[i]}"""
  res = requests.post('http://localhost:8080/query', json={'query': mutation}).json()

  print(json.dumps(res, indent=2))