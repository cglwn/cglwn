#include <array>
#include <fstream>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <tuple>
#include <vector>

#include "Eigen/Core"
#include "geometry_msgs/PoseStamped.h"
#include "rosbag/bag.h"
#include "sensor_msgs/PointCloud2.h"
#include "sensor_msgs/point_cloud2_iterator.h"

using Eigen::Matrix3d;
using Eigen::Vector3d;
using rosbag::Bag;
using sensor_msgs::PointCloud2;
using sensor_msgs::PointCloud2Iterator;
using sensor_msgs::PointCloud2Modifier;
using std::array;
using std::ifstream;
using std::ios;
using std::istringstream;
using std::make_tuple;
using std::map;
using std::move;
using std::ofstream;
using std::string;
using std::tuple;
using std::vector;

static bool verifyMagic(const array<uint16_t, 4>& magic) {
    uint16_t expected_magic = 44444;
    return magic[0] == expected_magic &&
           magic[1] == expected_magic &&
           magic[2] == expected_magic &&
           magic[3] == expected_magic;
}

static std::tuple<float, float, float> convert(auto x_s, auto y_s, auto z_s) {
    auto scaling = 0.005;
    auto offset = -100.0;
    auto x = scaling * x_s + offset;
    auto y = scaling * y_s + offset;
    auto z = scaling * z_s + offset;
    return make_tuple(std::move(x), std::move(y), std::move(z));
}

class Transformation {
public:
    Transformation() : roll(0.0), pitch(0.0), yaw(0.0), x(0.0), y(0.0), z(0.0) {}

    Transformation(const double& roll,
                   const double& pitch,
                   const double& yaw,
                   const double& x,
                   const double& y,
                   const double& z) : roll(roll), pitch(pitch), yaw(yaw), x(x), y(y), z(z) {}

    Vector3d transform(Vector3d point) {
        const Matrix3d rotation_matrix = [&]() {
            const auto cos_yaw = cos(yaw);
            const auto sin_yaw = sin(yaw);
            const auto cos_pitch = cos(pitch);
            const auto sin_pitch = sin(pitch);
            const auto cos_roll = cos(roll);
            const auto sin_roll = sin(roll);

            Eigen::Matrix3d yaw_matrix;
            yaw_matrix << cos_yaw , -sin_yaw , 0.0 , sin_yaw , cos_yaw , 0.0 , 0.0 , 0.0 , 1.0;

            Eigen::Matrix3d pitch_matrix;
            pitch_matrix << cos_pitch, 0.0, sin_pitch, 0.0, 1.0, 0.0, -sin_pitch, 0.0, cos_pitch;

            Matrix3d roll_matrix;
            roll_matrix << 1.0, 0.0, 0.0, 0.0, cos_roll, -sin_roll, 0.0, sin_roll, cos_roll;
            Matrix3d rotation = yaw_matrix * pitch_matrix * roll_matrix;
            return rotation;
        }();
        Vector3d translation;
        translation << x, y, z;

        return rotation_matrix * point + translation;
    }

    Transformation getBetween(const Transformation& other) const{
        return Transformation(other.roll + roll / 2.0,
                              other.pitch + pitch / 2.0,
                              other.yaw + yaw / 2.0,
                              other.x + x / 2.0,
                              other.y + y / 2.0,
                              other.z + z / 2.0);
    }

    Transformation compose(const Transformation& other) const {
        return Transformation(other.roll + roll,
        other.pitch + pitch,
        other.yaw+yaw,
        other.x + x,
        other.y + y,
        other.z + z);
    }

    Transformation inverse() const {
        return Transformation(-roll, -pitch, -yaw, -x, -y, -z);
    }

    string xyz() const {
        std::stringstream ss;
        ss << x << " " << y << " " << z;
        return ss.str();
    }


private:
    double roll;
    double pitch;
    double yaw;
    double x;
    double y;
    double z;
};

class Trajectory {
public:
    static Trajectory fromNcltCsv(string path_to_csv) {
        Trajectory trajectory;
        auto trajectory_csv = ifstream(path_to_csv);
        string line;
        while (getline(trajectory_csv, line)) {
            istringstream ss{line};
            string comma;

            uint64_t unix_time;
            ss >> unix_time;
            ss >> comma;

            if (unix_time == 150971) {
                std::cout << "Wtf." << std::endl;
            }
            float x;
            ss >> x;
            ss >> comma;
            float y;
            ss >> y;
            ss >> comma;
            float z;
            ss >> z;
            ss >> comma;
            float roll;
            ss >> roll;
            ss >> comma;
            float pitch;
            ss >> pitch;
            ss >> comma;
            float yaw;
            ss >> yaw;

            Transformation transformation{roll, pitch, yaw, x, y, z};
            trajectory.trajectory[unix_time] = transformation;
        }
        return trajectory;
    }

    bool isValidTime(uint64_t unix_time) const {
        auto first_time = trajectory.begin()->first;
        auto last_time = trajectory.rbegin()->first;

        auto is_valid_time = unix_time > first_time && unix_time < last_time;
        if (!is_valid_time) {
            //std::cout << "Out of bounds: " << unix_time << " is not in between [" << first_time << ", " << last_time << "].\n";
        }
        return is_valid_time;
    }

    Transformation query(uint64_t unix_time) const {
        assert(isValidTime(unix_time));

        auto elem = trajectory.find(unix_time);
        if (elem == trajectory.end()) {
            auto lower = trajectory.lower_bound(unix_time);
            auto upper = trajectory.upper_bound(unix_time);
            return lower->second.getBetween(upper->second);
        } else {
            return elem->second;
        }
    }

    void toPly(string filename) {
        auto ply_file = ofstream(filename);
        for (const auto& it : trajectory) {
            auto Tx = it.second;
            ply_file << Tx.xyz() << "\n";
        }
    }


private:
    map<uint64_t, Transformation> trajectory;
};

class SegwayCalibration {
public:
    static Transformation getTx_LI_BD() {
        return Transformation(0.807 * M_PI / 180, 0.166 * M_PI / 180, -90.703 * M_PI / 180, 0.002, -0.004, -0.957);
    }

    static Transformation getTx_LB_BD() {
        return Transformation(-179.93 * M_PI / 180, -0.23 * M_PI / 180, 0.50 * M_PI / 180, 0.035, 0.002, -1.23);
    }
};

template<typename T>
T read(ifstream& is) {
    T temp;
    is.read(reinterpret_cast<char*>(&temp), sizeof(T));
    return temp;
}

class VelodyneHits {
public:
    void convertToPly(ifstream& is, const string& ply_filename, const Trajectory& trajectory) {
        auto num_to_skip = static_cast<uint64_t>(2e6);
        auto max_packets = static_cast<uint64_t>(1e5);
        auto max_points = static_cast<uint64_t>(2e6);
        auto num_packets_read = static_cast<uint64_t>(0);
        auto num_points_skipped = static_cast<uint64_t>(0);
        auto num_points = static_cast<uint64_t>(0);
        auto ply_file = ofstream(ply_filename);
        ply_file << "ply\nformat ascii 1.0\nelement vertex " << max_points << "\nproperty float x\nproperty float y\nproperty float z\nproperty uchar r\nproperty uchar g\nproperty uchar b\nend_header\n";

        auto Tx_LI_BD = SegwayCalibration::getTx_LI_BD();
        auto Tx_LB_BD = SegwayCalibration::getTx_LB_BD();
        auto Tx_BD_LI = Tx_LI_BD.inverse();
        auto Tx_LB_LI = Tx_LB_BD.compose(Tx_BD_LI);

        while (num_points < max_points && !is.eof()) {
            const array<uint16_t, 4> magic = [&]() {
                array<uint16_t, 4> temp;
                is.read(reinterpret_cast<char*>(temp.data()), temp.size() * (sizeof(uint16_t) / sizeof(char)));
                return temp;
            }();
            if (!verifyMagic(magic)) {
                std::cout << "Magic does not exist.\n";
                break;
            }
            const uint32_t number_of_hits = [&]() {
                uint32_t temp;
                is.read(reinterpret_cast<char*>(&temp), sizeof(uint32_t));
                return temp;
            }();

            uint64_t unix_time;
            is.read(reinterpret_cast<char*>(&unix_time), sizeof(uint64_t));

            const uint32_t padding = [&]() {
                uint32_t temp;
                is.read(reinterpret_cast<char*>(&temp), sizeof(uint32_t));
                return temp;
            }();

            for (int i = 0; i < number_of_hits; ++i) {
                uint16_t discretized_x;
                is.read(reinterpret_cast<char*>(&discretized_x), sizeof(uint16_t));
                uint16_t discretized_y;
                is.read(reinterpret_cast<char*>(&discretized_y), sizeof(uint16_t));
                uint16_t discretized_z;
                is.read(reinterpret_cast<char*>(&discretized_z), sizeof(uint16_t));
                uint8_t intensity;
                is.read(reinterpret_cast<char*>(&intensity), sizeof(uint8_t));
                uint8_t l;
                is.read(reinterpret_cast<char*>(&l), sizeof(uint8_t));

                if (!trajectory.isValidTime(unix_time)) {
                    continue;
                }
                if (num_points_skipped < num_to_skip) {
                    ++num_points_skipped;
                    continue;
                }


                Transformation Tx_MP_BDk = trajectory.query(unix_time);
                float x;
                float y;
                float z;
                std::tie(x, y, z) = convert(discretized_x, discretized_y, discretized_z);
                auto LI_px = Vector3d(x, y, z);
                auto BD_px = Tx_BD_LI.transform(LI_px);
                auto MP_px = Tx_MP_BDk.transform(BD_px);
                ply_file << MP_px[0] << " " << MP_px[1] << " " << -MP_px[2] << " " << +intensity << " " << +intensity << " " << +intensity << "\n";
                ++num_points;
            }
            ++num_packets_read;
        }
    }

    void convertToRosbag(ifstream& is, const string& rosbag_filename, const Trajectory& trajectory) {
        auto num_to_skip = static_cast<uint64_t>(2e6);
        auto max_packets = static_cast<uint64_t>(1e5);
        auto max_points = static_cast<uint64_t>(2e6);
        auto num_packets_read = static_cast<uint64_t>(0);
        auto num_points_skipped = static_cast<uint64_t>(0);
        auto num_points = static_cast<uint64_t>(0);
        auto bag_file = Bag();
        auto Tx_LI_BD = SegwayCalibration::getTx_LI_BD();
        auto Tx_LB_BD = SegwayCalibration::getTx_LB_BD();
        auto Tx_BD_LI = Tx_LI_BD.inverse();
        auto Tx_LB_LI = Tx_LB_BD.compose(Tx_BD_LI);

        bag_file.open(rosbag_filename, rosbag::bagmode::Write);
        while (!is.eof()) {
            const array<uint16_t, 4> magic = [&]() {
                array<uint16_t, 4> temp;
                is.read(reinterpret_cast<char*>(temp.data()), temp.size() * (sizeof(uint16_t) / sizeof(char)));
                return temp;
            }();
            if (!verifyMagic(magic)) {
                std::cout << "Magic does not exist.\n";
                std::cout << magic[0] << " " << magic[1] << " " << magic[2] << " " << magic[3] << "\n";
                break;
            }
            const uint32_t number_of_hits = [&]() {
                uint32_t temp;
                is.read(reinterpret_cast<char*>(&temp), sizeof(uint32_t));
                return temp;
            }();

            const uint64_t unix_time = [&]() {
                uint64_t temp;
                is.read(reinterpret_cast<char*>(&temp), sizeof(uint64_t));
                return temp;
            }();
            ros::Time ros_time;
            ros_time.fromNSec(unix_time * static_cast<uint64_t>(1e3));

            const uint32_t padding = [&]() {
                uint32_t temp;
                is.read(reinterpret_cast<char*>(&temp), sizeof(uint32_t));
                return temp;
            }();

            vector<float> xs;
            vector<float> ys;
            vector<float> zs;
            vector<uint8_t> intensities;
            for (int i = 0; i < number_of_hits; ++i) {
                const uint16_t discretized_x = [&]() {
                    uint16_t temp;
                    is.read(reinterpret_cast<char*>(&temp), sizeof(uint16_t));
                    return temp;
                }();
                const uint16_t discretized_y = [&]() {
                    uint16_t temp;
                    is.read(reinterpret_cast<char*>(&temp), sizeof(uint16_t));
                    return temp;
                }();
                const uint16_t discretized_z = [&]() {
                    uint16_t temp;
                    is.read(reinterpret_cast<char*>(&temp), sizeof(uint16_t));
                    return temp;
                }();
                const uint8_t intensity = [&]() {
                    uint8_t temp;
                    is.read(reinterpret_cast<char*>(&temp), sizeof(uint8_t));
                    return temp;
                }();
                const uint8_t l = [&]() {
                    uint8_t temp;
                    is.read(reinterpret_cast<char*>(&temp), sizeof(uint8_t));
                    return temp;
                }();

//                if (!trajectory.isValidTime(unix_time)) {
//                    continue;
//                }

//                Transformation Tx_MP_BDk = trajectory.query(unix_time);
                float x;
                float y;
                float z;
                std::tie(x, y, z) = convert(discretized_x, discretized_y, discretized_z);
                auto LI_px = Vector3d(x, y, z);
//                auto BD_px = Tx_BD_LI.transform(LI_px);
//                auto MP_px = Tx_MP_BDk.transform(BD_px);
                xs.emplace_back(LI_px[0]);
                ys.emplace_back(LI_px[1]);
                zs.emplace_back(-LI_px[2]);
                intensities.emplace_back(intensity);
                ++num_points;
            }
            if (!xs.empty()) {
                PointCloud2 cloud_msg;
                cloud_msg.header.stamp = ros_time;
                cloud_msg.header.frame_id = "map";
                sensor_msgs::PointCloud2Modifier modifier(cloud_msg);
                modifier.setPointCloud2FieldsByString(2, "xyz", "rgb");
                modifier.resize(xs.size());
                cloud_msg.height = 1;
                cloud_msg.width = xs.size();
                sensor_msgs::PointCloud2Iterator<float> iter_x(cloud_msg, "x");
                sensor_msgs::PointCloud2Iterator<float> iter_y(cloud_msg, "y");
                sensor_msgs::PointCloud2Iterator<float> iter_z(cloud_msg, "z");
                sensor_msgs::PointCloud2Iterator<uint8_t> iter_r(cloud_msg, "r");
                sensor_msgs::PointCloud2Iterator<uint8_t> iter_g(cloud_msg, "g");
                sensor_msgs::PointCloud2Iterator<uint8_t> iter_b(cloud_msg, "b");
                // Fill the PointCloud2
                for (int i = 0; i < xs.size(); ++i, ++iter_x, ++iter_y, ++iter_z, ++iter_r, ++iter_g, ++iter_b) {
                    *iter_x = xs[i];
                    *iter_y = ys[i];
                    *iter_z = zs[i];
                    *iter_r = intensities[i];
                    *iter_g = intensities[i];
                    *iter_b = intensities[i];
                }
                std::stringstream error;
                error << "Packet time " << ros_time << " was less than ros::TIME_MIN " << ros::TIME_MIN << "\n";
                assert(ros_time > ros::TIME_MIN && error.str().c_str());
                bag_file.write("/velodyne", ros_time, cloud_msg);
            }
            ++num_packets_read;
        }
        bag_file.close();
    }

};


int main(int argc, char** argv) {
    Bag bag;
    auto velodyne_file = ifstream(argv[1], ios::binary);
    VelodyneHits hits;
    Trajectory trajectory_MP_BD = Trajectory::fromNcltCsv("/home/cglwn/Documents/Datasets/Michigan-NCLT/ground_truth/groundtruth_2013-01-10.csv");
    std::cout << "Printing points.\n";
    hits.convertToRosbag(velodyne_file, "/home/cglwn/entire_michigan.bag", trajectory_MP_BD);
    return 0;
}