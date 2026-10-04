from matplotlib import pyplot as plt

def plot_curve(time , func , y_label , x_label = "time"):
    plt.plot(time, func)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.show()
