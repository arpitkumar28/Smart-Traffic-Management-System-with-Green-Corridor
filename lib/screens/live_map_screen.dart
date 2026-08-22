import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../models/traffic_models.dart';
import '../state/traffic_controller.dart';

class LiveMapScreen extends StatefulWidget {
  final bool isHeroMode;
  const LiveMapScreen({super.key, this.isHeroMode = false});

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  final MapController _mapController = MapController();
  bool _showEmergencyOverlay = false;

  final Map<String, LatLng> _cityCoordinates = {
    'Civic Center': const LatLng(12.9716, 77.5946),
    'Hospital Road': const LatLng(12.9750, 77.5900),
    'Metro Junction': const LatLng(12.9800, 77.5950),
    'Tech Park': const LatLng(12.9850, 77.6000),
    'Bridge Way': const LatLng(12.9900, 77.6050),
    'South Park': const LatLng(12.9650, 77.5850),
  };

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();

    // Detect emergency activation for overlay
    if (controller.emergencyActive && !_showEmergencyOverlay) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        setState(() => _showEmergencyOverlay = true);
        Future.delayed(const Duration(seconds: 8), () {
          if (mounted) setState(() => _showEmergencyOverlay = false);
        });
      });
    }

    if (widget.isHeroMode) {
      return _buildMapSection(controller);
    }

    return Stack(
      children: [
        SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              _buildHeader(controller),
              
              // Map Section
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.35,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                  child: _buildMapSection(controller),
                ),
              ),

              // AI Reasoning Engine (Hackathon Killer Feature)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: _AiReasoningEngine(controller: controller),
              ),

              // Green Corridor Status Widget
              if (controller.emergencyActive)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: _GreenCorridorStatus(controller: controller),
                ),

              // Live Event Timeline & Quick Stats
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 3,
                      child: _EventTimeline(controller: controller),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: Column(
                        children: [
                          _CompactStatTile(
                            label: 'AI FLOW',
                            value: '${controller.networkFlow}%',
                            icon: Icons.auto_graph,
                            color: const Color(0xFF00E5FF),
                          ),
                          const SizedBox(height: 12),
                          _CompactStatTile(
                            label: 'CO2 SAVED',
                            value: '52%',
                            icon: Icons.eco_outlined,
                            color: const Color(0xFF00FF9D),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        
        // Detailed Emergency Notification Overlay
        if (_showEmergencyOverlay)
          Positioned(
            top: 100,
            left: 20,
            right: 20,
            child: _EmergencyNotification(
              destination: controller.emergency.destination,
              etaSaved: controller.etaBeforeMinutes - controller.etaAfterMinutes,
              signalsSynced: controller.signalsOptimized,
            ),
          ),
      ],
    );
  }

  Widget _buildHeader(TrafficController controller) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'COMMAND CENTER',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF00E5FF),
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 4),
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 12,
                  runSpacing: 6,
                  children: [
                    const Text(
                      'NEON DISTRICT',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    _LiveClock(),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          _StatusPill(active: controller.emergencyActive),
        ],
      ),
    );
  }

  Widget _buildMapSection(TrafficController controller) {
    return Container(
      decoration: CyberDecoration.card,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            FlutterMap(
              mapController: _mapController,
              options: const MapOptions(
                initialCenter: LatLng(12.9750, 77.5946),
                initialZoom: 14.0,
              ),
              children: [
                TileLayer(
                  urlTemplate:
                      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                  subdomains: const ['a', 'b', 'c', 'd'],
                  userAgentPackageName: 'com.example.smart_traffic_management_system_with_green_corridor',
                  retinaMode: RetinaMode.isHighDensity(context),
                ),
                if (controller.emergencyActive)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: controller.emergency.route
                            .map((name) => _cityCoordinates[name] ?? const LatLng(0, 0))
                            .where((loc) => loc.latitude != 0)
                            .toList(),
                        color: const Color(0xFF00FF9D).withValues(alpha: 0.5),
                        strokeWidth: 8,
                        pattern: const StrokePattern.dotted(),
                      ),
                      Polyline(
                        points: controller.emergency.route
                            .map((name) => _cityCoordinates[name] ?? const LatLng(0, 0))
                            .where((loc) => loc.latitude != 0)
                            .toList(),
                        color: const Color(0xFF00FF9D),
                        strokeWidth: 3,
                      ),
                    ],
                  ),
                MarkerLayer(
                  markers: controller.signals.map((signal) {
                    final pos = _cityCoordinates[signal.name] ?? const LatLng(0, 0);
                    return Marker(
                      point: pos,
                      width: 80,
                      height: 80,
                      child: _SignalMarker(
                        signal: signal,
                        pulseValue: _pulseController.value,
                        isEmergencyRoute: controller.emergencyActive &&
                            controller.emergency.route.contains(signal.name),
                      ),
                    );
                  }).toList(),
                ),
                if (controller.emergencyActive)
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: _getAmbulancePosition(controller),
                        width: 40,
                        height: 40,
                        child: _AmbulanceMarker(pulseValue: _pulseController.value),
                      ),
                    ],
                  ),
              ],
            ),
            
            // Map Legend
            Positioned(
              bottom: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF07171B).withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _LegendItem(icon: Icons.emergency, color: Colors.red, label: 'Ambulance'),
                    const SizedBox(height: 4),
                    _LegendItem(icon: Icons.circle, color: const Color(0xFF00FF9D), label: 'Green Corridor'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  LatLng _getAmbulancePosition(TrafficController controller) {
    if (controller.emergency.route.isEmpty) return const LatLng(12.9750, 77.5946);
    final route = controller.emergency.route;
    final totalSteps = route.length;
    final progress = (1 - (controller.emergency.etaSeconds / 240)).clamp(0.0, 1.0);
    final currentStep = (progress * (totalSteps - 1)).floor();
    final nextStep = (currentStep + 1).clamp(0, totalSteps - 1);
    final start = _cityCoordinates[route[currentStep]] ?? const LatLng(12.9750, 77.5946);
    final end = _cityCoordinates[route[nextStep]] ?? const LatLng(12.9750, 77.5946);
    final fraction = (progress * (totalSteps - 1)) % 1.0;
    return LatLng(
      start.latitude + (end.latitude - start.latitude) * fraction,
      start.longitude + (end.longitude - start.longitude) * fraction,
    );
  }
}

class CyberDecoration {
  static BoxDecoration get card => BoxDecoration(
    color: const Color(0xFF07171B).withValues(alpha: 0.7),
    borderRadius: BorderRadius.circular(24),
    border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.2)),
    boxShadow: [
      BoxShadow(
        color: const Color(0xFF00E5FF).withValues(alpha: 0.1),
        blurRadius: 20,
        spreadRadius: 2,
      ),
    ],
  );
}

class _LegendItem extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  const _LegendItem({required this.icon, required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 12),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _AiReasoningEngine extends StatelessWidget {
  final TrafficController controller;
  const _AiReasoningEngine({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: CyberDecoration.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.psychology, color: Color(0xFF00FF9D), size: 20),
              const SizedBox(width: 8),
              const Text(
                'AI REASONING ENGINE',
                style: TextStyle(
                  color: Color(0xFF00FF9D),
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                  letterSpacing: 1.2,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF00FF9D).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'CONFIDENCE: ${controller.aiConfidence}%',
                  style: const TextStyle(color: Color(0xFF00FF9D), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _AiMetric(label: 'Target Zone', value: controller.prediction['zone'] ?? 'Civic Center'),
              _AiMetric(label: 'Risk', value: controller.prediction['risk'] ?? 'High'),
              _AiMetric(label: 'AI Action', value: 'Sync +12s Cycles'),
            ],
          ),
        ],
      ),
    );
  }
}

class _AiMetric extends StatelessWidget {
  final String label, value;
  const _AiMetric({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: TextStyle(color: Colors.white30, fontSize: 8, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
          ),
        ],
      ),
    );
  }
}

class _EmergencyNotification extends StatelessWidget {
  final String destination;
  final int etaSaved;
  final int signalsSynced;

  const _EmergencyNotification({
    required this.destination,
    required this.etaSaved,
    required this.signalsSynced,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.red.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
            boxShadow: [
              BoxShadow(color: Colors.red.withValues(alpha: 0.5), blurRadius: 40, spreadRadius: 5),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.emergency, color: Colors.white, size: 32),
                  const SizedBox(width: 12),
                  const Text(
                    'EMERGENCY ROUTE ACTIVE',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 0.5),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _InfoRow(label: 'DESTINATION', value: destination),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _InfoRow(label: 'ETA SAVED', value: '$etaSaved MIN', color: const Color(0xFF00FF9D))),
                  Expanded(child: _InfoRow(label: 'NODES SYNCED', value: '$signalsSynced', color: Colors.white)),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'PRIORITY 08 PROTOCOL ENGAGED',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  final Color color;
  const _InfoRow({required this.label, required this.value, this.color = Colors.white});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
      ],
    );
  }
}

class _LiveClock extends StatefulWidget {
  @override
  State<_LiveClock> createState() => _LiveClockState();
}

class _LiveClockState extends State<_LiveClock> {
  late Timer _timer;
  late DateTime _now;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final timeStr = "${_now.hour.toString().padLeft(2, '0')}:${_now.minute.toString().padLeft(2, '0')}:${_now.second.toString().padLeft(2, '0')}";
    return Text(
      timeStr,
      style: TextStyle(
        color: Colors.white.withValues(alpha: 0.4),
        fontSize: 16,
        fontWeight: FontWeight.w500,
        fontFamily: 'monospace',
      ),
    );
  }
}

class _SignalMarker extends StatelessWidget {
  final dynamic signal;
  final double pulseValue;
  final bool isEmergencyRoute;

  const _SignalMarker({
    required this.signal,
    required this.pulseValue,
    required this.isEmergencyRoute,
  });

  @override
  Widget build(BuildContext context) {
    final baseColor = isEmergencyRoute ? const Color(0xFF00FF9D) : (signal.mode == SignalMode.red ? Colors.red : const Color(0xFF00E5FF));

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 15 + (pulseValue * 20),
              height: 15 + (pulseValue * 20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: baseColor.withValues(alpha: 0.2 * (1 - pulseValue)),
              ),
            ),
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: baseColor,
                boxShadow: [BoxShadow(color: baseColor.withValues(alpha: 0.6), blurRadius: 10)],
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            signal.name,
            style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

class _AmbulanceMarker extends StatelessWidget {
  final double pulseValue;
  const _AmbulanceMarker({required this.pulseValue});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          width: 25 + (pulseValue * 15),
          height: 25 + (pulseValue * 15),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.red.withValues(alpha: 0.4 * (1 - pulseValue)),
          ),
        ),
        const Icon(Icons.emergency, color: Colors.white, size: 20),
      ],
    );
  }
}

class _GreenCorridorStatus extends StatelessWidget {
  final TrafficController controller;
  const _GreenCorridorStatus({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: CyberDecoration.card.copyWith(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF00FF9D).withValues(alpha: 0.15),
            const Color(0xFF00FF9D).withValues(alpha: 0.05),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF00FF9D).withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.bolt, color: Color(0xFF00FF9D), size: 20),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'GREEN CORRIDOR ACTIVE',
                      style: TextStyle(
                        color: Color(0xFF00FF9D),
                        fontWeight: FontWeight.w900,
                        fontSize: 12,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Optimizing route for Emergency A-204',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                  ],
                ),
              ),
              _EtaBadge(
                eta: '${controller.emergency.etaSeconds ~/ 60}m',
                saved: '+${controller.emergency.timeSavedSeconds ~/ 60}m',
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Colors.white12, height: 1),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _CorridorDetail(label: 'Destination', value: controller.emergency.destination)),
              const SizedBox(width: 10),
              Expanded(child: _CorridorDetail(label: 'Priority', value: 'Highest')),
              const SizedBox(width: 10),
              Expanded(child: _CorridorDetail(label: 'Hubs Locked', value: '${controller.signalsOptimized}')),
            ],
          ),
        ],
      ),
    );
  }
}

class _EtaBadge extends StatelessWidget {
  final String eta;
  final String saved;
  const _EtaBadge({required this.eta, required this.saved});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(eta, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        Text('Saved: $saved', style: const TextStyle(color: Color(0xFF00FF9D), fontSize: 10, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _CorridorDetail extends StatelessWidget {
  final String label, value;
  const _CorridorDetail({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 8, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
      ],
    );
  }
}

class _EventTimeline extends StatelessWidget {
  final TrafficController controller;
  const _EventTimeline({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: CyberDecoration.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'LIVE LOGS',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              ),
              const Icon(Icons.more_horiz, color: Colors.white24, size: 16),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.events.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final event = controller.events[index];
              return _TimelineItem(
                message: event['message'] ?? event['event'] ?? '',
                time: event['created_at'] ?? event['timestamp'] ?? '',
                type: event['type'] ?? '',
              );
            },
          ),
        ],
      ),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final String message, time, type;
  const _TimelineItem({required this.message, required this.time, required this.type});

  @override
  Widget build(BuildContext context) {
    IconData icon = Icons.info_outline;
    Color color = Colors.white30;
    if (type == 'emergency' || message.contains('Ambulance')) {
      icon = Icons.emergency; color = Colors.redAccent;
    } else if (type == 'wire' || message.contains('Wire')) {
      icon = Icons.radar; color = const Color(0xFF00E5FF);
    } else if (type == 'ai' || message.contains('AI')) {
      icon = Icons.psychology; color = Colors.purpleAccent;
    } else if (type == 'green_corridor') {
      icon = Icons.bolt; color = const Color(0xFF00FF9D);
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(message, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500), maxLines: 2, overflow: TextOverflow.ellipsis),
              Text(time, style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 9)),
            ],
          ),
        ),
      ],
    );
  }
}

class _CompactStatTile extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;

  const _CompactStatTile({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: CyberDecoration.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color.withValues(alpha: 0.7), size: 16),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 8, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final bool active;
  const _StatusPill({required this.active});

  @override
  Widget build(BuildContext context) {
    final color = active ? Colors.red : const Color(0xFF00E5FF);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _BlinkingDot(color: color),
          const SizedBox(width: 8),
          Text(
            active ? 'EMERGENCY' : 'OPERATIONS ONLINE',
            style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1.0),
          ),
        ],
      ),
    );
  }
}

class _BlinkingDot extends StatefulWidget {
  final Color color;
  const _BlinkingDot({required this.color});
  @override
  State<_BlinkingDot> createState() => _BlinkingDotState();
}

class _BlinkingDotState extends State<_BlinkingDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))..repeat(reverse: true);
  }
  @override
  void dispose() { _controller.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _controller, child: Icon(Icons.circle, color: widget.color, size: 8));
  }
}
