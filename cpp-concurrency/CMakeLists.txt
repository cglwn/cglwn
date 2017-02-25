cmake_minimum_required(VERSION 3.6)
project(threading)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set(SOURCE_FILES lesson2/1-thread_capture_by_value_non_general.cpp)
add_executable(2.1-thread_capture_by_value_non_general ${SOURCE_FILES})
target_link_libraries(2.1-thread_capture_by_value_non_general pthread)

add_executable(2.2-thread_capture_by_value_general lesson2/2-thread_capture_by_value_general.cpp)
target_link_libraries(2.2-thread_capture_by_value_general pthread)

add_executable(2.3-thread_capture_by_reference lesson2/3-thread_capture_by_reference)
target_link_libraries(2.3-thread_capture_by_reference pthread)

add_executable(3.1-linked_list_race lesson3/1-linked_list_race)
target_link_libraries(3.1-linked_list_race pthread)
add_executable(3.2-sin_no_shared_data lesson3/2-sin_no_shared_data)
target_link_libraries(3.2-sin_no_shared_data pthread)