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

class TrafficController extends ChangeNotifier {
  final ApiService apiService = ApiService();
  final Random _random = Random();
  Timer? _timer;
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

  String get networkFlowTrend => '+12%';
  String get vpmTrend => 'up 5%';
  String get waitTrend => 'down 8%';

  Map<String, dynamic> analytics = {};
  Map<String, dynamic> prediction = {};

  EmergencyEvent emergency = const EmergencyEvent(
    vehicleId: 'A-204',
    destination: 'City General Hospital',
    route: ['Tech Park', 'Civic Center', 'Metro Junction', 'Hospital Road'],
    etaSeconds: 240,
    timeSavedSeconds: 240,
    active: true,
  );

  List<TrafficSignal> signals = const [];
  List<TrafficAlert> alerts = const [];
  List<Map<String, dynamic>> events = const [];
  List<WireIntelligence> wireIntelligence = [];

  String aiPrediction =
      'Heavy congestion likely near Civic Center within 18 minutes.';
  String aiAction = 'Extend green signal by 12 seconds';

  void startDemo() {
    _seedDemoData();
    refreshFromApi();
    _connectWebSocket();
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) {
      networkFlow = (74 + _random.nextInt(20)).clamp(0, 100);
      vehiclesPerMinute = 980 + _random.nextInt(520);
      avgWaitSeconds = (32 + _random.nextInt(28)).clamp(15, 60);
      aiConfidence = 88 + _random.nextInt(8);

      if (emergencyActive && emergency.etaSeconds > 15) {
        emergency = EmergencyEvent(
          vehicleId: emergency.vehicleId,
          destination: emergency.destination,
          route: emergency.route,
          etaSeconds: (emergency.etaSeconds - 3).clamp(0, 600),
          timeSavedSeconds: emergency.timeSavedSeconds,
          active: true,
        );
      }

      // Generate random Wire intelligence if in demo
      if (_random.nextDouble() > 0.8) {
        _addRandomWireIntelligence();
      }

      signals = signals.map((signal) {
        final nextLoad = (signal.load + _random.nextInt(17) - 8).clamp(12, 98);
        final mode = emergencyActive && emergency.route.contains(signal.name)
            ? SignalMode.priority
            : _modeForLoad(nextLoad);
        return TrafficSignal(
          id: signal.id,
          name: signal.name,
          load: nextLoad,
          mode: mode,
        );
      }).toList();
      notifyListeners();
    });
  }

  void _addRandomWireIntelligence() {
    final sources = ['Weather AI', 'Traffic Feed', 'Emergency Services', 'Public Reports', 'Anakin Wire'];
    final types = ['weather', 'traffic', 'emergency', 'alert', 'system'];
    final risks = ['Low', 'Moderate', 'High', 'Critical'];
    
    final newIntel = WireIntelligence(
      source: sources[_random.nextInt(sources.length)],
      timestamp: 'Just now',
      riskLevel: risks[_random.nextInt(risks.length)],
      message: 'Wire detected ${['road closure', 'weather alert', 'heavy traffic', 'accident'][_random.nextInt(4)]}',
      type: types[_random.nextInt(types.length)],
    );
    
    wireIntelligence = [newIntel, ...wireIntelligence].take(10).toList();
    _prependEvent('Now', newIntel.message, 'wire');
  }

  Future<void> refreshFromApi() async {
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
      notifyListeners();
    } catch (_) {
      _seedDemoData();
    }
  }

  Future<void> activateEmergencyMode() async {
    activationStage = EmergencyActivationStage.detecting;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    activationStage = EmergencyActivationStage.analyzing;
    _prependEvent('Now', 'Wire detected road closure', 'wire');
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    activationStage = EmergencyActivationStage.optimizing;
    _prependEvent('Now', 'AI recalculated traffic flow', 'ai');
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    activationStage = EmergencyActivationStage.synchronizing;
    _prependEvent('Now', 'Signal optimized', 'signal');
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));

    try {
      final response = await apiService.activateAmbulance(
        ambulanceId: emergency.vehicleId,
        destination: emergency.destination,
      );
      _applyGreenCorridor(response);
      await refreshFromApi();
    } catch (_) {
      _applyGreenCorridor({
        'status': 'Green Corridor Activated',
        'ambulance': 'A-204',
        'vehicleId': 'A-204',
        'etaBefore': 8,
        'etaAfter': 4,
        'timeSaved': 4,
        'signalsOptimized': 4,
      });
    }
  }

  void deactivateEmergencyMode() {
    emergencyActive = false;
    activationStage = EmergencyActivationStage.none;
    notifyListeners();
  }

  void _connectWebSocket() {
    _socketSubscription?.cancel();
    try {
      _socketSubscription = apiService.updateStream.listen(
        _handleSocketEvent,
        onError: (_) {},
        cancelOnError: false,
      );
    } catch (_) {
      _socketSubscription = null;
    }
  }

  void _handleSocketEvent(Map<String, dynamic> message) {
    final type = message['type'] as String? ?? '';
    final payload = message['payload'];
    if (type == 'green_corridor' && payload is Map<String, dynamic>) {
      _applyGreenCorridor(payload);
    }
    if (type == 'signal_updates' ||
        type == 'alert_updates' ||
        type == 'event_updates') {
      refreshFromApi();
    }
    if (type == 'analytics_updates' && payload is Map<String, dynamic>) {
      _applyAnalytics(payload);
      notifyListeners();
    }
  }

  void _applyGreenCorridor(Map<String, dynamic> payload) {
    emergencyActive = true;
    activationStage = EmergencyActivationStage.active;
    etaBeforeMinutes = payload['etaBefore'] as int? ?? 8;
    etaAfterMinutes = payload['etaAfter'] as int? ?? 4;
    signalsOptimized = payload['signalsOptimized'] as int? ?? 4;
    emergency = EmergencyEvent(
      vehicleId:
          payload['vehicleId'] as String? ??
          payload['ambulance'] as String? ??
          'A-204',
      destination: payload['destination'] as String? ?? 'City General Hospital',
      route: const ['Tech Park', 'Civic Center', 'Metro Junction', 'Hospital Road'],
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
    analytics = {
      ...analytics,
      'efficiency': max((analytics['efficiency'] as int? ?? 84), 91),
      'response_time': max((analytics['response_time'] as int? ?? 38), 52),
      'emergencyVehiclesAssisted':
          (analytics['emergencyVehiclesAssisted'] as int? ?? 127) + 1,
      'trafficJamsPrevented':
          (analytics['trafficJamsPrevented'] as int? ?? 32) + 1,
    };
    _prependAlert(
      'Green Corridor Active',
      'Vehicle ${emergency.vehicleId}: ETA reduced ${etaBeforeMinutes}m to ${etaAfterMinutes}m',
      3,
    );
    _prependEvent('Now', 'Green Corridor activated', 'green_corridor');
    _prependEvent(
      'Now',
      'Ambulance entered corridor',
      'emergency',
    );
    _prependEvent(
      'Now',
      'ETA reduced by ${etaBeforeMinutes - etaAfterMinutes} minutes',
      'analytics',
    );
    notifyListeners();
  }

  void _seedDemoData() {
    _applyDashboard(apiService.demoDashboard());
    _applySignals(apiService.demoSignals());
    _applyAlerts(apiService.demoAlerts());
    _applyAnalytics(apiService.demoAnalytics());
    _applyEvents(apiService.demoEvents());
    _applyPrediction(apiService.demoPrediction());
    
    // Override signal names with real city names
    final cityNames = ['Civic Center', 'Hospital Road', 'Metro Junction', 'Tech Park', 'Bridge Way', 'South Park'];
    signals = List.generate(cityNames.length, (i) => TrafficSignal(
      id: 'SIG-0${i+1}',
      name: cityNames[i],
      load: 30 + _random.nextInt(40),
      mode: SignalMode.green,
    ));

    wireIntelligence = [
      const WireIntelligence(
        source: 'Anakin Wire',
        timestamp: '2m ago',
        riskLevel: 'High',
        message: 'Extreme congestion detected at Metro Junction',
        type: 'traffic',
      ),
      const WireIntelligence(
        source: 'Weather AI',
        timestamp: '5m ago',
        riskLevel: 'Moderate',
        message: 'Heavy rain expected near Civic Center',
        type: 'weather',
      ),
    ];
    
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
    final cityNames = ['Civic Center', 'Hospital Road', 'Metro Junction', 'Tech Park', 'Bridge Way', 'South Park'];
    signals = rows.asMap().entries.map((entry) {
      final index = entry.key;
      final map = entry.value as Map<String, dynamic>;
      return TrafficSignal(
        id: map['id'] as String,
        name: index < cityNames.length ? cityNames[index] : map['name'] as String,
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
    analytics = {
      'efficiency': payload['efficiency'] as int? ?? 84,
      'response_time': payload['response_time'] as int? ?? 38,
      'co2_reduction': payload['co2_reduction'] as int? ?? 18,
      'emergencyVehiclesAssisted':
          payload['emergencyVehiclesAssisted'] as int? ?? 127,
      'hoursSaved': payload['hoursSaved'] as int? ?? 42,
      'trafficJamsPrevented': payload['trafficJamsPrevented'] as int? ?? 32,
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
    aiAction = payload['recommendedAction'] as String? ?? 'Extend green signal by 12 seconds';
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

  SignalMode _modeForLoad(int load) {
    if (load > 80) {
      return SignalMode.red;
    }
    if (load > 50) {
      return SignalMode.yellow;
    }
    return SignalMode.green;
  }

  @override
  void dispose() {
    _timer?.cancel();
    _socketSubscription?.cancel();
    super.dispose();
  }
}
