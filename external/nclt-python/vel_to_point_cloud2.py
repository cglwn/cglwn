# !/usr/bin/python
#
# Convert the velodyne_hits binary files to a rosbag
#
# To call:
#
#   python vel_to_rosbag.py velodyne_hits.bin vel.bag
#
from robots.viz import get_tx_at_time, transform

import rosbag, rospy
from std_msgs.msg import Float64MultiArray, MultiArrayDimension, MultiArrayLayout

import sys
import numpy as np
import struct
import sensor_msgs.point_cloud2 as pc2
from sensor_msgs.msg import (PointCloud2,
                             PointField)
FIELDS = [
    PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
    PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
    PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
    PointField(name='i', offset=12, datatype=PointField.FLOAT32, count=1)
]

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

    bag = rosbag.Bag(sys.argv[2], 'w')

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
