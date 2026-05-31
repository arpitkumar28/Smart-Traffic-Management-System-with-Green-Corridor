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

    return CustomScrollView(
      slivers: [
        // Header
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
          sliver: SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'SYSTEM INSIGHTS',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'NEON DISTRICT REAL-TIME METRICS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                    color: const Color(0xFF00E5FF).withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Hero Performance Section
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverToBoxAdapter(
            child: GlassCard(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'CITY EFFICIENCY SCORE',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          color: Color(0xFF00E5FF),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00FF9D).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          '↑ 4.2%',
                          style: TextStyle(
                            color: Color(0xFF00FF9D),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '$efficiency%',
                    style: const TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const SizedBox(
                    height: 100,
                    width: double.infinity,
                    child: _CustomSparkline(color: Color(0xFF00E5FF)),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Metrics Grid
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          sliver: SliverGrid.count(
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.4,
            children: [
              _ModernMetric(
                label: 'Response Gain',
                value: '+$response%',
                icon: Icons.bolt,
                color: const Color(0xFF00FF9D),
              ),
              _ModernMetric(
                label: 'CO2 Reduction',
                value: '$co2%',
                icon: Icons.eco,
                color: const Color(0xFF00FF9D),
              ),
              _ModernMetric(
                label: 'Jams Prevented',
                value: '${controller.analytics['trafficJamsPrevented'] ?? 32}',
                icon: Icons.traffic,
                color: Colors.orangeAccent,
              ),
              _ModernMetric(
                label: 'Hours Saved',
                value: '${controller.analytics['hoursSaved'] ?? 42}h',
                icon: Icons.timer,
                color: const Color(0xFF00E5FF),
              ),
            ],
          ),
        ),

        // Intelligence Sources
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CONNECTED DATA SOURCES',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 16),
                _SourceTile(
                  label: 'Anakin Wire Intelligence',
                  status: 'OPTIMAL',
                  icon: Icons.bolt,
                ),
                _SourceTile(
                  label: 'City CCTV Network',
                  status: 'LIVE',
                  icon: Icons.camera_outdoor,
                ),
                _SourceTile(
                  label: 'Emergency Dispatch (911)',
                  status: 'ACTIVE',
                  icon: Icons.emergency,
                ),
              ],
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 40)),
      ],
    );
  }
}

class _ModernMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _ModernMetric({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              color: Colors.white.withOpacity(0.4),
              letterSpacing: 1.0,
            ),
          ),
        ],
      ),
    );
  }
}

class _SourceTile extends StatelessWidget {
  final String label, status;
  final IconData icon;

  const _SourceTile({required this.label, required this.status, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF07171B).withOpacity(0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF00E5FF).withOpacity(0.5), size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
          Text(
            status,
            style: const TextStyle(color: Color(0xFF00FF9D), fontSize: 10, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}

class _CustomSparkline extends StatelessWidget {
  final Color color;
  const _CustomSparkline({required this.color});
  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _SparklinePainter(color: color));
  }
}

class _SparklinePainter extends CustomPainter {
  final Color color;
  _SparklinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color..strokeWidth = 3..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final path = Path()..moveTo(0, size.height * 0.7)..lineTo(size.width * 0.2, size.height * 0.8)..lineTo(size.width * 0.4, size.height * 0.4)..lineTo(size.width * 0.6, size.height * 0.6)..lineTo(size.width * 0.8, size.height * 0.2)..lineTo(size.width, size.height * 0.3);
    final fillPath = Path.from(path)..lineTo(size.width, size.height)..lineTo(0, size.height)..close();
    final fillPaint = Paint()..shader = LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [color.withOpacity(0.2), Colors.transparent]).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
