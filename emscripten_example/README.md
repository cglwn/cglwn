This is an example of how to use emscripten to  bind C++ to JavaScript.
It defines an `addOne` function in C++ which is then invoked through JavaScript.

1. Install emscripten and source its `emsdk_env.sh`
2. Run `emcc --bind -o add.js -g4 add.cpp` in the `src` folder.
3. Open `index.html` in a web browser and open the console to see the result of JS->C++ FFI.
