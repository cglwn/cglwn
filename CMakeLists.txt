cmake_minimum_required(VERSION 3.1)

project(cglwn)

# set (CMAKE_CXX_STANDARD 14)
SET(CMAKE_CXX_FLAGS "-std=c++1z")
add_subdirectory(velodyne_unpacker)

find_package(Ceres REQUIRED)

find_package(catkin REQUIRED COMPONENTS rosbag)

# TODO(james.cagalawan): Make this more general if sharing.
include_directories(/opt/ros/kinetic/include)
find_package(Eigen3 REQUIRED)
include_directories(${EIGEN3_INCLUDE_DIR})

add_executable(vel_to_rosbag nclt/nclt_rosbag.cpp)
target_link_libraries(vel_to_rosbag ${catkin_LIBRARIES})
# Third party libraries.
# This looks promising: https://github.com/psi4/psi4/wiki/External-subprojects-using-Git-and-CMake
# Might also have to look at doing ExternalProject_Add
# add_subdirectory(external/rtags)
# add_subdirectory(external/llvm)
