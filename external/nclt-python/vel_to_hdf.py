# !/usr/bin/python
#
# Convert the velodyne_hits binary files to a rosbag
#
# To call:
#
#   python vel_to_rosbag.py velodyne_hits.bin vel.hdf
#
import sys
import struct

import numpy as np
import pandas as pd

def convert(x_s, y_s, z_s):

    scaling = 0.005 # 5 mm
    offset = -100.0

    x = x_s * scaling + offset
    y = y_s * scaling + offset
    z = z_s * scaling + offset

    return x, y, z

def verify_magic(s):

    magic = 44444

    m = struct.unpack('<HHHH', s)

    return len(m)>=3 and m[0] == magic and m[1] == magic and m[2] == magic and m[3] == magic

def main(args):

    if len(sys.argv) < 2:
        print 'Please specify velodyne hits file'
        return 1

    if len(sys.argv) < 3:
        print 'Please specify output HDF file'
        return 1

    f_bin = open(sys.argv[1], "r")
    print sys.argv[1]
    sys.exit(0)
    try:
        while True:
            magic = f_bin.read(8)
            if magic == '': # eof
                break

            if not verify_magic(magic):
                print "Could not verify magic"

            num_hits = struct.unpack('<I', f_bin.read(4))[0]
            utime = struct.unpack('<Q', f_bin.read(8))[0]

            f_bin.read(4) # padding

            # Read all hits
            xs = []
            ys = []
            zs = []
            intensities = []
            ls = []
            for i in range(num_hits):
                x = struct.unpack('<H', f_bin.read(2))[0]
                y = struct.unpack('<H', f_bin.read(2))[0]
                z = struct.unpack('<H', f_bin.read(2))[0]
                i = struct.unpack('B', f_bin.read(1))[0]
                l = struct.unpack('B', f_bin.read(1))[0]

                x, y, z = convert(x, y, z)

                xs.append(x)
                ys.append(y)
                zs.append(z)
                intensities.append(i)
                ls.append(l)

            # Now write out to HDF.
            packet = pd.DataFrame({
                "LI_x": xs,
                "LI_y": ys,
                "LI_z": zs,
                "intensity": intensities,
                "laser": ls
            })

            # This is not really true. See Appendix E of the manual.
            packet["unix_time"] = utime
            packet.to_hdf(sys.argv[2], "velodyne_hits", append=True)
    except Exception as e:
        print 'End of File'
        print e
    finally:
        f_bin.close()
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv))
