#include <cstring>
#include <fstream>
#include <iostream>
#include <iterator>
#include <string>
#include <vector>

int main(int argc, char** argv) {
  if (argc < 2) {
    std::cout << "Usage: " << argv[0] << " <pcap_file>\n";
    return 1;
  }
  auto pcap_file = std::ifstream(argv[1], std::ios::binary);

  auto byte_buffer = std::vector<uint8_t>(std::istreambuf_iterator<char>(pcap_file),
                                                std::istreambuf_iterator<char>());
  while (true) {
  }
}
