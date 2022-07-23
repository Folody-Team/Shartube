import requests
import json
import os

def read_all_file(path):
    files = os.listdir(path)
    return files

files = [e for e in read_all_file('./RegisterCase') if e.endswith('.json')]

content = [txt.read() for txt in [open('./RegisterCase/' + f) for f in files]]

line2 = "{"
line3 = "}"

for i in range(len(files)):
  new_content = json.loads(content[i])
  mutation = f"""mutation Register {line2}
  Register(
    input: {line2}username: "{new_content["input"]["username"]}", password: "{new_content["input"]["password"]}", email: "{new_content["input"]["email"]}"{line3}
  ) {line2}
    user {line2}
      _id
      username
      email
      password
      createdAt
      updatedAt
    {line3}
    accessToken
  {line3}
{line3}"""
  res = requests.post('http://localhost:8080/query', json={'query': mutation}).json()
  if res["data"]:
    print(f"Case {i+1} ✅")
  else:
    print(f"Case {i+1} ❌")