import requests
import json
import os


mutation = """
  query Me {
    Me {
      _id
      username
      email
      password
      createdAt
      updatedAt
    }
  }
"""
def read_all_file(path):
    files = os.listdir(path)
    return files


files = [e for e in read_all_file('./MeCase') if e.endswith('.json')]

content = [txt.read() for txt in [open('./MeCase/' + f) for f in files]]

for i in range(len(files)):
  new_content = json.loads(content[i])
  res = requests.post('http://localhost:8080/query', headers={
    'Authorization': f'Bearer {new_content["input"]["token"]}'
  }, json={'query': mutation}).json()

  if res["data"]:
    print(f"Case {i+1} ✅")
  else:
    print(f"Case {i+1} ❌")