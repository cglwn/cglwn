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
args = parser.parse_args()

image_types = ["img_azimuth", "img_elevation", "img_intensity16",
               "img_intensity8", "img_mask", "img_range", "img_time"]

fig = plt.figure(figsize=(800 / 40, 400 / 40), dpi=40)
gs = gridspec.GridSpec(2, 4)
gs.update(wspace=0.0000025, hspace=0.0000005)
for idx, image_type in enumerate(image_types):
    ax = fig.add_subplot(gs[idx])
    image_path = os.path.join(args.imagestack_directory, image_type,
                              "sudburyteach1_00001082_" + image_type + ".tif")
    im = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    print("Showing image: {} which has shape {}.".format(image_type, im.shape))
    ax.set_title(image_type)
    ax.set_axis_off()
    ax.imshow(im, cmap="gray")
plt.suptitle("Imagestack - Teach 1 - Index 1084")
plt.savefig("my_fig.png")
plt.show()
