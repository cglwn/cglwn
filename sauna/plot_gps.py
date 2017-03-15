"""Plots GPS data from a CSV file as a 3D line.
"""
import argparse

import matplotlib as mpl
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

parser = argparse.ArgumentParser(description="Plot GPS data.")
parser.add_argument("gps_csv", help="Path to the CSV file.")
args = parser.parse_args()

gps_data = pd.read_csv(args.gps_csv, usecols=["id", "x", "y" ,"z"])

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.plot(gps_data["x"].values, gps_data["y"].values, gps_data["z"].values)
ax.legend()
plt.show()
