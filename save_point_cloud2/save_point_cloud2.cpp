#include "rosbag/bag.h"
#include "sensor_msgs/PointCloud2.h"
#include "sensor_msgs/point_cloud2_iterator.h"

using rosbag::Bag;
using rosbag::bagmode::BagMode;
using sensor_msgs::PointCloud2;
using sensor_msgs::PointCloud2Iterator;
using sensor_msgs::PointCloud2Modifier;
using sensor_msgs::PointField;
using ros::Time;

std::array<std::array<float, 4>, 3> points_xyzi = {
    //  x  y     z    i
    {{0.3, 0.0, 0.0, 0.0},  //
     {0.2, 0.8, 0.9, 120},  //
     {1.4, 2.2, 5.1, 90}}   //
};

int main(int argc, char** argv) {
  Time::init();

  // Create the PointCloud 2 and set its internals.
  PointCloud2 cloud_msg;
  cloud_msg.header.stamp = Time::now();
  cloud_msg.header.frame_id = "base";
  cloud_msg.height = 1;
  cloud_msg.width = points_xyzi.size();

  // Set the point fields of the point cloud using the PointCloud2Modifier
  // helper class.
  {
    PointCloud2Modifier modifier(cloud_msg);
    modifier.setPointCloud2Fields(4,                                   //
                                  "x", 1, PointField::FLOAT32,         //
                                  "y", 1, PointField::FLOAT32,         //
                                  "z", 1, PointField::FLOAT32,         //
                                  "intensity", 1, PointField::UINT8);  //
    modifier.resize(points_xyzi.size());
  }

  // Fill up the PointCloud 2 using iterators.
  PointCloud2Iterator<float> iter_x(cloud_msg, "x");
  PointCloud2Iterator<float> iter_y(cloud_msg, "y");
  PointCloud2Iterator<float> iter_z(cloud_msg, "z");
  PointCloud2Iterator<uint8_t> iter_i(cloud_msg, "intensity");

  for (int i = 0; i < points_xyzi.size();
       ++i, ++iter_x, ++iter_y, ++iter_z, ++iter_i) {
    auto point = points_xyzi[i];
    *iter_x = point[0];
    *iter_y = point[1];
    *iter_z = point[2];
    *iter_i = point[3];
  }

  // Write the message out to a bag.
  auto bag_file = Bag();
  bag_file.open("points.bag", BagMode::Write);
  bag_file.write("/points", Time::now(), cloud_msg);
  bag_file.close();
}
