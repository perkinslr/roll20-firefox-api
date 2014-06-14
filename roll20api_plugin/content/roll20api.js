roll20api = {};


/*roll20api.findChildByClass=(function(node, cl){
	for (var i=0;i<node.childNodes.length;i++){
		if (node.childNodes[i].className==cl){
			return node.childNodes[i];
		}
	}
});*/

roll20api.start=(function(event){
	var l = content.document.getElementById('textchat-input');
	//var l = content.document.getElementById('apiconsole');
	if (l){
		roll20api.startReading();
	}
	else{
		alert('API console not loaded');
	}
});




roll20api.startReading=(function(){
	Components.utils.import("resource://gre/modules/ctypes.jsm");
	roll20api.so = ctypes.open("roll20api.so");
	roll20api.so.processInput = roll20api.so.declare('processInput',ctypes.default_abi, ctypes.int, ctypes.PointerType(ctypes.char));
	roll20api.so.init = roll20api.so.declare('startAPI',ctypes.default_abi, ctypes.int);
	var l = roll20api.so.init();
	if (l){
		alert('Failed to load roll20api');
		return ;
	}
	roll20api.so.registerCallback = roll20api.so.declare('registerCallback',ctypes.default_abi, ctypes.int, ctypes.voidptr_t);
	
	var scripts = content.document.getElementsByTagName('script');
	/*for (var i=0;i<scripts.length;i++){
		var s = scripts[i];
		if (s.text.indexOf('var notifier = root.child')+1){
			var campaignRoot=s.text.split('var notifier = root.child("api-notifiers").child("')[1].split('")')[0];
			break;
		}
	}*/
	var w = XPCNativeWrapper.unwrap(content.window);
	var campaignRoot = w.campaign_storage_path;
	if (!campaignRoot){
		alert("Let the page finish loading!");
	}
	
	
	roll20api.fb = new w.Firebase(w.FIREBASE_ROOT);
	var fb=roll20api.fb;
	roll20api.chat=fb.child(campaignRoot).child('chat');
	
	fb.auth(w.GNTKN,function(authinfo){
		var apilog=fb.child(campaignRoot).child('apilog');
		roll20api.chat.once('child_added', function(c){
			roll20api.chatchild=c.val();
		});
		apilog.on('value', function(snap){
			var m = snap.val().msg;
			var cbptr = ctypes.FunctionType(
                  ctypes.default_abi, 
                  ctypes.int,         // return void
                  [ctypes.char.ptr]         // in WPARAM
                  ).ptr(roll20api.sendMessageToRoll20);
            roll20api.so.registerCallback(cbptr);
			(roll20api.so.processInput(m));
			
		});
	});
	
	
});


roll20api.sendMessageToRoll20=function(msgptr){
	try{
		var msg=JSON.parse(msgptr.readString());
	}
	catch(err){
		console.log(err);
		return -1;
	}
	//console.log(msg);
	//console.log(roll20api.chatchild);
	//roll20api.chat.push(roll20api.chatchild);
	for (var i in msg){
		roll20api.chatchild[i]=msg[i];
	}
	//roll20api.chatchild['content']=msg['content'];
	//roll20api.chatchild['type']=msg['type'];
	roll20api.chat.push(roll20api.chatchild);
	return 0;
}


/*
function myJSCallback(foo, bar) { .... };
var funcType = ctypes.FunctionType(...);
var funcPtrType = funcType.ptr;
var regularFuncPtr = funcPtrType();
var callback = funcPtrType(myJSCallback);

var SetHotkeyCallback = mylib.declare("SetHotkeyCallback",
ctypes.default_abi,
ctypes.void_t,         // return void
ctypes.voidptr_t      // in HotkeyCallback
);
* */

