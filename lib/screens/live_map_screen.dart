import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class LiveMapScreen extends StatelessWidget {
  const LiveMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Live Map',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        GlassCard(
          padding: EdgeInsets.zero,
          child: SizedBox(
            height: 430,
            child: CustomPaint(
              painter: _RoutePainter(
                emergencyActive: controller.emergencyActive,
              ),
              child: Stack(
                children: [
                  AnimatedPositioned(
                    duration: const Duration(seconds: 2),
                    left: controller.emergencyActive ? 245 : 36,
                    top: controller.emergencyActive ? 96 : 315,
                    child: const Icon(
                      Icons.local_hospital,
                      color: Color(0xFF8CFF5A),
                      size: 42,
                    ),
                  ),
                  ...controller.signals.asMap().entries.map((entry) {
                    final index = entry.key;
                    final signal = entry.value;
                    return Positioned(
                      left: 42.0 + index * 72,
                      top: 305.0 - index * 58,
                      child: Chip(
                        avatar: const Icon(Icons.traffic, size: 16),
                        label: Text(signal.id),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 18),
        const Text(
          'Google Maps Flutter can replace this simulator once API keys and platform credentials are added.',
          style: TextStyle(color: Colors.white54),
        ),
      ],
    );
  }
}

class _RoutePainter extends CustomPainter {
  const _RoutePainter({required this.emergencyActive});

  final bool emergencyActive;

  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.12)
      ..strokeWidth = 18
      ..strokeCap = StrokeCap.round;
    final routePaint = Paint()
      ..color = emergencyActive
          ? const Color(0xFF8CFF5A)
          : const Color(0xFF18F2FF)
      ..strokeWidth = 7
      ..strokeCap = StrokeCap.round;
    final path = Path()
      ..moveTo(40, size.height - 72)
      ..lineTo(size.width * 0.42, size.height * 0.58)
      ..lineTo(size.width - 70, 86);
    canvas.drawPath(path, roadPaint);
    canvas.drawPath(path, routePaint);
  }

  @override
  bool shouldRepaint(covariant _RoutePainter oldDelegate) =>
      oldDelegate.emergencyActive != emergencyActive;
}
