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

  EmergencyEvent emergency = const EmergencyEvent(
    vehicleId: 'EV-204',
    route: ['SIG-04', 'SIG-01', 'SIG-02', 'SIG-05'],
    etaSeconds: 420,
    timeSavedSeconds: 210,
    active: true,
  );

  List<TrafficSignal> signals = const [
    TrafficSignal(
      id: 'SIG-04',
      name: 'Hospital Link',
      load: 26,
      mode: SignalMode.priority,
    ),
    TrafficSignal(
      id: 'SIG-01',
      name: 'Civic Center',
      load: 38,
      mode: SignalMode.priority,
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

  List<TrafficAlert> alerts = const [
    TrafficAlert(
      title: 'AI Alert',
      message: 'Congestion rising near Tech Park',
      priority: 2,
    ),
    TrafficAlert(
      title: 'Eco Mode',
      message: 'Signal timing reduced idle emissions',
      priority: 1,
    ),
    TrafficAlert(
      title: 'Emergency Ready',
      message: 'Ambulance route precomputed',
      priority: 3,
    ),
  ];

  void startDemo() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) {
      networkFlow = 74 + _random.nextInt(20);
      vehiclesPerMinute = 980 + _random.nextInt(520);
      avgWaitSeconds = 32 + _random.nextInt(28);
      signals = signals.map((signal) {
        final nextLoad = (signal.load + _random.nextInt(17) - 8).clamp(12, 96);
        final mode = emergencyActive && emergency.route.contains(signal.id)
            ? SignalMode.priority
            : signal.mode;
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
    alerts = [
      const TrafficAlert(
        title: 'Green Corridor Active',
        message: 'Upcoming signals are switching to priority green',
        priority: 3,
      ),
      ...alerts,
    ];
    notifyListeners();
    await firebaseService.activateEmergency(emergency);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
