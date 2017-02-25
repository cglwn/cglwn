#include <emscripten/bind.h>

#include <iostream>

using emscripten::function;

auto addOne(int x) -> int {
  return x + 1;
}

auto main(int argc, char** argv) -> int {
  std::cout << "Hello world!";
}

EMSCRIPTEN_BINDINGS(my_module) {
  function("addOne", &addOne);
}
