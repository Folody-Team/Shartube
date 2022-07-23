from .modules.Me import testMeQuery
from .modules.Register import testRegisterQuery

testFunc = [testRegisterQuery,testMeQuery]
state = {}

for test in testFunc :
    state = test(state)