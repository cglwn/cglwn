
import gym

import matplotlib.pyplot as plt

env = gym.make('Pong-v0')
env.reset()

observation = None
observation = env.reset()
for _ in range(1000):
    observation = env.reset()
    for t in range(100):
        plt.imshow(observation)
        plt.show()
        print(observation)
        action = env.action_space.sample()
        observation, reward, done, info = env.step(5)
        if done:
            print("Episode finished after {} timesteps.".format(t+1))
