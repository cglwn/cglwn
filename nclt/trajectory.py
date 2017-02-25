class PiecewiseCoefficients(object):

    def __init__(self):
        pass

class Trajectory(object):

    def __init__(self, odometry):
        times = PiecewiseCoefficients()
        for ts, x, y, z, roll, pitch, yaw in odometry.itertuples():
            pass

    def evaluate(self, time):
        if coefficients.is_valid(time):
            coefficients.get()

        return coeff
