import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class LiveMapScreen extends StatelessWidget {
  const LiveMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              const Text(
                'City Live Feed',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.circle, color: Colors.red, size: 8),
                    SizedBox(width: 8),
                    Text('LIVE', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Stack(
            children: [
              // Map Simulator
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 18),
                child: GlassCard(
                  padding: EdgeInsets.zero,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: CustomPaint(
                      painter: _MapPainter(
                        signals: controller.signals,
                        emergencyActive: controller.emergencyActive,
                      ),
                      child: Stack(
                        children: [
                          // Pulse effect for emergency
                          if (controller.emergencyActive)
                            const _EmergencyPulse(),
                          
                          // Moving Ambulance Icon
                          AnimatedPositioned(
                            duration: const Duration(seconds: 4),
                            left: controller.emergencyActive ? 280 : 40,
                            top: controller.emergencyActive ? 120 : 400,
                            child: const Icon(
                              Icons.local_hospital,
                              color: Color(0xFF8CFF5A),
                              size: 32,
                            ),
                          ),

                          // Signal Nodes
                          ...controller.signals.asMap().entries.map((entry) {
                            final index = entry.key;
                            final signal = entry.value;
                            return Positioned(
                              left: 60.0 + index * 60,
                              top: 380.0 - index * 70,
                              child: _SignalNode(signal: signal),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              
              // Map Overlay Controls
              Positioned(
                bottom: 30,
                right: 30,
                child: Column(
                  children: [
                    _MapActionButton(icon: Icons.add),
                    const SizedBox(height: 10),
                    _MapActionButton(icon: Icons.remove),
                    const SizedBox(height: 10),
                    _MapActionButton(icon: Icons.layers),
                  ],
                ),
              ),

              // Legend
              Positioned(
                top: 20,
                left: 35,
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _LegendItem(color: Colors.red, label: 'Congested'),
                      _LegendItem(color: Colors.orange, label: 'Moderate'),
                      _LegendItem(color: Colors.green, label: 'Smooth'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
      ],
    );
  }
}

class _MapPainter extends CustomPainter {
  final List<dynamic> signals;
  final bool emergencyActive;

  _MapPainter({required this.signals, required this.emergencyActive});

  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..strokeWidth = 24
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final trafficPaint = Paint()
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(60, size.height - 80)
      ..lineTo(size.width * 0.4, size.height * 0.6)
      ..lineTo(size.width * 0.7, size.height * 0.3)
      ..lineTo(size.width - 60, 80);

    canvas.drawPath(path, roadPaint);

    // Draw congestion segments
    for (int i = 0; i < 10; i++) {
      final color = i % 3 == 0 ? Colors.red : (i % 2 == 0 ? Colors.orange : Colors.green);
      trafficPaint.color = color.withOpacity(0.6);
      // Simplified segment drawing
    }

    if (emergencyActive) {
      final highlightPaint = Paint()
        ..color = const Color(0xFF8CFF5A).withOpacity(0.3)
        ..strokeWidth = 30
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;
      canvas.drawPath(path, highlightPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _SignalNode extends StatelessWidget {
  final dynamic signal;
  const _SignalNode({required this.signal});

  @override
  Widget build(BuildContext context) {
    Color color;
    if (signal.load > 80) color = Colors.red;
    else if (signal.load > 50) color = Colors.orange;
    else color = Colors.green;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.black87,
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 2),
            boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 8)],
          ),
          child: Icon(Icons.traffic, size: 14, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          signal.id,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white70),
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white70)),
        ],
      ),
    );
  }
}

class _MapActionButton extends StatelessWidget {
  final IconData icon;
  const _MapActionButton({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xFF0B191F),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white12),
      ),
      child: Icon(icon, size: 20, color: Colors.white70),
    );
  }
}

class _EmergencyPulse extends StatefulWidget {
  const _EmergencyPulse();

  @override
  State<_EmergencyPulse> createState() => _EmergencyPulseState();
}

class _EmergencyPulseState extends State<_EmergencyPulse> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller.drive(CurveTween(curve: Curves.easeInOut)),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.red.withOpacity(0.3), width: 4),
        ),
      ),
    );
  }
}
