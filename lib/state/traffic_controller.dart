import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';

import '../models/traffic_models.dart';
import '../services/api_service.dart';

enum EmergencyActivationStage {
  none,
  detecting,
  analyzing,
  optimizing,
  synchronizing,
  active,
}

enum SystemStatus { live, demo, stale, offline, connecting, reconnecting }

class TrafficController extends ChangeNotifier {
  final ApiService apiService = ApiService();
  final Random _random = Random();
  Timer? _reconnectTimer;
  StreamSubscription<Map<String, dynamic>>? _socketSubscription;

  int networkFlow = 84;
  int vehiclesPerMinute = 1284;
  int avgWaitSeconds = 42;
  int activeSignals = 4;
  bool emergencyActive = false;
  int aiConfidence = 92;
  int etaBeforeMinutes = 8;
  int etaAfterMinutes = 4;
  int signalsOptimized = 4;
  EmergencyActivationStage activationStage = EmergencyActivationStage.none;
  SystemStatus systemStatus = SystemStatus.connecting;
  DateTime? lastUpdated;
  String? errorMessage;
  String corridorCommandStatus = 'COMMAND PREPARED';

  String get networkFlowTrend => '+12%';
  String get vpmTrend => 'up 5%';
  String get waitTrend => 'down 8%';

  Map<String, dynamic> analytics = {};
  Map<String, dynamic> prediction = {};

  EmergencyEvent emergency = const EmergencyEvent(
    vehicleId: 'SIM-EMERGENCY-01',
    destination: 'Simulation Hospital',
    route: ['GF-J01', 'GF-J02', 'GF-J03', 'GF-J04', 'GF-J05'],
    etaSeconds: 240,
    timeSavedSeconds: 240,
    active: false,
  );

  List<TrafficSignal> signals = const [];
  List<TrafficAlert> alerts = const [];
  List<Map<String, dynamic>> events = const [];
  List<WireIntelligence> wireIntelligence = [];

  String aiPrediction =
      'Heavy congestion likely near Civic Center within 18 minutes.';
  String aiAction = 'Extend green signal by 12 seconds';

  void startDemo() {
    systemStatus = SystemStatus.connecting;
    refreshFromApi();
    _connectWebSocket();
  }

  void _addRandomWireIntelligence() {
    final sources = [
      'Weather Monitor',
      'Traffic Feed',
      'Emergency Services',
      'Public Reports',
      'Anakin Wire',
    ];
    final types = ['weather', 'traffic', 'emergency', 'alert', 'system'];
    final risks = ['Low', 'Moderate', 'High', 'Critical'];

    final newIntel = WireIntelligence(
      source: sources[_random.nextInt(sources.length)],
      timestamp: 'Just now',
      riskLevel: risks[_random.nextInt(risks.length)],
      message:
          'Wire detected ${['road closure', 'weather alert', 'heavy traffic', 'accident'][_random.nextInt(4)]}',
      type: types[_random.nextInt(types.length)],
    );

    wireIntelligence = [newIntel, ...wireIntelligence].take(10).toList();
    _prependEvent('Now', newIntel.message, 'wire');
  }

  Future<void> refreshFromApi() async {
    systemStatus = SystemStatus.connecting;
    errorMessage = null;
    notifyListeners();
    try {
      final dashboard = await apiService.getDashboard();
      final signalRows = await apiService.getSignals();
      final alertRows = await apiService.getAlerts();
      final analyticsPayload = await apiService.getAnalytics();
      final eventRows = await apiService.getEvents();
      final predictionPayload = await apiService.getPrediction();
      _applyDashboard(dashboard);
      _applySignals(signalRows);
      _applyAlerts(alertRows);
      _applyAnalytics(analyticsPayload);
      _applyEvents(eventRows);
      _applyPrediction(predictionPayload);
      systemStatus = SystemStatus.live;
      lastUpdated = DateTime.now();
      notifyListeners();
    } catch (_) {
      systemStatus = lastUpdated == null
          ? SystemStatus.offline
          : SystemStatus.stale;
      errorMessage = 'Unable to load live traffic data. Retry when connected.';
      notifyListeners();
    }
  }

  Future<void> activateEmergencyMode() async {
    if (systemStatus != SystemStatus.live &&
        systemStatus != SystemStatus.demo) {
      corridorCommandStatus = 'COMMAND BLOCKED OFFLINE';
      errorMessage = 'Operational commands require a live backend connection.';
      notifyListeners();
      return;
    }
    if (activationStage != EmergencyActivationStage.none) return;
    corridorCommandStatus = 'SIMULATION COMMAND SENT';
    activationStage = EmergencyActivationStage.detecting;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    activationStage = EmergencyActivationStage.analyzing;
    _prependEvent('Now', 'Wire detected road closure', 'wire');
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    activationStage = EmergencyActivationStage.optimizing;
    _prependEvent('Now', 'Decision Engine recalculated traffic flow', 'ai');
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    activationStage = EmergencyActivationStage.synchronizing;
    _prependEvent('Now', 'Signal optimized', 'signal');
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));

    try {
      await apiService.prepareEmergencyDemo();
      final response = await apiService.executeEmergencyDemo();
      if (response['status'] != 'CONFIRMED') {
        throw const ApiException(null, 'Backend did not confirm simulation');
      }
      _applyGreenCorridor(response);
      await refreshFromApi();
    } catch (_) {
      activationStage = EmergencyActivationStage.none;
      corridorCommandStatus = 'COMMAND STATUS UNKNOWN';
      errorMessage =
          'Command status could not be confirmed. Check the backend before retrying.';
      notifyListeners();
    }
  }

  void simulateCongestionSpike() {
    aiConfidence = 96;
    aiPrediction = 'Critical congestion detected near Metro Junction.';
    aiAction = 'Extend green cycle +12s and reroute eastbound flow';
    signals = signals.map((signal) {
      final isTarget =
          signal.name == 'Metro Junction' || signal.name == 'Tech Park';
      return TrafficSignal(
        id: signal.id,
        name: signal.name,
        load: isTarget ? 92 : signal.load,
        mode: isTarget ? SignalMode.red : signal.mode,
      );
    }).toList();
    _prependAlert(
      'Congestion Spike',
      'Metro Junction risk raised to HIGH. Engine recommends +12s green cycle.',
      2,
    );
    _prependEvent('Now', 'Engine detected heavy congestion', 'ai');
    _prependEvent('Now', 'SIG-03 optimized +12 seconds', 'signal');
    _addRandomWireIntelligence();
    notifyListeners();
  }

  void deactivateEmergencyMode() {
    emergencyActive = false;
    activationStage = EmergencyActivationStage.none;
    notifyListeners();
  }

  void _connectWebSocket() {
    _reconnectTimer?.cancel();
    _socketSubscription?.cancel();
    systemStatus = SystemStatus.connecting;
    notifyListeners();
    try {
      _socketSubscription = apiService.updateStream.listen(
        _handleSocketEvent,
        onError: (_) {
          systemStatus = SystemStatus.offline;
          notifyListeners();
          _scheduleReconnect();
        },
        onDone: _scheduleReconnect,
        cancelOnError: false,
      );
    } catch (_) {
      _socketSubscription = null;
      systemStatus = SystemStatus.offline;
      notifyListeners();
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_reconnectTimer != null) return;
    systemStatus = SystemStatus.reconnecting;
    notifyListeners();
    _reconnectTimer = Timer(const Duration(seconds: 2), () {
      _reconnectTimer = null;
      _connectWebSocket();
    });
  }

  void _handleSocketEvent(Map<String, dynamic> message) {
    systemStatus = SystemStatus.live;
    lastUpdated = DateTime.now();
    final type = message['type'] as String? ?? '';
    final payload = message['payload'];
    if ((type == 'green_corridor' ||
            type == 'GREEN_CORRIDOR_ACTIVATED' ||
            type == 'GREEN_CORRIDOR_CONFIRMED' ||
            type == 'corridor.activated' ||
            type == 'corridor.confirmed') &&
        payload is Map<String, dynamic>) {
      if (payload['status'] != 'Green Corridor Activated' &&
          payload['status'] != 'CONFIRMED') {
        return;
      }
      _applyGreenCorridor(payload);
    }
    if (type == 'IOT_NODE_UPDATE' ||
        type == 'signal_updates' ||
        type == 'SIGNAL_UPDATE' ||
        type == 'alert_updates' ||
        type == 'ALERT_UPDATE' ||
        type == 'event_updates' ||
        type == 'event_update') {
      refreshFromApi();
    }
    if ((type == 'analytics_updates' || type == 'ANALYTICS_UPDATE') &&
        payload is Map<String, dynamic>) {
      _applyAnalytics(payload);
      notifyListeners();
    }
  }

  void _applyGreenCorridor(Map<String, dynamic> payload) {
    if (payload['status'] != 'Green Corridor Activated' &&
        payload['status'] != 'CONFIRMED') {
      return;
    }
    emergencyActive = true;
    activationStage = EmergencyActivationStage.active;
    corridorCommandStatus = 'COMMAND CONFIRMED';
    errorMessage = null;
    etaBeforeMinutes = payload['etaBefore'] as int? ?? 8;
    etaAfterMinutes = payload['etaAfter'] as int? ?? 4;
    signalsOptimized =
        payload['signalsOptimized'] as int? ??
        payload['affectedNodes'] as int? ??
        5;
    emergency = EmergencyEvent(
      vehicleId:
          payload['vehicleId'] as String? ??
          payload['ambulance'] as String? ??
          'SIM-EMERGENCY-01',
      destination: payload['destination'] as String? ?? 'Simulation Hospital',
      route: payload['route'] is List
          ? (payload['route'] as List).whereType<String>().toList()
          : const ['GF-J01', 'GF-J02', 'GF-J03', 'GF-J04', 'GF-J05'],
      etaSeconds: etaAfterMinutes * 60,
      timeSavedSeconds: (payload['timeSaved'] as int? ?? 4) * 60,
      active: true,
    );
    signals = signals.map((signal) {
      final isRouteSignal = emergency.route.contains(signal.name);
      return TrafficSignal(
        id: signal.id,
        name: signal.name,
        load: isRouteSignal ? max(10, signal.load - 18) : signal.load,
        mode: isRouteSignal ? SignalMode.priority : signal.mode,
      );
    }).toList();
    _prependAlert(
      'Simulated Corridor Confirmed',
      'Vehicle ${emergency.vehicleId}: ETA reduced ${etaBeforeMinutes}m to ${etaAfterMinutes}m',
      3,
    );
    _prependEvent('Now', 'Green Corridor activated', 'green_corridor');
    _prependEvent('Now', 'Ambulance entered corridor', 'emergency');
    _prependEvent(
      'Now',
      'ETA reduced by ${etaBeforeMinutes - etaAfterMinutes} minutes',
      'analytics',
    );
    notifyListeners();
  }

  void _applyDashboard(Map<String, dynamic> payload) {
    networkFlow = payload['trafficFlow'] as int? ?? networkFlow;
    vehiclesPerMinute =
        payload['vehiclesPerMinute'] as int? ?? vehiclesPerMinute;
    avgWaitSeconds = payload['avgWait'] as int? ?? avgWaitSeconds;
    activeSignals = payload['activeSignals'] as int? ?? activeSignals;
    aiConfidence = payload['aiPredictionConfidence'] as int? ?? aiConfidence;
  }

  void _applySignals(List<dynamic> rows) {
    final cityNames = [
      'Civic Center',
      'Hospital Road',
      'Metro Junction',
      'Tech Park',
      'Bridge Way',
      'South Park',
    ];
    signals = rows.asMap().entries.map((entry) {
      final index = entry.key;
      final map = entry.value as Map<String, dynamic>;
      return TrafficSignal(
        id: map['id'] as String,
        name: index < cityNames.length
            ? cityNames[index]
            : map['name'] as String,
        load: map['traffic_load'] as int,
        mode: _signalMode(map['status'] as String),
      );
    }).toList();
  }

  void _applyAlerts(List<dynamic> rows) {
    alerts = rows.map((row) {
      final map = row as Map<String, dynamic>;
      final title = map['title'] as String;
      return TrafficAlert(
        title: title,
        message: map['description'] as String,
        priority: title.contains('Green') || title.contains('Ambulance')
            ? 3
            : 2,
      );
    }).toList();
  }

  void _applyAnalytics(Map<String, dynamic> payload) {
    int numberValue(Object? value, int fallback) =>
        value is num ? value.round() : fallback;

    analytics = {
      'efficiency': numberValue(payload['efficiency'], 84),
      'response_time': numberValue(payload['response_time'], 38),
      'co2_reduction': numberValue(payload['co2_reduction'], 18),
      'emergencyVehiclesAssisted': numberValue(
        payload['emergencyVehiclesAssisted'],
        127,
      ),
      'hoursSaved': numberValue(payload['hoursSaved'], 42),
      'trafficJamsPrevented': numberValue(payload['trafficJamsPrevented'], 32),
    };
  }

  void _applyEvents(List<dynamic> rows) {
    events = rows
        .take(6)
        .map((row) => Map<String, dynamic>.from(row as Map))
        .toList();
  }

  void _applyPrediction(Map<String, dynamic> payload) {
    prediction = payload;
    aiPrediction =
        'Heavy congestion likely near ${payload['zone'] ?? 'Civic Center'} within 18 minutes.';
    aiAction =
        payload['recommendedAction'] as String? ??
        'Extend green signal by 12 seconds';
    aiConfidence = payload['confidence'] as int? ?? aiConfidence;
  }

  void _prependAlert(String title, String message, int priority) {
    alerts = [
      TrafficAlert(
        title: title,
        message: message,
        priority: priority,
        timestamp: DateTime.now(),
      ),
      ...alerts,
    ].take(8).toList();
  }

  void _prependEvent(String time, String message, String type) {
    events = [
      {'created_at': time, 'message': message, 'type': type},
      ...events,
    ].take(10).toList();
  }

  SignalMode _signalMode(String status) {
    return switch (status) {
      'green' => SignalMode.green,
      'yellow' => SignalMode.yellow,
      'red' => SignalMode.red,
      'priority' => SignalMode.priority,
      _ => SignalMode.green,
    };
  }

  @override
  void dispose() {
    _reconnectTimer?.cancel();
    _socketSubscription?.cancel();
    super.dispose();
  }
}
