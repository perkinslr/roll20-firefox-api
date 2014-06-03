roll20api.xpi: install.rdf chrome.manifest content/browserOverlay.xul content/roll20api.js locale/en-US/browserOverlay.dtd skin/browserOverlay.css
	zip install.rdf chrome.manifest content/browserOverlay.xul content/roll20api.js locale/en-US/browserOverlay.dtd skin/browserOverlay.css

roll20api.so: roll20api.c
	gcc -shared -fPIC -o roll20api.so roll20api.c `python-config --cflags` `python-config --ldflags` -g3

all: roll20api.so roll20api.xpi
