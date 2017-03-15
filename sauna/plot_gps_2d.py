"""Plots GPS data from a CSV file.
"""
import argparse

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

parser = argparse.ArgumentParser(description="Plot GPS data.")
parser.add_argument("gps_csv", help="Path to the CSV file.")
args = parser.parse_args()
gps_data = pd.read_csv(args.gps_csv, usecols=["id", "x", "y" ,"z"])

plt.plot(gps_data["x"], gps_data["y"])
plt.title("Top Down GPS Tracks - teach1")
plt.xlabel("Position Northing (m)")
plt.ylabel("Position Easting (m)")
plt.show()
