"""Query functions for working with the ABL dataset.

Note: A lot of these functions were created through composing smaller
functions. While there are definitely more optimal ways to perform these
queries, they are fast enough for our current purposes.
"""
import glob
import math
import os
import re
from collections import namedtuple

import cv2
import pandas as pd

ImageStack = namedtuple("ImageStack", ["azimuth", "elevation", "intensity16",
                                       "intensity8", "mask", "range", "time"])


def open_image(image_path):
    """Opens an image in an image stack.

    The images are stored in TIFF format with differing internal types. The
    default cv2.imread function does not handle this well and fails when
    reading the images; returning None instead. The extra argument of
    cv2.IMREAD_UNCHANGED must be added in order to correctly handle this.

    The type of each attribute is:
        azimuth: 32-bit float
        elevation: 32-bit float
        range: 32-bit float
        intensity16: 16-bit integer
        intensity8: 8-bit integer
        mask: 8-bit integer

    TODO(cglwn): Double check the sign of the integer fields.

    Args:
        image_path(str): The path to an image in an image stack.
    Returns:
        (np.array): The image as a numpy array.
    """
    return cv2.imread(image_path, cv2.IMREAD_UNCHANGED)


def get_image_stack(data_dir, data_id):
    """Gets an image stack from a local ABL dataset.

    TODO(cglwn): Clean this repetition up.

    Args:
        data_dir (str): The path to the directory containing an ABL run.
        data_id (int): The id of the image stack to use.

    Returns:
        The image stack where each field can be accessed using the dot (.)
        operator. For example get_image_stack(".", 1).azimuth would get the
        azimuth image.
    """
    if isinstance(data_id, int):
        data_id = str(data_id)
    padded_data_id = data_id.zfill(8)

    azimuth_image_glob = os.path.join(data_dir, "img_azimuth",
                                      "*" + padded_data_id + "*")
    azimuth_image_files = glob.glob(azimuth_image_glob)
    if len(azimuth_image_files) < 1:
        raise IOError("Could not find an azimuth image.")
    elif len(azimuth_image_files) > 1:
        raise IOError("Found multiple azimuth image files.")

    elevation_image_glob = os.path.join(data_dir, "img_elevation",
                                        "*" + padded_data_id + "*")
    elevation_image_files = glob.glob(elevation_image_glob)
    if len(elevation_image_files) < 1:
        raise IOError("Could not find an elevation image.")
    elif len(elevation_image_files) > 1:
        raise IOError("Found multiple elevation image files.")

    intensity16_image_glob = os.path.join(data_dir, "img_intensity16",
                                          "*" + padded_data_id + "*")
    intensity16_image_files = glob.glob(intensity16_image_glob)
    if len(intensity16_image_files) < 1:
        raise IOError("Could not find an intensity16 image.")
    elif len(intensity16_image_files) > 1:
        raise IOError("Found multiple intensity16 image files.")

    intensity8_image_glob = os.path.join(data_dir, "img_intensity8",
                                         "*" + padded_data_id + "*")
    intensity8_image_files = glob.glob(intensity8_image_glob)
    if len(intensity8_image_files) < 1:
        raise IOError("Could not find an intensity8 image.")
    elif len(intensity8_image_files) > 1:
        raise IOError("Found multiple intensity8 image files.")

    mask_image_glob = os.path.join(data_dir, "img_mask",
                                   "*" + padded_data_id + "*")
    mask_image_files = glob.glob(mask_image_glob)
    if len(mask_image_files) < 1:
        raise IOError("Could not find an mask image.")
    elif len(mask_image_files) > 1:
        raise IOError("Found multiple mask image files.")

    range_image_glob = os.path.join(data_dir, "img_range",
                                    "*" + padded_data_id + "*")
    range_image_files = glob.glob(range_image_glob)
    if len(range_image_files) < 1:
        raise IOError("Could not find an range image.")
    elif len(range_image_files) > 1:
        raise IOError("Found multiple range image files.")

    time_image_glob = os.path.join(data_dir, "img_time",
                                   "*" + padded_data_id + "*")
    time_image_files = glob.glob(time_image_glob)
    if len(time_image_files) < 1:
        raise IOError("Could not find an time image.")
    elif len(time_image_files) > 1:
        raise IOError("Found multiple time image files.")

    return ImageStack(
        azimuth=open_image(azimuth_image_files[0]),
        elevation=open_image(elevation_image_files[0]),
        intensity16=open_image(intensity16_image_files[0]),
        intensity8=open_image(intensity8_image_files[0]),
        mask=open_image(mask_image_files[0]),
        range=open_image(range_image_files[0]),
        time=open_image(time_image_files[0]))


def get_points_li_as_df(data_dir, data_id):
    """Gets point cloud from a local ABL dataset.

    TODO(cglwn): Compare this against returning a list of classes, or a list of
    namedtuples.

    TODO(cglwn): Might have to revisit the dtypes of the pandas DataFrame to
    ensure it matches the types in the TIFF. It is currently passing my tests
    even with float64 types though so it is okay for now.

    Args:
        data_dir: The path to the directory containing an ABL run.
        data_id: The id of the image stack to use.
    Returns:
        (pd.DataFrame) Points as a dataframe containing all fields from the
        image stack as well as the Euclidean coordinates of the points in the
        lidar (LI) frame.
    """
    if isinstance(data_id, int):
        data_id = str(data_id)

    azimuths = []
    elevations = []
    intensity16s = []
    intensity8s = []
    masks = []
    ranges = []
    times = []
    xs_li = []
    ys_li = []
    zs_li = []

    image_stack = get_image_stack(data_dir=data_dir, data_id=data_id)
    for column in range(480):
        for row in range(360):
            # Find the Euclidean coordinates of the point.
            azimuth_li = image_stack.azimuth[row, column]
            elevation_li = image_stack.elevation[row, column]
            range_li = image_stack.range[row, column]
            sin_elevation = math.sin(elevation_li)
            cos_elevation = math.cos(elevation_li)
            sin_azimuth = math.sin(azimuth_li)
            cos_azimuth = math.cos(azimuth_li)
            x_li = range_li * cos_azimuth * cos_elevation
            y_li = range_li * sin_azimuth * cos_elevation
            z_li = range_li * sin_elevation

            azimuths.append(azimuth_li)
            elevations.append(elevation_li)
            intensity16s.append(image_stack.intensity16[row, column])
            intensity8s.append(image_stack.intensity8[row, column])
            masks.append(image_stack.mask[row, column])
            ranges.append(range_li)
            times.append(image_stack.time[row, column])
            xs_li.append(x_li)
            ys_li.append(y_li)
            zs_li.append(z_li)

    # Rename the "mask" field to "is_visible" since mask is a function of a
    # pandas Series.
    return pd.DataFrame({
        "azimuth": azimuths,
        "elevation": elevations,
        "intensity16": intensity16s,
        "intensity8": intensity8s,
        "is_visible": [True if m == 255 else False for m in masks],
        "range": ranges,
        "time": times,
        "x": xs_li,
        "y": ys_li,
        "z": zs_li
    })


def get_relative_timestamps(data_dir):
    """Get the timestamps since the beginning of a dataset collection.
    """
    header_files = glob.glob(os.path.join(data_dir + "/*header*"))
    if len(header_files) < 1:
        raise IOError("Could not find a header file.")
    elif len(header_files) > 1:
        raise IOError("Found multiple candidates for header file.")
    return pd.read_csv(header_files[0], usecols=["id", "timestamp"])
