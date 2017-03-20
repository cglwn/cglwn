from sauna.query import (get_image_stack, get_points_li_as_df,
                         get_relative_timestamps, open_image)

import cv2
import numpy as np
import pandas as pd
import pytest


def test_open_image():
    assert open_image(
        "./test_data/img_azimuth/sudburyteach1_00001450_img_azimuth.tif") is not None

# def test_image_stack_nonexistent_folder_fails():
#     image_stack = get_image_stack(data_dir="", data_id="1450")


def test_can_get_image_stack():
    """For each image type in the image stack we check
        (1) that the corresponding image can be opened, and
        (2) that it matches directly opening the image.
    """
    image_stack = get_image_stack(data_dir="./test_data", data_id="1450")
    assert np.array_equal(image_stack.azimuth, open_image(
        "./test_data/img_azimuth/sudburyteach1_00001450_img_azimuth.tif"))
    assert np.array_equal(image_stack.elevation, open_image(
        "./test_data/img_elevation/sudburyteach1_00001450_img_elevation.tif"))
    assert np.array_equal(image_stack.intensity16, open_image(
        "./test_data/img_intensity16/sudburyteach1_00001450_img_intensity16.tif"))
    assert np.array_equal(image_stack.intensity8, open_image(
        "./test_data/img_intensity8/sudburyteach1_00001450_img_intensity8.tif"))
    assert np.array_equal(
        image_stack.mask,
        open_image("./test_data/img_mask/sudburyteach1_00001450_img_mask.tif"))
    assert np.array_equal(image_stack.range, open_image(
        "./test_data/img_range/sudburyteach1_00001450_img_range.tif"))
    assert np.array_equal(
        image_stack.time,
        open_image("./test_data/img_time/sudburyteach1_00001450_img_time.tif"))


def test_can_get_single_point():
    point_li = get_points_li_as_df(
        data_dir="./test_data", data_id=1450).iloc[0]

    # Use np.isclose for floating point values and == for integer values.
    assert np.isclose(point_li.azimuth, 0.785398185253)
    assert np.isclose(point_li.elevation, 0.271508)
    assert point_li.intensity16 == 316
    assert point_li.intensity8 == 30
    assert point_li.is_visible
    assert np.isclose(point_li.range, 19.306999)
    assert np.isclose(point_li.time, 721.396480)


def test_get_timestamps():
    expected = pd.DataFrame({
        "id": [1450, 1560],
        "timestamp": [721.645279, 776.271199]
    })
    timestamps = get_relative_timestamps("./test_data")
    assert timestamps.equals(expected)


if __name__ == "__main__":
    pytest.main()
