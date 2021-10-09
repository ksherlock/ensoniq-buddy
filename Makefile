

all: js/application.js js/preact.min.js | js

js/application.js : src/main.jsx src/application.jsx
	esbuild --bundle --jsx-factory=preact.h --format=esm src/main.jsx --outfile=js/application.js 


js/preact.min.js : node_modules/preact/dist/preact.min.js
	cp node_modules/preact/dist/preact.min.js js/preact.min.js

js :
	mkdir js

# js/application.js: src/application.jsx
# 	babel --react --transform-react-jsx pragma=h  --loose --no-comments --runtime polyfill=false \
# 	--minify-constant-folding --minify-numeric-literals \
# 	-o $@ $<

.PHONY: clean
clean:
	$(RM) js/application.js
