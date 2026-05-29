import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Intelligence Analytics',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
        ),
        const Text(
          'AI-driven traffic optimization metrics',
          style: TextStyle(color: Colors.white60, fontSize: 12),
        ),
        const SizedBox(height: 24),
        
        // Killer Metrics Row
        Row(
          children: [
            Expanded(
              child: GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text('LIVES SAVED', style: TextStyle(fontSize: 10, color: Colors.white54, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('127', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF8CFF5A))),
                    const Text('This Month', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text('RESPONSE IMPROVED', style: TextStyle(fontSize: 10, color: Colors.white54, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('38%', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF18F2FF))),
                    const Text('Avg. Reduction', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  ],
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        _buildSectionHeader('Performance Index'),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            children: [
              _Bar(label: 'Network Efficiency', value: controller.networkFlow, color: const Color(0xFF18F2FF)),
              _Bar(label: 'Emergency Response', value: 92, color: const Color(0xFF8CFF5A)),
              _Bar(label: 'CO2 Emission Reduction', value: 64, color: Colors.greenAccent),
              _Bar(label: 'Congestion Mitigation', value: 72, color: Colors.orangeAccent),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _buildSectionHeader('Traffic Volume (24h)'),
        const SizedBox(height: 12),
        const GlassCard(
          height: 180,
          child: _MiniLineChart(),
        ),
        const SizedBox(height: 24),
        _buildSectionHeader('AI Optimization Prediction'),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.auto_awesome, color: Color(0xFF8CFF5A), size: 18),
                  SizedBox(width: 8),
                  const Text('Optimal Signal Timing', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'Based on current flow, shifting Signal SIG-03 to a 45s cycle will reduce buildup by 14% in the next 10 minutes.',
                style: TextStyle(fontSize: 13, color: Colors.white70),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF18F2FF)),
                  foregroundColor: const Color(0xFF18F2FF),
                ),
                child: const Text('Apply AI Recommendation'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.1),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.label, required this.value, required this.color});

  final String label;
  final int value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 13, color: Colors.white70)),
              Text('$value%', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
          const SizedBox(height: 8),
          Stack(
            children: [
              Container(
                height: 6,
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              FractionallySizedBox(
                widthFactor: value / 100,
                child: Container(
                  height: 6,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(3),
                    boxShadow: [
                      BoxShadow(color: color.withOpacity(0.3), blurRadius: 4),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniLineChart extends StatelessWidget {
  const _MiniLineChart();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.infinite,
      painter: _ChartPainter(),
    );
  }
}

class _ChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF18F2FF)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [const Color(0xFF18F2FF).withOpacity(0.3), Colors.transparent],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path()
      ..moveTo(0, size.height * 0.7)
      ..lineTo(size.width * 0.2, size.height * 0.5)
      ..lineTo(size.width * 0.4, size.height * 0.8)
      ..lineTo(size.width * 0.6, size.height * 0.3)
      ..lineTo(size.width * 0.8, size.height * 0.4)
      ..lineTo(size.width, size.height * 0.1);

    final fillPath = Path.from(path)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);

    // Draw data points
    final pointPaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(size.width * 0.6, size.height * 0.3), 4, pointPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
