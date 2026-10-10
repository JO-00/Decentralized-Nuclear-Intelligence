import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ============================================================
# 1. Load normal reactor data
# ============================================================

df = pd.read_csv("new_dataset.csv")

X = df.values.astype(np.float32)

print("Dataset:", X.shape)


# ============================================================
# 2. Train / validation split
# ============================================================

X_train, X_val = train_test_split(
    X,
    test_size=0.2,
    random_state=42
)


# ============================================================
# 3. Normalize
# ============================================================

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train).astype(np.float32)
X_val = scaler.transform(X_val).astype(np.float32)


# ============================================================
# 4. Autoencoder
#
# 70 → 32 → 8 → 32 → 70
# ============================================================

class Autoencoder(nn.Module):

    def __init__(self):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Linear(70, 32),
            nn.ReLU(),
            nn.Linear(32, 8)
        )

        self.decoder = nn.Sequential(
            nn.Linear(8, 32),
            nn.ReLU(),
            nn.Linear(32, 70)
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)


model = Autoencoder()


# ============================================================
# 5. Train
# ============================================================

criterion = nn.MSELoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)

X_train_tensor = torch.tensor(X_train)

epochs = 50

for epoch in range(epochs):

    model.train()

    optimizer.zero_grad()

    reconstructed = model(X_train_tensor)

    loss = criterion(
        reconstructed,
        X_train_tensor
    )

    loss.backward()
    optimizer.step()

    if (epoch + 1) % 5 == 0:
        print(
            f"Epoch {epoch + 1}/{epochs} "
            f"Loss: {loss.item():.6f}"
        )


# ============================================================
# 6. Determine anomaly threshold
# ============================================================

model.eval()

with torch.no_grad():

    X_val_tensor = torch.tensor(X_val)

    reconstructed = model(X_val_tensor)

    errors = torch.mean(
        (reconstructed - X_val_tensor) ** 2,
        dim=1
    ).numpy()


# Use the 99th percentile of normal validation errors
threshold = float(np.percentile(errors, 99))

print()
print("Validation reconstruction error:")
print("Mean:", float(errors.mean()))
print("Max :", float(errors.max()))
print("Threshold:", threshold)


# ============================================================
# 7. Export model to ONNX
# ============================================================

dummy_input = torch.randn(1, 70)

torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    input_names=["input"],
    output_names=["reconstruction"],
    opset_version=12
)

print()
print("Saved: model.onnx")


# ============================================================
# 8. Save scaler + threshold
# ============================================================

import joblib

joblib.dump(
    scaler,
    "scaler.joblib"
)

with open("threshold.txt", "w") as f:
    f.write(str(threshold))

print("Saved: scaler.joblib")
print("Saved: threshold.txt")