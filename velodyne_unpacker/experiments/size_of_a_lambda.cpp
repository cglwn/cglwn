// Lambdas take up space.
#include <iostream>
#include <functional>

struct Point {
  uint64_t x;
  uint64_t y;
};

struct PointWithLambdaMember {
  uint64_t x;
  uint64_t y;

  std::function<void()> l1Norm = [&] {
    return x + y;
  };
};

struct PointWithMemberFunction {
  uint64_t x;
  uint64_t y;

  uint64_t l1Norm() {
    return x + y;
  }
};

int main() {
  std::cout << "Point has size " << sizeof(Point) << ".\n";
  std::cout << "PointWithLambdaMember has size " << sizeof(PointWithLambdaMember) << ".\n";
  std::cout << "PointWithMemberFunction has size " << sizeof(PointWithMemberFunction) << ".\n";
}
