import os

def readFile(path):
  return os.listdir(path)

files = [e for e in readFile('./modules') if e.endswith('.py')]
list = ""

for i in range(len(files)):
  list += f"""{i+1}. {files[i].replace('.py', '')}\n"""
  
Input = input(f"{list} \nEnter the module you want to test: ")

if Input:
  Input = f"{Input}.py"
  if Input in files:
    os.system(f"python3 ./modules/{Input}")
  else:
    print("Module not found")