"""
Plot of the squared exponential kernel used in Gaussian Processes.
This plot shows the closer the two values x and x' are, the higher they co-vary.
"""
import matplotlib.pyplot as plt
import numpy as np

def squared_exponential(x, x_p):
    return np.exp(-0.5 * (x - x_p) * (x - x_p))

x = 0
x_p = np.linspace(0, 10, 1000)

plt.ylabel("$k(x,x')$")
plt.xlabel("$x - x'$")
plt.title("Squared Exponential")

y = []
for i in range(1000):
    y.append(squared_exponential(x, x_p[i]))
plt.plot(x_p, y)
plt.show()