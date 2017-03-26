This shows an example of using nbind to create JavaScript bindings for C++.
Emscripten is needed in order to run it.

1. Install dependencies.
`npm install --save nbind autogypi node-gyp`
2. Create the GYP build configuration.
`npm run -- autogypi --init-gyp -p nbind -s hello.cpp`
3. Compile to asm.js.
`npm run -- node-gyp configure build --asmjs=1`
4. Copy the HTML to the build folder.
`cp index.html build/Release`
5. Run a server from the build folder and open `localhost:8000` in your browser.
`cd build/Release && python -m SimpleHTTPServer`
6. See output in browser console.
