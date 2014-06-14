import ctypes,json,r20functions
LOGFILE='/tmp/r20api.log'
try:
	import lis
except:
	lis=None

r20api=ctypes.cdll.LoadLibrary('roll20api.so')

initted=False

def callJSON(func):
	global r20functions
	if func.get('type')=='lisp':
		if lis:
			lis.eval(lis.parse(str(func['content'])))
		else:
			sendMsgToR20('Cannot execute lisp function, lisp functions rely on lispy2 by Peter Norvig, available here:  http://norvig.com/lispy2.html')
	else:
		r20functions=reload(r20functions)
		r20functions.getFunc(func['name'])(func)

def sendMsgToR20(content, type, who='API', **kw):
	o = {'avatar':False, 'content':content, 'type':type, 'playerid':'API', 'who':who}
	o.update(kw)
	msg = json.dumps(o)
	r20api.sendToOutputCallback(msg)



def processInput(string):
	func = None
	print >> open(LOGFILE,'a'), string
	global initted
	if not initted:
		sendMsgToR20('Hello from pyR20API!', 'general')
		initted=True
	args=string.split(' ',1)
	if args[0]=='"pyAPICall':
		try:
			func = json.loads(json.loads(string).split(' ',1)[1])
		except Exception as e:
			sendMsgToR20("Failed, %r" %e, 'general')
		if func:
			callJSON(func)

if lis:
	lis.global_env['send']=sendMsgToR20


try:
	print "Importing better callcc"
	from callslashcc import callcc
	lis.global_env['call/cc']=callcc
	print "imported better callcc"
except:
	pass
