#!/usr/bin/env python
from rosbag import Bag
import rospy
from sensor_msgs.msg import (PointCloud2, PointField)
import sensor_msgs.point_cloud2 as point_cloud2
from std_msgs.msg import Header

header = Header(frame_id='/base')

point_fields = [
    PointField(
        name="x", offset=0, datatype=PointField.FLOAT32, count=1),
    PointField(
        name="y", offset=4, datatype=PointField.FLOAT32, count=1),
    PointField(
        name="z", offset=8, datatype=PointField.FLOAT32, count=1),
    PointField(
        name="intensity", offset=12, datatype=PointField.UINT8, count=1),
]

points = [[0.3, 0.0, 0.0, 0], [0.2, 0.8, 0.9, 120], [1.4, 2.2, 5.1, 90]]

bag = Bag("point_cloud.bag", "w")
point_cloud = point_cloud2.create_cloud(header, point_fields, points)
bag.write("points", point_cloud)
bag.close()
