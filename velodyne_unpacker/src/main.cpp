#include <fstream>
#include <iostream>
#include <iterator>
#include <string>
#include <vector>

// Reference for these structures: https://wiki.wireshark.org/Development/LibpcapFileFormat.
struct PcapGlobalHeader {
  // Fun fact: I realized that I should be checking the first four bytes  of the PCAP by
  // thinking about what the reversed magic number is. I previously had these as
  // uint8_t but realized these were four bytes. Doh.
  static constexpr auto expected_magic_number = static_cast<uint32_t>(0xa1b2c3d4);

  static constexpr auto reversed_expected_magic_number = static_cast<uint32_t>(0xd4c3b2a1);

  uint32_t magic_number;
  uint32_t version_major;
  uint16_t version_minor;
  int32_t timezone_correction;
  uint32_t timestamp_accuracy_significant_figures;
  uint32_t snaplen;
  uint32_t network;
};

class PcapPacketHeader {
  uint32_t ts_sec;
  uint32_t ts_usec;
  uint32_t incl_len;
  uint32_t orig_len;
};

int main(int argc, char** argv) {
  if (argc < 2) {
    std::cout << "Usage: " << argv[0] << " <pcap_file>\n";
    return 1;
  }
  auto pcap_file = std::ifstream(argv[1], std::ios::binary);

  auto byte_buffer = std::vector<uint8_t>(std::istreambuf_iterator<char>(pcap_file),
                                                std::istreambuf_iterator<char>());
  auto first_four_bytes = static_cast<uint32_t>(byte_buffer[0] | (byte_buffer[1] << 8) | (byte_buffer[2] << 16) | (byte_buffer[3] << 24));
  /// \todo (James Cagalawan) Move this magic number checking to PcapGlobalHeader.
  if (first_four_bytes == PcapGlobalHeader::expected_magic_number) {
    std::cout << "The endian-ness of this PCAP file matches this computer.\n";
  } else if (first_four_bytes == PcapGlobalHeader::reversed_expected_magic_number) {
    std::cout << "The endian-ness of this PCAP file DOES NOT matche this computer.\n";
  } else {
    std::cout << "Could not find the magic number." << std::endl;
  }
}

