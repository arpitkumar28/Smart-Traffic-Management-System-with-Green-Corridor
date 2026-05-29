enum SignalMode { green, yellow, red, priority }

class TrafficSignal {
  const TrafficSignal({
    required this.id,
    required this.name,
    required this.load,
    required this.mode,
  });

  final String id;
  final String name;
  final int load;
  final SignalMode mode;
}

class EmergencyEvent {
  const EmergencyEvent({
    required this.vehicleId,
    required this.route,
    required this.etaSeconds,
    required this.timeSavedSeconds,
    required this.active,
  });

  final String vehicleId;
  final List<String> route;
  final int etaSeconds;
  final int timeSavedSeconds;
  final bool active;
}

class TrafficAlert {
  const TrafficAlert({
    required this.title,
    required this.message,
    required this.priority,
  });

  final String title;
  final String message;
  final int priority;
}
