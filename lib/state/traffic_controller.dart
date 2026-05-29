import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';

import '../models/traffic_models.dart';
import '../services/firebase_service.dart';

class TrafficController extends ChangeNotifier {
  final FirebaseTrafficService firebaseService = FirebaseTrafficService();
  final Random _random = Random();
  Timer? _timer;

  int networkFlow = 84;
  int vehiclesPerMinute = 1284;
  int avgWaitSeconds = 42;
  bool emergencyActive = false;
  int aiConfidence = 92;

  String get networkFlowTrend => '+12%';
  String get vpmTrend => '↑ 5%';
  String get waitTrend => '↓ 8%';

  EmergencyEvent emergency = const EmergencyEvent(
    vehicleId: 'A-204',
    route: ['SIG-04', 'SIG-01', 'SIG-02', 'SIG-05'],
    etaSeconds: 204,
    timeSavedSeconds: 210,
    active: true,
  );

  List<TrafficSignal> signals = const [
    TrafficSignal(
      id: 'SIG-04',
      name: 'Hospital Link',
      load: 95,
      mode: SignalMode.priority,
    ),
    TrafficSignal(
      id: 'SIG-01',
      name: 'Civic Center',
      load: 56,
      mode: SignalMode.yellow,
    ),
    TrafficSignal(
      id: 'SIG-02',
      name: 'Metro Spine',
      load: 54,
      mode: SignalMode.green,
    ),
    TrafficSignal(
      id: 'SIG-03',
      name: 'Tech Park',
      load: 88,
      mode: SignalMode.red,
    ),
  ];

  List<TrafficAlert> alerts = [
    TrafficAlert(
      title: 'Ambulance detected',
      message: 'Emergency vehicle A-204 approaching SIG-04',
      priority: 3,
      timestamp: DateTime.now(),
    ),
    TrafficAlert(
      title: 'AI Alert',
      message: 'Congestion rising near Tech Park',
      priority: 2,
      timestamp: DateTime.now(),
    ),
    TrafficAlert(
      title: 'Signal optimized',
      message: 'SIG-02 timing adjusted for flow',
      priority: 1,
      timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
    ),
    TrafficAlert(
      title: 'CO2 reduced',
      message: 'Emissions dropped by 8% this hour',
      priority: 1,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
  ];

  String aiPrediction = 'Heavy congestion expected near Civic Center within 18 minutes.';
  String aiAction = 'Extend green time by 12s.';

  void startDemo() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) {
      networkFlow = 74 + _random.nextInt(20);
      vehiclesPerMinute = 980 + _random.nextInt(520);
      avgWaitSeconds = 32 + _random.nextInt(28);
      aiConfidence = 85 + _random.nextInt(10);
      
      if (emergencyActive) {
        if (emergency.etaSeconds > 5) {
          emergency = EmergencyEvent(
            vehicleId: emergency.vehicleId,
            route: emergency.route,
            etaSeconds: emergency.etaSeconds - 3,
            timeSavedSeconds: emergency.timeSavedSeconds + 1,
            active: true,
          );
        } else {
          deactivateEmergencyMode();
        }
      }

      signals = signals.map((signal) {
        final nextLoad = (signal.load + _random.nextInt(17) - 8).clamp(12, 98);
        var mode = signal.mode;
        
        if (emergencyActive && emergency.route.contains(signal.id)) {
          mode = SignalMode.priority;
        } else {
          if (nextLoad > 80) mode = SignalMode.red;
          else if (nextLoad > 50) mode = SignalMode.yellow;
          else mode = SignalMode.green;
        }

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

  Future<void> activateEmergencyMode() async {
    emergencyActive = true;
    emergency = const EmergencyEvent(
      vehicleId: 'A-204',
      route: ['SIG-04', 'SIG-01', 'SIG-02', 'SIG-05'],
      etaSeconds: 204,
      timeSavedSeconds: 180,
      active: true,
    );
    alerts = [
      TrafficAlert(
        title: 'Green Corridor Active',
        message: 'Ambulance detected. Signals switching to priority.',
        priority: 3,
        timestamp: DateTime.now(),
      ),
      ...alerts,
    ];
    notifyListeners();
    await firebaseService.activateEmergency(emergency);
  }

  void deactivateEmergencyMode() {
    emergencyActive = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
