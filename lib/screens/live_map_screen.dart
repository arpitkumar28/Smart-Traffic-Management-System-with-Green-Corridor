import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({super.key});

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'CITY DIGITAL TWIN',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'AI-POWERED NETWORK TOPOLOGY',
                    style: TextStyle(
                      fontSize: 10,
                      color: Color(0xFF18F2FF),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              _StatusIndicator(active: controller.emergencyActive),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: GlassCard(
              padding: EdgeInsets.zero,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  children: [
                    // Digital Twin Background
                    Positioned.fill(
                      child: AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          return CustomPaint(
                            painter: _DigitalTwinPainter(
                              signals: controller.signals,
                              emergencyActive: controller.emergencyActive,
                              pulseValue: _pulseController.value,
                            ),
                          );
                        },
                      ),
                    ),

                    // Legend
                    Positioned(
                      top: 16,
                      left: 16,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _LegendItem(
                              color: Colors.red,
                              label: 'High Congestion',
                            ),
                            _LegendItem(
                              color: Colors.orange,
                              label: 'Moderate Flow',
                            ),
                            _LegendItem(
                              color: Color(0xFF8CFF5A),
                              label: 'Green Corridor',
                            ),
                            _LegendItem(
                              color: Color(0xFF18F2FF),
                              label: 'AI Node Pulse',
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Active Node Info Overlay
                    if (controller.emergencyActive)
                      Positioned(
                        bottom: 16,
                        left: 16,
                        right: 16,
                        child: _ActiveEmergencyOverlay(controller: controller),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),
      ],
    );
  }
}

class _StatusIndicator extends StatelessWidget {
  final bool active;
  const _StatusIndicator({required this.active});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: active
            ? Colors.red.withOpacity(0.2)
            : Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: active ? Colors.redAccent : Colors.greenAccent,
          width: 0.5,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.circle,
            color: active ? Colors.red : Colors.greenAccent,
            size: 8,
          ),
          const SizedBox(width: 8),
          Text(
            active ? 'EMERGENCY ACTIVE' : 'SYSTEM OPTIMIZED',
            style: TextStyle(
              color: active ? Colors.redAccent : Colors.greenAccent,
              fontWeight: FontWeight.bold,
              fontSize: 10,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}

class _DigitalTwinPainter extends CustomPainter {
  final List<dynamic> signals;
  final bool emergencyActive;
  final double pulseValue;

  _DigitalTwinPainter({
    required this.signals,
    required this.emergencyActive,
    required this.pulseValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1;

    // Draw Background Grid
    for (double i = 0; i < size.width; i += 40) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), gridPaint);
    }
    for (double i = 0; i < size.height; i += 40) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), gridPaint);
    }

    final roadPaint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..strokeWidth = 30
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    // Complex Topology Paths
    final mainPath = Path()
      ..moveTo(size.width * 0.1, size.height * 0.8)
      ..quadraticBezierTo(size.width * 0.3, size.height * 0.7, size.width * 0.5, size.height * 0.5)
      ..quadraticBezierTo(size.width * 0.7, size.height * 0.3, size.width * 0.9, size.height * 0.2);

    final crossPath = Path()
      ..moveTo(size.width * 0.1, size.height * 0.2)
      ..lineTo(size.width * 0.9, size.height * 0.8);

    canvas.drawPath(mainPath, roadPaint);
    canvas.drawPath(crossPath, roadPaint);

    // Heatmap / Congestion Glows
    void drawGlow(Offset center, Color color, double radius) {
      final glowPaint = Paint()
        ..shader = RadialGradient(
          colors: [color.withOpacity(0.3 * (0.8 + 0.2 * pulseValue)), Colors.transparent],
        ).createShader(Rect.fromCircle(center: center, radius: radius));
      canvas.drawCircle(center, radius, glowPaint);
    }

    drawGlow(Offset(size.width * 0.3, size.height * 0.4), Colors.red, 80);
    drawGlow(Offset(size.width * 0.7, size.height * 0.6), Colors.orange, 60);

    // Green Corridor Animation
    if (emergencyActive) {
      final corridorPaint = Paint()
        ..color = const Color(0xFF8CFF5A).withOpacity(0.4 * pulseValue + 0.1)
        ..strokeWidth = 35
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 15);
      canvas.drawPath(mainPath, corridorPaint);

      final linePaint = Paint()
        ..color = const Color(0xFF8CFF5A)
        ..strokeWidth = 4
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;
      canvas.drawPath(mainPath, linePaint);
      
      // Moving Ambulance Indicator on Map
      final pathMetrics = mainPath.computeMetrics().first;
      final tangent = pathMetrics.getTangentForOffset(pathMetrics.length * pulseValue);
      if (tangent != null) {
        final ambPaint = Paint()..color = Colors.white;
        canvas.drawCircle(tangent.position, 8, ambPaint);
        canvas.drawCircle(tangent.position, 12, Paint()..color = Colors.red.withOpacity(0.3));
      }
    }

    // Nodes (Signals) with Pulsing
    for (int i = 0; i < 6; i++) {
      double t = (i + 1) / 7;
      final nodePos = Offset(
        size.width * (0.1 + 0.8 * t),
        size.height * (0.8 - 0.6 * t),
      );

      final isPriority = emergencyActive && (i >= 1 && i <= 4);
      final nodeColor = isPriority ? const Color(0xFF8CFF5A) : const Color(0xFF18F2FF);

      // Pulse ring
      canvas.drawCircle(
        nodePos,
        15 * (1 + pulseValue * 0.4),
        Paint()
          ..color = nodeColor.withOpacity(0.2 * (1 - pulseValue))
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2,
      );

      // Inner core
      canvas.drawCircle(nodePos, 6, Paint()..color = nodeColor);
      canvas.drawCircle(nodePos, 10, Paint()..color = nodeColor.withOpacity(0.3));
    }
  }

  @override
  bool shouldRepaint(covariant _DigitalTwinPainter oldDelegate) => true;
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: Colors.white70,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActiveEmergencyOverlay extends StatelessWidget {
  final TrafficController controller;
  const _ActiveEmergencyOverlay({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Icon(Icons.emergency, color: Colors.redAccent, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'VEHICLE ${controller.emergency.vehicleId} EN ROUTE',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                ),
                const Text(
                  'CORRIDOR PRIORITY: HIGH',
                  style: TextStyle(
                    color: Color(0xFF8CFF5A),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                'ETA',
                style: TextStyle(fontSize: 10, color: Colors.white38),
              ),
              Text(
                '${controller.emergency.etaSeconds ~/ 60}m ${controller.emergency.etaSeconds % 60}s',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF18F2FF),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
