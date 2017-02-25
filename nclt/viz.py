#!/usr/bin/env python
# Inspired by https://gist.github.com/yuma-m/b5dcce1b515335c93ce8
# The following coordinate frames are used in this file:
#     LI - The frame in which we have Velodyne HDL-32 Euclidian data.
#     LB - The Ladybug camera frame.
#     BD - The Segway body frame.
#     MP - The map frame, which is currently the starting position at the start
#     of a run.
# Refer to Carlevaris-Bianco et. al 2016 Figure 4 for a frame diagram.
import dask.dataframe as dd
from matplotlib.cm import ScalarMappable
import numpy as np
import pandas as pd
import rospy
from std_msgs.msg import Header
from sensor_msgs.msg import (PointCloud2,
                             PointField)
import sensor_msgs.point_cloud2 as pc2
import tf

FIELDS = [
    PointField(name='x', offset=0, datatype=PointField.FLOAT32, count=1),
    PointField(name='y', offset=4, datatype=PointField.FLOAT32, count=1),
    PointField(name='z', offset=8, datatype=PointField.FLOAT32, count=1),
    PointField(name='r', offset=12, datatype=PointField.FLOAT32, count=1),
    PointField(name='g', offset=16, datatype=PointField.FLOAT32, count=1),
    PointField(name='b', offset=20, datatype=PointField.FLOAT32, count=1)
]

# br = tf.TransformBroadcaster()
# xyzrpy_m_deg_tx_li_bd = [0.002, -0.004, -0.957, 0.807, 0.166, -90.703]
# br.sendTransform((xyzrpy_m_deg_tx_li_bd[0], xyzrpy_m_deg_tx_li_bd[1], xyzrpy_m_deg_tx_li_bd[2]),
#                  tf.transformations.quaternion_from_euler(0.807, 0.166, -90.703),
#                  rospy.Time.now(),
#                  "velodyne",
#                  "body"
# )

odometry = pd.read_csv("/home/cglwn/Documents/Datasets/Michigan-NCLT/ground_truth/groundtruth_2013-01-10.csv",
                        names=["unix_time", "MP_x", "MP_y", "MP_z", "MP_roll", "MP_pitch", "MP_yaw"])

def get_tx_at_time(time):
    odometry_at_time = odometry[odometry["unix_time"] == time]
    if odometry_at_time.empty:
        # This assumes that it is sorted.
        all_odometry_before = odometry[odometry["unix_time"] < time]
        if all_odometry_before.empty:
            # print("Time is before first known position.")
            return None
        odometry_before = all_odometry_before.iloc[-1]
        all_odometry_after = odometry[odometry["unix_time"] > time]
        if all_odometry_after.empty:
            # print("Time is past last known position.")
            return None
        odometry_after = all_odometry_after.iloc[0]
        xyzypr_km1 = odometry_before[["MP_x", "MP_y", "MP_z", "MP_roll", "MP_pitch", "MP_yaw"]]
        xyzypr_kp1 = odometry_after[["MP_x", "MP_y", "MP_z", "MP_roll", "MP_pitch", "MP_yaw"]]
        time_diff = odometry_after.unix_time - odometry_before.unix_time
        return (xyzypr_kp1 - xyzypr_km1) / time_diff
    return odometry_at_time[["MP_x", "MP_y", "MP_z", "MP_roll", "MP_pitch", "MP_yaw"]].values[0]

def transform(points, x, y, z, roll, pitch, yaw):
    cos_yaw = np.cos(yaw)
    sin_yaw = np.sin(yaw)
    yaw_matrix = np.array([[cos_yaw, -sin_yaw, 0.0], [sin_yaw, cos_yaw, 0.0], [0.0, 0.0, 1.0]])

    cos_pitch = np.cos(pitch)
    sin_pitch = np.sin(pitch)
    pitch_matrix = np.array([[cos_pitch, 0.0, sin_pitch], [0.0, 1.0, 0.0], [-sin_pitch, 0.0, cos_pitch]])

    cos_roll = np.cos(roll)
    sin_roll = np.sin(roll)
    roll_matrix = np.array([[1.0, 0.0, 0.0], [0.0, cos_roll, -sin_roll], [0.0, sin_roll, cos_roll]])

    rotation_matrix = yaw_matrix.dot(pitch_matrix.dot(roll_matrix))
    rotated_points = rotation_matrix.dot(points.T)
    translated_points = rotated_points.T + np.array([x, y, z]).T
    return translated_points

def main():
    rospy.init_node('publish_custom_point_cloud')
    publisher = rospy.Publisher('/custom_point_cloud', PointCloud2, queue_size=1000)
    map_publisher = rospy.Publisher('/map', PointCloud2, queue_size=1000)
    for all_points in pd.read_hdf("/home/cglwn/Documents/Datasets/Michigan-NCLT/velodyne_data/2013-01-10-velodyne_hits.hdf",
                                "velodyne_hits",
                                chunksize=1000):
        grouped = all_points.groupby("unix_time")
        for time, points in grouped:
            header = Header(frame_id='/velodyne', stamp=rospy.Time.from_sec(time / 1e6))
            intensity_cmap = ScalarMappable(cmap="viridis")
            rgb = intensity_cmap.to_rgba(points["intensity"] / 255.0)[:, :3]
            point_matrix = points[["LI_x", "LI_y", "LI_z"]].values
            point_matrix[:, 2] = -point_matrix[:, 2]
            # points_with_color = np.column_stack([point_matrix, rgb])
            # point_cloud = pc2.create_cloud(header, FIELDS, points_with_color)
            # publisher.publish(point_cloud)
            res = get_tx_at_time(time)
            if res is not None:
                x, y, z, yaw, pitch, roll = res
                point_matrix = transform(point_matrix, x, y, z, yaw, pitch, roll)
                header = Header(frame_id='/map', stamp=rospy.Time.from_sec(time / 1e6))
                points_with_color = np.column_stack([point_matrix, rgb])
                point_cloud = pc2.create_cloud(header, FIELDS, points_with_color)
                map_publisher.publish(point_cloud)

def ply_main():
    num_points = int(1e9)
    print("Opening a PLY file to write out.")
    plyfile = open("out.ply", "w")
    plyfile.write("ply\n")
    plyfile.write("format ascii 1.0\n")
    all_points = pd.read_hdf("/home/cglwn/Documents/Datasets/Michigan-NCLT/velodyne_data/2013-01-10-velodyne_hits.hdf",
                                  "velodyne_hits", start=0, stop=num_points)
    plyfile.write("element vertex {}\n".format(num_points))
    plyfile.write("property float x\n")
    plyfile.write("property float y\n")
    plyfile.write("property float z\n")
    plyfile.write("property uchar intensity\n")
    plyfile.write("end_header\n")
    print("Finished header. Going through points.")
    import tqdm
    i = 0
    for row in tqdm.tqdm(all_points.itertuples(), total=num_points):
        point_matrix = np.array([[row.LI_x, row.LI_y, row.LI_z]])
        time = row.unix_time
        res = get_tx_at_time(time)
        if res is not None:
            i += 1
            x, y, z, yaw, pitch, roll = res
            point_matrix = transform(point_matrix, x, y, z, yaw, pitch, roll)
            plyfile.write("{} {} {} {}\n".format(point_matrix[0, 0], point_matrix[0, 1], point_matrix[0, 2], 256 * row.intensity))
        if i == num_points:
            break
    print("Final number of points: {}".format(i))

if __name__ == '__main__':
    ply_main()
