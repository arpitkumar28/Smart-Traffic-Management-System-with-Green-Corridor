import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    final efficiency = controller.analytics['efficiency'] as int? ?? 84;
    final response = controller.analytics['response_time'] as int? ?? 38;
    final co2 = controller.analytics['co2_reduction'] as int? ?? 18;

    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text('INTELLIGENCE UNIT', style: TextStyle(fontSize: 10, color: Color(0xFF18F2FF), fontWeight: FontWeight.bold, letterSpacing: 2)),
        const Text('Analytics & Impact', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
        const SizedBox(height: 24),
        
        Row(
          children: [
            Expanded(child: _ImpactMetric(label: 'CITY EFFICIENCY', value: '$efficiency%', color: const Color(0xFF18F2FF))),
            const SizedBox(width: 12),
            Expanded(child: _ImpactMetric(label: 'RESPONSE GAIN', value: '$response%', color: const Color(0xFF8CFF5A))),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _ImpactMetric(label: 'CO2 REDUCTION', value: '$co2%', color: Colors.greenAccent)),
            const SizedBox(width: 12),
            Expanded(child: _ImpactMetric(label: 'JAMS PREVENTED', value: '${controller.analytics['trafficJamsPrevented'] ?? 32}', color: Colors.orangeAccent)),
          ],
        ),
        const SizedBox(height: 24),
        
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.timeline, color: Color(0xFF18F2FF), size: 18),
                  SizedBox(width: 8),
                  Text('NETWORK LOAD (24H)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                ],
              ),
              const SizedBox(height: 24),
              const SizedBox(
                height: 180,
                width: double.infinity,
                child: _CustomSparkline(),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _Legend(color: Color(0xFF18F2FF), label: 'Predicted'),
                  const SizedBox(width: 16),
                  _Legend(color: Color(0xFF8CFF5A), label: 'Actual'),
                ],
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        const _WireIntegrationCard(),
        const SizedBox(height: 32),
      ],
    );
  }
}

class _ImpactMetric extends StatelessWidget {
  const _ImpactMetric({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  final Color color;
  final String label;
  const _Legend({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 8, height: 2, color: color),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white38)),
      ],
    );
  }
}

class _CustomSparkline extends StatelessWidget {
  const _CustomSparkline();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _SparklinePainter(),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint1 = Paint()
      ..color = const Color(0xFF18F2FF)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final paint2 = Paint()
      ..color = const Color(0xFF8CFF5A)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path1 = Path()
      ..moveTo(0, size.height * 0.7)
      ..lineTo(size.width * 0.2, size.height * 0.4)
      ..lineTo(size.width * 0.4, size.height * 0.8)
      ..lineTo(size.width * 0.6, size.height * 0.3)
      ..lineTo(size.width * 0.8, size.height * 0.5)
      ..lineTo(size.width, size.height * 0.2);

    final path2 = Path()
      ..moveTo(0, size.height * 0.8)
      ..lineTo(size.width * 0.2, size.height * 0.6)
      ..lineTo(size.width * 0.4, size.height * 0.7)
      ..lineTo(size.width * 0.6, size.height * 0.4)
      ..lineTo(size.width * 0.8, size.height * 0.6)
      ..lineTo(size.width, size.height * 0.4);

    canvas.drawPath(path1, paint1);
    canvas.drawPath(path2, paint2);

    // Grid lines
    final gridPaint = Paint()..color = Colors.white10..strokeWidth = 1;
    for (int i = 1; i < 4; i++) {
      double y = size.height * (i / 4);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _WireIntegrationCard extends StatelessWidget {
  const _WireIntegrationCard();

  @override
  Widget build(BuildContext context) {
    const sources = ['Traffic Reports', 'Emergency Feeds', 'Weather Data', 'Road Conditions', 'Public Alerts'];
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('INTELLIGENCE SOURCES', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
          const SizedBox(height: 4),
          const Text('Powered by Wire Connected Intelligence', style: TextStyle(color: Color(0xFF18F2FF), fontWeight: FontWeight.bold, fontSize: 10)),
          const SizedBox(height: 20),
          ...sources.map(
            (source) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Color(0xFF8CFF5A), size: 16),
                  const SizedBox(width: 12),
                  Expanded(child: Text(source, style: const TextStyle(fontSize: 13, color: Colors.white70))),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
