"""Plots GPS data from a CSV file as a 3D line.
"""
import argparse

import numpy as np
import pandas as pd
import plotly.plotly as plotly
import plotly.graph_objs as graph_objs

parser = argparse.ArgumentParser(description="Plot GPS data.")
parser.add_argument("gps_csv", help="Path to the CSV file.")
args = parser.parse_args()

gps_data = pd.read_csv(args.gps_csv, usecols=["id", "x", "y", "z"])

trace = graph_objs.Scatter3d(
    x=gps_data["x"],
    y=gps_data["y"],
    z=gps_data["z"],
    marker=dict(
        size=2,
        color=gps_data["z"],
        colorscale='Viridis', ),
    line=dict(
        color='#1f77b4', width=1))
data = [trace]
layout = dict(title="GPS")
fig = dict(data=data, layout=layout)
plotly.iplot(fig, filename="GPS teach1")
