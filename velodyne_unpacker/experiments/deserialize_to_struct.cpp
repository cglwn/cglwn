// LOL WTF is STACK SMASHING
// Deserializing the normal way.
// x: 1.
// y: 2.
// *** stack smashing detected ***: ./deserialize_to_struct terminated
// [1]    3772 abort (core dumped)  ./deserialize_to_struct
#include <cstring>
#include <iostream>

struct Vector2i {
  uint32_t x;
  uint32_t y;
};

auto main() -> int {
  uint8_t bytes[] = {0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00};

  std::cout << "Deserializing the normal way.\n";
  auto x = static_cast<uint32_t>(bytes[0] | (bytes[1] << 8) |
                                       (bytes[2] << 16) | (bytes[3] << 24));
  std::cout << "x: " << x << ".\n";

  auto y = static_cast<uint32_t>(bytes[4] | (bytes[5] << 8) |
                                 (bytes[6] << 16) | (bytes[7] << 24));
  std::cout << "y: " << y << ".\n";


  std::cout << "Deserializing into struct.\n";
  auto vector = Vector2i{};
  memcpy(bytes, &vector, sizeof(Vector2i));
  std::cout << "x: " << vector.x << ".\n";
  std::cout << "y: " << vector.y << ".\n";
}
