import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';

class ApiService {
  ApiService({
    this.baseUrl = const String.fromEnvironment(
      'GREENFLOW_API_URL',
      defaultValue: 'https://smart-traffic-management-system-with.onrender.com',
    ),
  });

  final String baseUrl;

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await http
        .get(_uri('/dashboard'))
        .timeout(const Duration(seconds: 2));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getSignals() async {
    final response = await http
        .get(_uri('/signals'))
        .timeout(const Duration(seconds: 2));
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<List<dynamic>> getAlerts() async {
    final response = await http
        .get(_uri('/alerts'))
        .timeout(const Duration(seconds: 2));
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> getAnalytics() async {
    final response = await http
        .get(_uri('/analytics'))
        .timeout(const Duration(seconds: 2));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getEvents() async {
    final response = await http
        .get(_uri('/events'))
        .timeout(const Duration(seconds: 2));
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> getPrediction() async {
    final response = await http
        .get(_uri('/prediction'))
        .timeout(const Duration(seconds: 2));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> activateAmbulance({
    required String ambulanceId,
    required String destination,
  }) async {
    final response = await http
        .post(
          _uri('/ambulance/activate'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'ambulanceId': ambulanceId,
            'destination': destination,
          }),
        )
        .timeout(const Duration(seconds: 3));
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Stream<Map<String, dynamic>> get updateStream {
    final wsUrl = baseUrl
        .replaceFirst('http://', 'ws://')
        .replaceFirst('https://', 'wss://');
    try {
      final channel = WebSocketChannel.connect(Uri.parse('$wsUrl/ws'));
      return channel.stream
          .map(
            (message) => jsonDecode(message as String) as Map<String, dynamic>,
          )
          .handleError((_) {});
    } catch (_) {
      return const Stream.empty();
    }
  }

  Map<String, dynamic> demoDashboard() => {
    'trafficFlow': 84,
    'vehiclesPerMinute': 1284,
    'avgWait': 42,
    'activeSignals': 4,
    'aiPredictionConfidence': 92,
  };

  List<dynamic> demoSignals() => [
    {
      'id': 'SIG-04',
      'name': 'Hospital Link',
      'traffic_load': 95,
      'status': 'priority',
    },
    {
      'id': 'SIG-01',
      'name': 'Civic Center',
      'traffic_load': 56,
      'status': 'yellow',
    },
    {
      'id': 'SIG-02',
      'name': 'Metro Spine',
      'traffic_load': 54,
      'status': 'green',
    },
    {'id': 'SIG-03', 'name': 'Tech Park', 'traffic_load': 88, 'status': 'red'},
  ];

  List<dynamic> demoAlerts() => [
    {
      'title': 'Ambulance detected',
      'description': 'Emergency vehicle A-204 approaching SIG-04',
    },
    {'title': 'AI Alert', 'description': 'Congestion rising near Tech Park'},
    {'title': 'Signal optimized', 'description': 'SIG-03 optimized'},
  ];

  Map<String, dynamic> demoAnalytics() => {
    'efficiency': 84,
    'response_time': 38,
    'co2_reduction': 18,
    'emergencyVehiclesAssisted': 127,
    'hoursSaved': 42,
    'trafficJamsPrevented': 32,
  };

  List<dynamic> demoEvents() => [
    {
      'created_at': '10:20 PM',
      'message': 'AI detected congestion',
      'type': 'ai',
    },
    {'created_at': '10:21 PM', 'message': 'SIG-03 optimized', 'type': 'signal'},
    {
      'created_at': '10:22 PM',
      'message': 'Emergency vehicle detected',
      'type': 'emergency',
    },
    {
      'created_at': '10:23 PM',
      'message': 'Green Corridor activated',
      'type': 'green_corridor',
    },
    {
      'created_at': '10:24 PM',
      'message': 'ETA reduced by 4 minutes',
      'type': 'analytics',
    },
  ];

  Map<String, dynamic> demoPrediction() => {
    'zone': 'Civic Center',
    'risk': 'High',
    'confidence': 94,
    'recommendedAction': 'Extend green time by 12 seconds',
  };
}
