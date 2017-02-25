"""
This application demos the effect of covariance on a normal distribution.
It shows a plot of samples drawn from the distribution and allows the user to scale the covariance updating the plot as it changes.

Widget documentation and examples can be found at the following links:
http://matplotlib.org/api/widgets_api.html
http://matplotlib.org/examples/widgets/slider_demo.html
"""
import matplotlib

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider

plt.style.use('ggplot')
fig = plt.figure()
samples = np.random.multivariate_normal([0, 0], np.array([[1, 0], [0, 1]]), 1000)
l, = plt.plot(samples[:, 0], samples[:, 1], '.', alpha=0.2)
plt.title("Covariance Demo")
plt.xlabel("$x$")
plt.ylabel("$y$")
covariance_axes = plt.axis([0, 1, -10, 10]) #TODO(cglwn) Make this not go on top of the scatter plot.
plt.xlim(-5, 5)
plt.ylim(-5, 5)
axcolor = 'lightgoldenrodyellow'
axfreq = plt.axes([0.25, 0.1, 0.65, 0.03], axisbg=axcolor)
covariance_slider = Slider(axfreq, '$cov(\mathcal{X}, \mathcal{Y})$', -2.0, 2.0, valinit=0.0)
def update(val):
    # TODO(cglwn) Find a way to edit the title when the covariance changes.
    covariance = covariance_slider.val
    samples = np.random.multivariate_normal([0, 0], np.array([[1, covariance], [covariance, 1]]), 1000)
    l.set_data(samples[:,0], samples[:, 1])
    fig.canvas.draw_idle()
covariance_slider.on_changed(update)
plt.show()