import numpy as np

# env
class Env():

    def __init__(self):
        self.state = np.array([1., 2., 3., 4., 5.])
        self.reward = 0
        self.count = 0


    def next_state(self):
        self.count += 1
        if (self.count == 5):
            self.count = 0
            print('reset')
        print(self.count)
        return self.state[self.count]

    def get_reward(self):
        self.reward = int(input("Please input reward: "))
        return self.reward

    def step(self):
        done = False
        next_state = self.next_state()
        reward = self.get_reward()
        if self.count == 5:
            done = True
        return next_state, reward, done, self.count

    def reset(self):
        self.count = 0
        return self.state[self.count]