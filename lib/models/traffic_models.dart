enum SignalMode { green, yellow, red, priority }

class IoTNode {
  const IoTNode({required this.nodeId, required this.intersectionId, required this.status, required this.mode, required this.vehicleCount, required this.queueLengthMeters, required this.signalState, required this.lastUpdated});

  factory IoTNode.fromJson(Map<String, dynamic> json) => IoTNode(
    nodeId: json['nodeId'] as String,
    intersectionId: json['intersectionId'] as String,
    status: json['status'] as String,
    mode: json['mode'] as String,
    vehicleCount: json['vehicleCount'] as int,
    queueLengthMeters: json['queueLengthMeters'] as int,
    signalState: json['signalState'] as String,
    lastUpdated: DateTime.tryParse(json['lastUpdated'] as String? ?? '') ?? DateTime.now(),
  );

  final String nodeId;
  final String intersectionId;
  final String status;
  final String mode;
  final int vehicleCount;
  final int queueLengthMeters;
  final String signalState;
  final DateTime lastUpdated;

  IoTNode copyWith({String? status, int? vehicleCount, int? queueLengthMeters, String? signalState, DateTime? lastUpdated}) => IoTNode(
    nodeId: nodeId,
    intersectionId: intersectionId,
    status: status ?? this.status,
    mode: mode,
    vehicleCount: vehicleCount ?? this.vehicleCount,
    queueLengthMeters: queueLengthMeters ?? this.queueLengthMeters,
    signalState: signalState ?? this.signalState,
    lastUpdated: lastUpdated ?? this.lastUpdated,
  );
}

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
