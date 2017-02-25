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
from std_msgs.msg import Header

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

FIRST_TIME = None
CURRENT_TIME = None
def main(args):

    if len(sys.argv) < 2:
        print 'Please specify velodyne hits file'
        return 1

    if len(sys.argv) < 3:
        print 'Please specify output rosbag file'
        return 1

    print sys.argv[1]
    f_bin = open(sys.argv[1], "r")

    bag = rosbag.Bag(sys.argv[2], 'w')
    FIRST_TIME = None
    CURRENT_TIME = None
    f_bin.seek(0, 2)
    total_bytes = f_bin.tell()
    num_bytes_remaining = total_bytes
    num_bytes_read = 0
    f_bin.seek(0, 0)
    try:
        while True:
            num_bytes_read += 8 + 4 + 8 + 4 + 2 + 2 + 2 + 1 + 1
            num_bytes_remaining -= 8 + 4 + 8 + 4 + 2 + 2 + 1 + 1
            print("Read {} bytes out of {}. [{}%]".format(num_bytes_read, total_bytes, float(num_bytes_read) / float(total_bytes)))
            print("{} bytes remaining.".format(num_bytes_remaining))

            magic = f_bin.read(8)
            if magic == '': # eof
                break

            if not verify_magic(magic):
                print "Could not verify magic"

            num_hits = struct.unpack('<I', f_bin.read(4))[0]
            utime = struct.unpack('<Q', f_bin.read(8))[0]
            res = get_tx_at_time(utime)

            if (FIRST_TIME is None) and (res is not None):
                FIRST_TIME = utime / 1e6
            if (FIRST_TIME is not None):
                CURRENT_TIME = utime / 1e6
            if FIRST_TIME and CURRENT_TIME and (CURRENT_TIME - FIRST_TIME) > 240:
                break

            f_bin.read(4) # padding

            # Read all hits
            data = []
            for i in range(num_hits):

                x = struct.unpack('<H', f_bin.read(2))[0]
                y = struct.unpack('<H', f_bin.read(2))[0]
                z = struct.unpack('<H', f_bin.read(2))[0]
                i = struct.unpack('B', f_bin.read(1))[0]
                l = struct.unpack('B', f_bin.read(1))[0]

                x, y, z = convert(x, y, z)

                data.append([x, y, z, float(i)])
            if res is None:
                continue

            data = np.asarray(data)
            x, y, z, roll, pitch, yaw = res
            data[:, :3] = transform(data[:, :3], x, y, z, roll, pitch, yaw)

            # Now write out to rosbag
            timestamp = rospy.Time.from_sec(utime / 1e6)
            header = Header(frame_id='/velodyne', stamp=rospy.Time.from_sec(utime / 1e6))
            point_cloud = pc2.create_cloud(header, FIELDS, data)
            bag.write('velodyne_packet_cloud', point_cloud, t=timestamp)
    except Exception as e:
        print e
        print 'End of File'
    finally:
        f_bin.close()
        bag.close()

    return 0

print("This is running.")
print(sys.argv)
if __name__ == '__main__':
    sys.exit(main(sys.argv))
