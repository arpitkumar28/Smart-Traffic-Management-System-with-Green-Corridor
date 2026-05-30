import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_background.dart';
import 'analytics_screen.dart';
import 'emergency_screen.dart';
import 'live_map_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';
import 'wire_command_center_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int index = 0;

  final screens = const [
    _DashboardView(),
    LiveMapScreen(),
    EmergencyScreen(),
    NotificationsScreen(),
    AnalyticsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NeonBackground(child: SafeArea(child: screens[index])),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.map), label: 'Map'),
          NavigationDestination(
            icon: CircleAvatar(
              backgroundColor: Colors.red,
              radius: 14,
              child: Icon(Icons.sos, color: Colors.white, size: 16),
            ),
            label: 'SOS',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
          NavigationDestination(icon: Icon(Icons.analytics), label: 'Stats'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _DashboardView extends StatelessWidget {
  const _DashboardView();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        // 1. Hero Section - COMMAND CENTER UPGRADE
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '🚑 GREENFLOW AI',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                    color: Color(0xFF18F2FF),
                  ),
                ),
                Text(
                  'Smart City Emergency Response Platform',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
            _GlowingStatusChip(label: 'AI ONLINE', color: Colors.green),
          ],
        ),
        const SizedBox(height: 12),
        
        // Demo Mode Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => controller.startDemo(),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF18F2FF).withOpacity(0.1),
              foregroundColor: const Color(0xFF18F2FF),
              side: const BorderSide(color: Color(0xFF18F2FF)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.play_circle_filled, size: 18),
                SizedBox(width: 8),
                Text('START SMART CITY SIMULATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Status Chips Row
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              const _StatusChip(
                label: 'AI Monitoring',
                value: '24 Traffic Zones',
                icon: Icons.radar,
              ),
              const _StatusChip(
                label: 'Active Signals',
                value: '4 Signals',
                icon: Icons.traffic,
              ),
              _StatusChip(
                label: 'Emergency',
                value: controller.emergencyActive ? '1 Active' : '0 Active',
                icon: Icons.emergency,
                highlight: controller.emergencyActive,
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const Row(
          children: [
            _MiniStatusChip(label: '🟢 SIGNAL NETWORK ONLINE'),
            SizedBox(width: 8),
            _MiniStatusChip(label: '🟢 EMERGENCY NETWORK ACTIVE'),
          ],
        ),

        const SizedBox(height: 24),
        if (controller.emergencyActive) ...[
          _EmergencyBanner(controller: controller),
          const SizedBox(height: 18),
        ],

        // Wire Intelligence Card
        _WireIntelligenceCard(controller: controller),
        const SizedBox(height: 18),

        // 2. Mission Control Dashboard Layout
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.6,
          children: [
            _Metric(
              label: 'Traffic Flow',
              value: '${controller.networkFlow}%',
              trend: controller.networkFlowTrend,
              isPositive: true,
            ),
            _ConfidenceRing(confidence: controller.aiConfidence),
          ],
        ),

        const SizedBox(height: 18),

        const Text(
          'City Digital Twin (Network View)',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white38,
          ),
        ),
        const SizedBox(height: 10),
        _MiniMap(controller: controller),

        const SizedBox(height: 24),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: _AIInsightsCard(controller: controller)),
            const SizedBox(width: 12),
            Expanded(child: _ImpactShortCard(controller: controller)),
          ],
        ),

        const SizedBox(height: 24),
        _LiveEventsFeed(controller: controller),

        // 10. Wire Branding
        const SizedBox(height: 32),
        Center(
          child: Column(
            children: [
              const Text(
                'Connected Intelligence Sources: Traffic, Weather, SOS, Alerts',
                style: TextStyle(fontSize: 10, color: Colors.white24),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Color(0xFF18F2FF),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Powered by Wire',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white54,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 48),
      ],
    );
  }
}

class _WireIntelligenceCard extends StatelessWidget {
  final TrafficController controller;
  const _WireIntelligenceCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    if (controller.wireIntelligence.isEmpty) return const SizedBox.shrink();
    
    final latest = controller.wireIntelligence.first;
    
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const WireCommandCenterScreen()),
        );
      },
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.bolt, color: Color(0xFF18F2FF), size: 18),
                    SizedBox(width: 8),
                    Text(
                      'WIRE INTELLIGENCE',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                        color: Color(0xFF18F2FF),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    latest.riskLevel.toUpperCase(),
                    style: const TextStyle(fontSize: 8, color: Colors.redAccent, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              latest.message,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Text(
                  latest.source,
                  style: const TextStyle(fontSize: 10, color: Colors.white38),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.circle, size: 4, color: Colors.white24),
                const SizedBox(width: 8),
                Text(
                  latest.timestamp,
                  style: const TextStyle(fontSize: 10, color: Colors.white38),
                ),
                const Spacer(),
                const Text(
                  'Powered by Anakin Wire',
                  style: TextStyle(fontSize: 9, color: Colors.white24, fontStyle: FontStyle.italic),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniStatusChip extends StatelessWidget {
  final String label;
  const _MiniStatusChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 8,
          color: Colors.white54,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _GlowingStatusChip extends StatelessWidget {
  final String label;
  final Color color;
  const _GlowingStatusChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.2),
            blurRadius: 4,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool highlight;
  const _StatusChip({
    required this.label,
    required this.value,
    required this.icon,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = highlight ? Colors.redAccent : Colors.white24;
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 14,
            color: highlight ? Colors.redAccent : Colors.white60,
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 9, color: Colors.white38),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: highlight ? Colors.redAccent : Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ImpactShortCard extends StatelessWidget {
  final TrafficController controller;
  const _ImpactShortCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SYSTEM IMPACT',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.white38,
            ),
          ),
          const SizedBox(height: 8),
          _ImpactMiniRow(
            icon: Icons.local_hospital,
            label: 'Assisted',
            value:
                '${controller.analytics['emergencyVehiclesAssisted'] ?? 127}',
          ),
          const SizedBox(height: 4),
          _ImpactMiniRow(
            icon: Icons.traffic,
            label: 'Jams Prevented',
            value: '${controller.analytics['trafficJamsPrevented'] ?? 32}',
          ),
          const SizedBox(height: 4),
          _ImpactMiniRow(
            icon: Icons.eco,
            label: 'CO2 Reduced',
            value: '${controller.analytics['co2_reduction'] ?? 18}%',
          ),
          const SizedBox(height: 4),
          _ImpactMiniRow(
            icon: Icons.timer,
            label: 'Hours Saved',
            value: '${controller.analytics['hoursSaved'] ?? 42}h',
          ),
        ],
      ),
    );
  }
}

class _ImpactMiniRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _ImpactMiniRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 12, color: const Color(0xFF8CFF5A)),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 10, color: Colors.white70),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Color(0xFF8CFF5A),
          ),
        ),
      ],
    );
  }
}

class _EmergencyBanner extends StatefulWidget {
  const _EmergencyBanner({required this.controller});
  final TrafficController controller;

  @override
  State<_EmergencyBanner> createState() => _EmergencyBannerState();
}

class _EmergencyBannerState extends State<_EmergencyBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animController,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFFF3B30), Color(0xFF8E0000)],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.red.withOpacity(
                  0.4 * _animController.value + 0.2,
                ),
                blurRadius: 12 * _animController.value + 4,
                spreadRadius: 2 * _animController.value,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(
              color: Colors.white.withOpacity(0.3 * _animController.value),
              width: 1.5,
            ),
          ),
          child: child,
        );
      },
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.emergency, color: Colors.white, size: 32),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '🚑 GREEN CORRIDOR ACTIVE',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      'Ambulance #${widget.controller.emergency.vehicleId}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${widget.controller.etaBeforeMinutes}m → ${widget.controller.etaAfterMinutes}m',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF8CFF5A),
                    ),
                  ),
                  Text(
                    'Signals optimized: ${widget.controller.signalsOptimized}',
                    style: const TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                ],
              ),
            ],
          ),
          const Divider(color: Colors.white24, height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ROUTE',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white54,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    widget.controller.emergency.route.join(' → '),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'ETA SAVED',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white54,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '${widget.controller.emergency.timeSavedSeconds ~/ 60} min ${widget.controller.emergency.timeSavedSeconds % 60} sec',
                    style: const TextStyle(
                      color: Color(0xFF8CFF5A),
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({
    required this.label,
    required this.value,
    required this.trend,
    required this.isPositive,
  });

  final String label;
  final String value;
  final String trend;
  final bool isPositive;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white60, fontSize: 12),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                isPositive ? Icons.trending_up : Icons.trending_down,
                size: 14,
                color: isPositive ? const Color(0xFF8CFF5A) : Colors.redAccent,
              ),
              const SizedBox(width: 4),
              Text(
                trend,
                style: TextStyle(
                  fontSize: 10,
                  color: isPositive
                      ? const Color(0xFF8CFF5A)
                      : Colors.redAccent,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ConfidenceRing extends StatelessWidget {
  const _ConfidenceRing({required this.confidence});

  final int confidence;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          SizedBox(
            width: 56,
            height: 56,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: confidence / 100,
                  strokeWidth: 6,
                  backgroundColor: Colors.white10,
                  color: const Color(0xFF8CFF5A),
                ),
                Text(
                  '$confidence%',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'AI Confidence',
                  style: TextStyle(color: Colors.white60, fontSize: 12),
                ),
                SizedBox(height: 6),
                Text(
                  'Prediction lock',
                  style: TextStyle(
                    color: Color(0xFF8CFF5A),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniMap extends StatelessWidget {
  const _MiniMap({required this.controller});

  final TrafficController controller;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.zero,
      child: Container(
        height: 200,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(8)),
        child: Stack(
          children: [
            Positioned.fill(
              child: TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: 1),
                duration: const Duration(seconds: 1),
                builder: (context, pulse, _) {
                  return CustomPaint(
                    painter: _HeatmapPainter(
                      emergencyActive: controller.emergencyActive,
                      pulse: pulse,
                    ),
                  );
                },
              ),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.hub_outlined,
                    color: Color(0xFF18F2FF),
                    size: 40,
                  ),
                  const Text(
                    'LIVE NETWORK DIGITAL TWIN',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: Colors.white38,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _MapLegendItem(color: Colors.red, label: 'High'),
                      _MapLegendItem(color: Colors.orange, label: 'Mod'),
                      _MapLegendItem(color: Colors.green, label: 'Smooth'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MapLegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _MapLegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 8, color: Colors.white54),
          ),
        ],
      ),
    );
  }
}

class _HeatmapPainter extends CustomPainter {
  _HeatmapPainter({required this.emergencyActive, required this.pulse});

  final bool emergencyActive;
  final double pulse;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..strokeWidth = 2;
    paint.color = Colors.white.withOpacity(0.05);
    canvas.drawLine(
      Offset(0, size.height * 0.3),
      Offset(size.width, size.height * 0.7),
      paint,
    );
    canvas.drawLine(
      Offset(size.width * 0.2, 0),
      Offset(size.width * 0.8, size.height),
      paint,
    );
    canvas.drawLine(
      Offset(0, size.height * 0.8),
      Offset(size.width, size.height * 0.2),
      paint,
    );

    void drawPoint(Offset offset, Color color, double radius) {
      final gradient = RadialGradient(
        colors: [color.withOpacity(0.3), Colors.transparent],
      ).createShader(Rect.fromCircle(center: offset, radius: radius));
      canvas.drawCircle(offset, radius, Paint()..shader = gradient);
    }

    drawPoint(Offset(size.width * 0.3, size.height * 0.4), Colors.red, 40);
    drawPoint(Offset(size.width * 0.7, size.height * 0.6), Colors.orange, 30);
    drawPoint(Offset(size.width * 0.5, size.height * 0.2), Colors.green, 50);
    drawPoint(Offset(size.width * 0.1, size.height * 0.8), Colors.green, 60);

    if (emergencyActive) {
      final corridor = Paint()
        ..color = const Color(0xFF8CFF5A).withOpacity(0.65)
        ..strokeWidth = 5
        ..strokeCap = StrokeCap.round;
      final start = Offset(size.width * 0.12, size.height * 0.8);
      final end = Offset(size.width * 0.82, size.height * 0.22);
      canvas.drawLine(start, end, corridor);
      final ambulance = Offset(
        start.dx + (end.dx - start.dx) * pulse,
        start.dy + (end.dy - start.dy) * pulse,
      );
      canvas.drawCircle(ambulance, 8, Paint()..color = Colors.white);
      canvas.drawCircle(ambulance, 5, Paint()..color = Colors.redAccent);
    }
  }

  @override
  bool shouldRepaint(covariant _HeatmapPainter oldDelegate) {
    return oldDelegate.emergencyActive != emergencyActive ||
        oldDelegate.pulse != pulse;
  }
}

class _AIInsightsCard extends StatelessWidget {
  const _AIInsightsCard({required this.controller});
  final TrafficController controller;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.psychology, color: Color(0xFF18F2FF), size: 16),
              SizedBox(width: 8),
              Text(
                'AI CORE',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            controller.aiPrediction,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, color: Colors.white70),
          ),
          const SizedBox(height: 8),
          const Text(
            'RECOMMENDED ACTION',
            style: TextStyle(
              fontSize: 8,
              color: Colors.white38,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            controller.aiAction,
            style: const TextStyle(
              color: Color(0xFF8CFF5A),
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

class _LiveEventsFeed extends StatelessWidget {
  const _LiveEventsFeed({required this.controller});
  final TrafficController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Live Event Timeline',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...controller.events.take(5).map((event) {
          final title = event['message'] as String? ?? 'System event';
          final index = controller.events.indexOf(event);
          return _TimelineItem(
            time: event['created_at'] as String? ?? 'live',
            title: title,
            message: _messageForEvent(event['type'] as String? ?? 'system'),
            isLast: index == controller.events.take(5).length - 1,
            icon: _getIconForAlert(title, event['type'] as String? ?? ''),
          );
        }),
      ],
    );
  }

  Widget _getIconForAlert(String title, String type) {
    if (type == 'wire') {
      return const Icon(Icons.bolt, color: Color(0xFF18F2FF), size: 16);
    }
    if (title.contains('Ambulance') ||
        title.contains('Emergency') ||
        title.contains('Corridor')) {
      return const Icon(Icons.emergency, color: Colors.redAccent, size: 16);
    }
    if (title.contains('AI') || title.contains('Congestion')) {
      return const Icon(
        Icons.warning_amber_rounded,
        color: Colors.orangeAccent,
        size: 16,
      );
    }
    return const Icon(Icons.bolt, color: Color(0xFF18F2FF), size: 16);
  }

  String _messageForEvent(String type) {
    return switch (type) {
      'green_corridor' => 'Route signals synchronized in priority mode',
      'analytics' => 'Response and impact metrics updated',
      'emergency' => 'Emergency vehicle feed synchronized',
      'signal' => 'Adaptive signal timing applied',
      'ai' => 'AI prediction engine generated action',
      'wire' => 'Anakin Wire Intelligence data received',
      _ => 'Realtime city event received',
    };
  }
}

class _TimelineItem extends StatelessWidget {
  final String time;
  final String title;
  final String message;
  final Widget icon;
  final bool isLast;

  const _TimelineItem({
    required this.time,
    required this.title,
    required this.message,
    required this.icon,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white12),
                ),
                child: icon,
              ),
              if (!isLast)
                Expanded(child: Container(width: 2, color: Colors.white10)),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      time,
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white24,
                      ),
                    ),
                  ],
                ),
                Text(
                  message,
                  style: const TextStyle(fontSize: 12, color: Colors.white60),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
