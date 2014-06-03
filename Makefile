all: roll20api.so roll20api.xpi lis.py

roll20api.xpi: install.rdf chrome.manifest content/browserOverlay.xul content/roll20api.js locale/en-US/browserOverlay.dtd skin/browserOverlay.css
	zip roll20api.xpi install.rdf chrome.manifest content/browserOverlay.xul content/roll20api.js locale/en-US/browserOverlay.dtd skin/browserOverlay.css

roll20api.so: roll20api.c
	gcc -shared -fPIC -o roll20api.so roll20api.c `python-config --cflags` `python-config --ldflags` -g3

lis.py:
	wget -O lis.py http://norvig.com/lispy.py
	patch lis.py < lispy.diff

