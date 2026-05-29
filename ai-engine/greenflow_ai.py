from __future__ import annotations

import argparse
import json
import math
import random
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

try:
    import cv2
except ImportError:  # Allows the simulator to run without OpenCV during setup.
    cv2 = None


@dataclass
class LaneObservation:
    lane_id: str
    vehicle_count: int
    density: float
    emergency_detected: bool


@dataclass
class SignalPlan:
    signal_id: str
    green_seconds: int
    mode: str
    priority_score: float


class GreenFlowAI:
    def __init__(self, signals: Iterable[str]) -> None:
        self.signals = list(signals)

    def detect_vehicles(self, frame_path: str | None = None) -> list[LaneObservation]:
        if frame_path and cv2 is not None and Path(frame_path).exists():
            image = cv2.imread(frame_path)
            brightness = float(image.mean()) if image is not None else 80.0
            base_count = int(max(8, min(90, brightness / 3)))
        else:
            base_count = random.randint(18, 70)

        observations: list[LaneObservation] = []
        for index in range(4):
            count = max(0, base_count + random.randint(-14, 20))
            density = min(1.0, count / 88)
            emergency = random.random() > 0.86 and index in (0, 1)
            observations.append(LaneObservation(f"LANE-{index + 1}", count, round(density, 2), emergency))
        return observations

    def predict_density(self, observations: list[LaneObservation]) -> float:
        density = sum(item.density for item in observations) / max(1, len(observations))
        rush_factor = 0.12 * math.sin(time.time() / 3600)
        return round(min(1.0, density + rush_factor), 2)

    def optimize_signals(self, observations: list[LaneObservation]) -> list[SignalPlan]:
        emergency = any(item.emergency_detected for item in observations)
        predicted_density = self.predict_density(observations)
        plans: list[SignalPlan] = []
        for index, signal_id in enumerate(self.signals):
            is_route_signal = emergency and index < 4
            green_seconds = 75 if is_route_signal else int(24 + predicted_density * 48)
            plans.append(
                SignalPlan(
                    signal_id=signal_id,
                    green_seconds=green_seconds,
                    mode="emergency-priority" if is_route_signal else "adaptive",
                    priority_score=round((1.0 if is_route_signal else predicted_density) * 100, 1),
                )
            )
        return plans

    def emergency_route(self) -> dict[str, object]:
        return {
            "vehicleId": f"EV-{random.randint(200, 999)}",
            "route": self.signals[:4],
            "etaSeconds": random.randint(360, 520),
            "timeSavedSeconds": random.randint(160, 280),
            "corridorActive": True,
        }


def run_once(frame: str | None = None) -> dict[str, object]:
    engine = GreenFlowAI(["SIG-04", "SIG-01", "SIG-02", "SIG-05", "SIG-03"])
    observations = engine.detect_vehicles(frame)
    plans = engine.optimize_signals(observations)
    emergency = any(item.emergency_detected for item in observations)
    return {
        "observations": [asdict(item) for item in observations],
        "predictedDensity": engine.predict_density(observations),
        "signalPlans": [asdict(item) for item in plans],
        "greenCorridor": engine.emergency_route() if emergency else None,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="GreenFlow AI traffic detection and signal optimization simulator")
    parser.add_argument("--frame", help="Optional frame/image path for OpenCV-assisted density estimation")
    parser.add_argument("--watch", action="store_true", help="Continuously emit traffic predictions")
    args = parser.parse_args()

    while True:
      print(json.dumps(run_once(args.frame), indent=2))
      if not args.watch:
          break
      time.sleep(5)


if __name__ == "__main__":
    main()
