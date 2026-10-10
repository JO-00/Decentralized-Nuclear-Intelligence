import numpy as np

from config import NEUTRON_FLUX_NOMINALS, POWER_CONFIGS

def generate_default_flux(
        sample_count: int,
        seed: int,
):
    rng = np.random.default_rng(seed)

    flux_nominal = NEUTRON_FLUX_NOMINALS["flux_nominal"]

    flux = np.zeros(sample_count)
    flux[0] = flux_nominal

    drift_std = flux_nominal * 0.005
    mean_reversion = 0.05

    for t in range(sample_count - 1):

        drift = rng.normal(
            loc=0.0,
            scale=drift_std,
        )

        correction = (
            flux_nominal - flux[t]
        ) * mean_reversion

        flux[t + 1] = (
            flux[t]
            + correction
            + drift
        )

    return flux


def generate_neutron_flux_curve(
        duration : int,
        power: list[float],
        seed: int
):
    rng = np.random.default_rng(seed)

    P_nominal = (
        POWER_CONFIGS["capacity_factor"]
        * POWER_CONFIGS["max_rated_power"]
    )

    flux_nominal = NEUTRON_FLUX_NOMINALS["flux_nominal"]
    if power is None:
        perfect_flux = generate_default_flux(scenario.duration * NEUTRON_FLUX_NOMINALS["sampling_frequency"], seed)
    else:
        perfect_flux = flux_nominal * np.asarray(power) / P_nominal

    noise_std = NEUTRON_FLUX_NOMINALS["noise_std"]

    noise = rng.normal(
        loc=0.0,
        scale=noise_std,
        size=duration * NEUTRON_FLUX_NOMINALS["sampling_frequency"]
    )

    noisy_flux = perfect_flux + noise

    return perfect_flux / 1e12 , noisy_flux / 1e12


