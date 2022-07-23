""" 
  Here is the explanation for the code above:
  1. We use the requests library to send a POST request to the GraphQL server.
  2. We use the json library to parse the response.
  3. We use the readAllFile method to get all files in the directory.
  4. We use the for loop to iterate through all files in the directory.
  5. We use the if statement to check if the response is empty.
  6. If the response is empty, we print the message "Case {i+1} ❌".
  7. If the response is not empty, we print the message "Case {i+1} ✅".

"""


import requests
import json
from ReadFile import readAllFile

def testRegisterQuery(state):
  files = [e for e in readAllFile('./RegisterCase') if e.endswith('.json')]

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
      state["register"] = res["data"]
      return state
    else:
      print(f"Case {i+1} ❌")
    