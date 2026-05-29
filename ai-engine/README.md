# GreenFlow AI Engine

Python simulation and computer vision scaffold for vehicle detection, lane density calculation, emergency detection, prediction, and adaptive signal timing.

## Install

```bash
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python greenflow_ai.py
python greenflow_ai.py --watch
python greenflow_ai.py --frame sample-road-frame.jpg
```

The module is YOLO-ready through `ultralytics`; connect a trained model in `detect_vehicles` when real camera feeds are available.
