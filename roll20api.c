#include <Python.h>

PyObject *pModule;
PyObject *pFunc;
int initted=0;

typedef int (*outputCallback)(char*);

outputCallback sendMsgToR20;


int startAPI(){
	if (!initted){
		Py_Initialize();
	}
	else{
		if (pModule){
			Py_DECREF(pModule);
		}
		if (pFunc){
			Py_DECREF(pFunc);
		}
	}
	PyRun_SimpleString("import os,sys;sys.path.extend(os.environ.get('PYTHON_PATH','').split(':'))\n");
	pModule=PyImport_ImportModule("roll20API");
	if (pModule){
		pFunc=PyObject_GetAttrString(pModule, "processInput");
		if (pFunc){
			initted=1;
			return 0;
		}
		Py_Finalize();
		return 2;
	}
	Py_Finalize();
	return 1;
}

int registerCallback(void* cbHandler){
	sendMsgToR20 = cbHandler;
	return 0;
}

int processInput(char* inp){
	if (!inp){
		return 1;
	}
	PyGILState_STATE gillock = PyGILState_Ensure();
	PyObject *pTuple = PyTuple_New(1);
	PyObject *pString = PyString_FromString(inp);
	PyTuple_SetItem(pTuple, 0, pString);
	PyObject_CallObject(pFunc, pTuple);
	Py_DECREF(pString);
	Py_DECREF(pTuple);
	PyGILState_Release(gillock);
	return 0;
}


int sendToOutputCallback(char *msg){
	if (sendMsgToR20){
		return sendMsgToR20(msg);
	}
	return -2;
}
