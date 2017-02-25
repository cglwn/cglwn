// Lambdas do not extend the lifetime of a variable.
#include <iostream>

auto getLambdaWithStaleReference() {
  const auto a = 3;
  return [&a] {
    return a;
  };
}
auto main() -> int {
  auto fn = getLambdaWithStaleReference();
  auto b = 3;
  auto c = 10;
  std::cout << fn() << ".\n";

  for (int i = 0; i < 1000; ++i) {
    auto d = 100;
    // std::cout << "b = " << b << ".";
    std::cout << fn() << ".\n";
  }

  return 0;
}
