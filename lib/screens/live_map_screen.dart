import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({super.key});

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ambulanceController;

  @override
  void initState() {
    super.initState();
    _ambulanceController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat();
  }

  @override
  void dispose() {
    _ambulanceController.dispose();
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
                    child: AnimatedBuilder(
                      animation: _ambulanceController,
                      builder: (context, child) {
                        return CustomPaint(
                          painter: _MapPainter(
                            signals: controller.signals,
                            emergencyActive: controller.emergencyActive,
                            progress: _ambulanceController.value,
                          ),
                          child: Stack(
                            children: [
                              // Pulse effect for emergency
                              if (controller.emergencyActive)
                                const _EmergencyPulse(),
                              
                              // Destination: Hospital
                              const Positioned(
                                right: 40,
                                top: 60,
                                child: _MapMarker(
                                  icon: Icons.local_hospital,
                                  color: Colors.blueAccent,
                                  label: 'City Hospital',
                                ),
                              ),

                              // Moving Ambulance Icon
                              if (controller.emergencyActive)
                                _AmbulanceMarker(progress: _ambulanceController.value),

                              // Signal Nodes
                              ...controller.signals.asMap().entries.map((entry) {
                                final index = entry.key;
                                final signal = entry.value;
                                return Positioned(
                                  left: 60.0 + index * 60,
                                  top: 380.0 - index * 70,
                                  child: _SignalNode(
                                    signal: signal, 
                                    isEmergency: controller.emergencyActive && controller.emergency.route.contains(signal.id)
                                  ),
                                );
                              }),
                            ],
                          ),
                        );
                      },
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
                      if (controller.emergencyActive)
                        _LegendItem(color: const Color(0xFF8CFF5A), label: 'Green Corridor'),
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

class _MapMarker extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;

  const _MapMarker({required this.icon, required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(color: color.withOpacity(0.5), blurRadius: 10, spreadRadius: 2),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.black87,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            label,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

class _AmbulanceMarker extends StatelessWidget {
  final double progress;
  const _AmbulanceMarker({required this.progress});

  @override
  Widget build(BuildContext context) {
    // Basic linear path logic for demo
    double left = 60 + (300 - 60) * progress;
    double top = 380 - (380 - 80) * progress;

    return Positioned(
      left: left - 16,
      top: top - 16,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: const Color(0xFF8CFF5A).withOpacity(0.8), blurRadius: 12, spreadRadius: 4),
          ],
        ),
        child: const Icon(
          Icons.local_hospital,
          color: Colors.red,
          size: 20,
        ),
      ),
    );
  }
}

class _MapPainter extends CustomPainter {
  final List<dynamic> signals;
  final bool emergencyActive;
  final double progress;

  _MapPainter({required this.signals, required this.emergencyActive, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final roadPaint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..strokeWidth = 24
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(60, size.height - 80)
      ..lineTo(size.width * 0.4, size.height * 0.6)
      ..lineTo(size.width * 0.7, size.height * 0.3)
      ..lineTo(size.width - 60, 80);

    canvas.drawPath(path, roadPaint);

    if (emergencyActive) {
      final corridorPaint = Paint()
        ..color = const Color(0xFF8CFF5A).withOpacity(0.15)
        ..strokeWidth = 32
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
      canvas.drawPath(path, corridorPaint);
      
      final activePathPaint = Paint()
        ..color = const Color(0xFF8CFF5A)
        ..strokeWidth = 6
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;
        
      canvas.drawPath(path, activePathPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _SignalNode extends StatefulWidget {
  final dynamic signal;
  final bool isEmergency;
  const _SignalNode({required this.signal, this.isEmergency = false});

  @override
  State<_SignalNode> createState() => _SignalNodeState();
}

class _SignalNodeState extends State<_SignalNode> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    if (widget.isEmergency) _pulseController.repeat(reverse: true);
  }

  @override
  void didUpdateWidget(_SignalNode oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isEmergency && !oldWidget.isEmergency) {
      _pulseController.repeat(reverse: true);
    } else if (!widget.isEmergency && oldWidget.isEmergency) {
      _pulseController.stop();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color color;
    final modeName = widget.signal.mode.toString().split('.').last;
    
    if (modeName == 'priority') color = const Color(0xFF8CFF5A);
    else if (modeName == 'red') color = Colors.redAccent;
    else if (modeName == 'yellow') color = Colors.orangeAccent;
    else color = Colors.greenAccent;

    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        double scale = 1.0 + (_pulseController.value * 0.3 * (widget.isEmergency ? 1 : 0));
        return Transform.scale(
          scale: scale,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.5 + (_pulseController.value * 0.5 * (widget.isEmergency ? 1 : 0))), 
                      blurRadius: 8 + (_pulseController.value * 8 * (widget.isEmergency ? 1 : 0)),
                      spreadRadius: widget.isEmergency ? _pulseController.value * 4 : 0,
                    )
                  ],
                ),
                child: Icon(
                  modeName == 'priority' ? Icons.star : Icons.traffic, 
                  size: 14, 
                  color: color
                ),
              ),
              const SizedBox(height: 4),
              Text(
                widget.signal.id,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white70),
              ),
            ],
          ),
        );
      },
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
          border: Border.all(color: const Color(0xFF8CFF5A).withOpacity(0.2), width: 8),
        ),
      ),
    );
  }
}
