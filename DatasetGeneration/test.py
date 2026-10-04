import pandas as pd

df = pd.read_csv("dataset.csv")

power_columns = [
    f"power{i}"
    for i in range(1, 11)
]

only_900 = (df[power_columns] == 900.0).all(axis=1)

print(f"Total scenarios: {len(df)}")
print(f"Scenarios containing only 900.0 power: {only_900.sum()}")
print(f"Percentage: {only_900.mean() * 100:.2f}%")