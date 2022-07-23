""" Here is the explanation for the code above:
  1. We create a list of all the files in the folder.
  2. We create a list of all the content of the files.
  3. We loop through the files and content and print out the result. 
  4. We use the json library to parse the response.
  5. We use the readAllFile method to get all files in the directory.
  6. We use the for loop to iterate through all files in the directory.
  7. We use the if statement to check if the response is empty.
  8. If the response is empty, we print the message "Case {i+1} ❌".
  9. If the response is not empty, we print the message "Case {i+1} ✅".
"""

import requests
import json
from ReadFile import readAllFile

def testMeQuery (state):
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

  files = [e for e in readAllFile('./MeCase') if e.endswith('.json')]

  content = [txt.read() for txt in [open('./MeCase/' + f) for f in files]]

  for i in range(len(files)):
    new_content = json.loads(content[i])
    res = requests.post('http://localhost:8080/query', headers={
      'Authorization': f'Bearer {new_content["input"]["token"]}'
    }, json={'query': mutation}).json()
    '''
      for false case data return is null
      for true case get token from state["register"]
    '''
    if res["data"]:
      print(f"Case {i+1} ✅")
    else:
      print(f"Case {i+1} ❌")