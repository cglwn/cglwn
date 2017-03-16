"""Show an image stack consisting of a intensity, time, and range data.
"""
import argparse
import os
import sys

import cv2
import matplotlib.gridspec as gridspec
import matplotlib.pyplot as plt
import numpy as np

parser = argparse.ArgumentParser(description="Plot image stacks.")
parser.add_argument(
    "imagestack_directory", help="Path to imagestack directory.")
parser.add_argument("image_index", help="The image index.")
args = parser.parse_args()

image_types = ["img_azimuth", "img_elevation", "img_intensity16",
               "img_intensity8", "img_mask", "img_range", "img_time"]

fig = plt.figure(figsize=(800 / 40, 400 / 40), dpi=40)
gs = gridspec.GridSpec(2, 4)
gs.update(wspace=0.0000025, hspace=0.0000005)
image_index = args.image_index
for idx, image_type in enumerate(image_types):
    ax = fig.add_subplot(gs[idx])
    image_path = os.path.join(
        args.imagestack_directory, image_type,
        "sudburyteach1_{}_".format(image_index.zfill(8)) + image_type + ".tif")
    im = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if im is None:
        print("Could not open an image in the imagestack. Exiting.")
        sys.exit()
    print("Showing image: {} which has shape {}.".format(image_type, im.shape))
    ax.set_title(image_type)
    ax.set_axis_off()
    ax.imshow(im, cmap="gray")
plt.suptitle("Imagestack - Teach 1 - Index {}".format(image_index))
plt.savefig("{}.png".format(image_index.zfill(8)))
