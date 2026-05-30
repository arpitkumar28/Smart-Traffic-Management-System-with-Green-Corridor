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
    required this.destination,
    required this.route,
    required this.etaSeconds,
    required this.timeSavedSeconds,
    required this.active,
  });

  final String vehicleId;
  final String destination;
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
    this.timestamp,
  });

  final String title;
  final String message;
  final int priority;
  final DateTime? timestamp;
}

class WireIntelligence {
  const WireIntelligence({
    required this.source,
    required this.timestamp,
    required this.riskLevel,
    required this.message,
    required this.type,
  });

  final String source;
  final String timestamp;
  final String riskLevel;
  final String message;
  final String type;
}

class TrafficMetric {
  const TrafficMetric({
    required this.label,
    required this.value,
    required this.trend,
    required this.isPositive,
  });

  final String label;
  final String value;
  final String trend;
  final bool isPositive;
}
