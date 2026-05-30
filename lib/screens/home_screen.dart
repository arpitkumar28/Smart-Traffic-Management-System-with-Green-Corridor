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

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NeonBackground(
        child: LayoutBuilder(
          builder: (context, constraints) {
            if (constraints.maxWidth > 1024) {
              return const _DesktopDashboard();
            } else if (constraints.maxWidth > 600) {
              return const _TabletDashboard();
            } else {
              return _MobileDashboard(
                currentIndex: index,
                onIndexChanged: (i) => setState(() => index = i),
              );
            }
          },
        ),
      ),
    );
  }
}

/// DESKTOP LAYOUT (1024px+)
/// Inspired by Tesla Command Center & Uber Operations
class _DesktopDashboard extends StatelessWidget {
  const _DesktopDashboard();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();

    return Column(
      children: [
        const _DesktopNavbar(),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 320,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _DashboardSummaryCard(controller: controller),
                      const SizedBox(height: 20),
                      _AIDecisionCenter(),
                      const SizedBox(height: 20),
                      _EmergencyStatusCard(controller: controller),
                      const SizedBox(height: 20),
                      _GreenCorridorCard(controller: controller),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  flex: 5,
                  child: Column(
                    children: [
                      _MapHeroCard(controller: controller),
                      const SizedBox(height: 24),
                      const _BottomMetricsPanel(),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                SizedBox(
                  width: 360,
                  child: Column(
                    children: [
                      const _WireIntelligencePanel(),
                      const SizedBox(height: 20),
                      Expanded(
                        child: _LiveTimelinePanel(controller: controller),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _DesktopNavbar extends StatelessWidget {
  const _DesktopNavbar();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return Container(
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 32),
      decoration: BoxDecoration(
        color: const Color(0xFF07131F).withOpacity(0.82),
        border: const Border(bottom: BorderSide(color: Colors.white10)),
      ),
      child: Row(
        children: [
          const Text(
            'GREENFLOW AI',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: Color(0xFF18F2FF),
            ),
          ),
          const SizedBox(width: 40),
          _NavStatusItem(
            label: 'CITY STATUS',
            value: controller.emergencyActive ? 'URGENT' : 'STABLE',
            color: controller.emergencyActive
                ? Colors.red
                : const Color(0xFF8CFF5A),
          ),
          const SizedBox(width: 28),
          _NavStatusItem(
            label: 'LIVE SOURCES',
            value: '${controller.wireIntelligence.length} STREAMS',
            color: const Color(0xFF18F2FF),
          ),
          const SizedBox(width: 28),
          _NavStatusItem(
            label: 'CONNECTED HUBS',
            value: '14 ACTIVE',
            color: const Color(0xFF8CFF5A),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Row(
              children: const [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFF0B191F),
                  child: Icon(Icons.person, size: 18, color: Colors.white70),
                ),
                SizedBox(width: 12),
                Text(
                  'Arpit K.',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
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

class _NavStatusItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _NavStatusItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 9,
            color: Colors.white38,
            fontWeight: FontWeight.bold,
            letterSpacing: 1,
          ),
        ),
        Row(
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 8),
            Text(
              value,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ],
    );
  }
}

class _DashboardSummaryCard extends StatelessWidget {
  final TrafficController controller;
  const _DashboardSummaryCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'OPS SUMMARY',
            style: TextStyle(
              fontSize: 12,
              letterSpacing: 1,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 18),
          _DashboardTag(
            label: 'Status',
            value: controller.emergencyActive
                ? 'Green Corridor Live'
                : 'Monitoring',
            accent: controller.emergencyActive
                ? Colors.redAccent
                : const Color(0xFF8CFF5A),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              _DashboardStat(
                label: 'Vehicles / min',
                value: '${controller.vehiclesPerMinute}',
              ),
              const SizedBox(width: 12),
              _DashboardStat(
                label: 'Active Signals',
                value: '${controller.activeSignals}',
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _DashboardStat(
                label: 'Average Delay',
                value: '${controller.avgWaitSeconds}s',
              ),
              const SizedBox(width: 12),
              _DashboardStat(
                label: 'Responder ETA',
                value: controller.emergencyActive
                    ? '${controller.emergency.etaSeconds ~/ 60}m'
                    : 'N/A',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DashboardTag extends StatelessWidget {
  final String label;
  final String value;
  final Color accent;
  const _DashboardTag({
    required this.label,
    required this.value,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: accent.withOpacity(0.16),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            value,
            style: TextStyle(color: accent, fontWeight: FontWeight.bold),
          ),
        ),
        const Spacer(),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: Colors.white38,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }
}

class _DashboardStat extends StatelessWidget {
  final String label;
  final String value;
  const _DashboardStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              color: Colors.white38,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}

class _MapHeroCard extends StatelessWidget {
  final TrafficController controller;
  const _MapHeroCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GlassCard(
        padding: const EdgeInsets.all(0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                color: Color(0xFF07131F),
              ),
              child: Row(
                children: [
                  const Icon(Icons.map, color: Color(0xFF18F2FF)),
                  const SizedBox(width: 12),
                  const Text(
                    'CITY OPERATIONS MAP',
                    style: TextStyle(
                      fontSize: 12,
                      letterSpacing: 1,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  _StatusBadge(
                    label: controller.emergencyActive
                        ? 'GREEN CORRIDOR'
                        : 'MONITORING',
                    color: controller.emergencyActive
                        ? const Color(0xFF8CFF5A)
                        : Colors.white30,
                  ),
                ],
              ),
            ),
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(18),
                ),
                child: const LiveMapScreen(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.16),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }
}

class _GreenCorridorCard extends StatelessWidget {
  final TrafficController controller;
  const _GreenCorridorCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.bolt, color: Color(0xFF8CFF5A), size: 20),
              SizedBox(width: 12),
              Text(
                'GREEN CORRIDOR',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            controller.emergencyActive
                ? 'Ambulance route is clear'
                : 'No active corridor',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: controller.emergencyActive ? 0.9 : 0.0,
            color: const Color(0xFF8CFF5A),
            backgroundColor: Colors.white10,
          ),
          const SizedBox(height: 16),
          if (controller.emergencyActive) ...[
            _InfoRow(label: 'Vehicle', value: controller.emergency.vehicleId),
            const SizedBox(height: 10),
            _InfoRow(
              label: 'ETA',
              value:
                  '${controller.emergency.etaSeconds ~/ 60}m ${controller.emergency.etaSeconds % 60}s',
            ),
            const SizedBox(height: 10),
            _InfoRow(label: 'Route Load', value: 'Low'),
          ] else
            const Text(
              'Awaiting next corridor activation based on traffic demand and emergency priority.',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          '$label:',
          style: const TextStyle(fontSize: 11, color: Colors.white38),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

class _AIDecisionCenter extends StatelessWidget {
  const _AIDecisionCenter();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.psychology, color: Color(0xFF18F2FF), size: 20),
              SizedBox(width: 12),
              Text(
                'AI DECISION CENTER',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            controller.aiPrediction,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF8CFF5A).withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFF8CFF5A).withOpacity(0.1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'RECOMMENDED ACTION',
                  style: TextStyle(
                    fontSize: 9,
                    color: Color(0xFF8CFF5A),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  controller.aiAction,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
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

class _EmergencyStatusCard extends StatelessWidget {
  final TrafficController controller;
  const _EmergencyStatusCard({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.emergency,
                color: controller.emergencyActive ? Colors.red : Colors.white24,
                size: 20,
              ),
              const SizedBox(width: 12),
              const Text(
                'EMERGENCY STATUS',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (controller.emergencyActive) ...[
            const Text(
              'GREEN CORRIDOR ACTIVE',
              style: TextStyle(
                color: Color(0xFF8CFF5A),
                fontWeight: FontWeight.w900,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              controller.emergency.vehicleId,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            _EmergencyMetricRow(
              label: 'Destination',
              value: controller.emergency.destination,
            ),
            const SizedBox(height: 12),
            _EmergencyMetricRow(
              label: 'ETA Remaining',
              value:
                  '${controller.emergency.etaSeconds ~/ 60}m ${controller.emergency.etaSeconds % 60}s',
            ),
          ] else
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Text(
                  'No active emergencies',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.2),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _EmergencyMetricRow extends StatelessWidget {
  final String label;
  final String value;
  const _EmergencyMetricRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 9,
            color: Colors.white38,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _WireIntelligencePanel extends StatelessWidget {
  const _WireIntelligencePanel();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    final latest = controller.wireIntelligence.isNotEmpty
        ? controller.wireIntelligence.first
        : null;

    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.bolt, color: Color(0xFF18F2FF), size: 20),
              SizedBox(width: 12),
              Text(
                'WIRE INTELLIGENCE',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (latest != null) ...[
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
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    latest.riskLevel,
                    style: const TextStyle(
                      fontSize: 9,
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ] else
            const Text(
              'Scanning for intelligence...',
              style: TextStyle(color: Colors.white24),
            ),
        ],
      ),
    );
  }
}

class _LiveTimelinePanel extends StatelessWidget {
  final TrafficController controller;
  const _LiveTimelinePanel({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'LIVE EVENT TIMELINE',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: ListView.builder(
              itemCount: controller.events.length,
              itemBuilder: (context, i) {
                final event = controller.events[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.only(top: 4),
                        decoration: const BoxDecoration(
                          color: Color(0xFF18F2FF),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              event['message'],
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              event['created_at'],
                              style: const TextStyle(
                                fontSize: 10,
                                color: Colors.white30,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomMetricsPanel extends StatelessWidget {
  const _BottomMetricsPanel();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return Row(
      children: [
        Expanded(
          child: _BottomMetricTile(
            label: 'Traffic Flow',
            value: '${controller.networkFlow}%',
            trend: controller.networkFlowTrend,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _BottomMetricTile(
            label: 'Avg. Wait',
            value: '${controller.avgWaitSeconds}s',
            trend: controller.waitTrend,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _BottomMetricTile(
            label: 'Emergency Response',
            value: '92%',
            trend: '+4%',
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _BottomMetricTile(
            label: 'CO2 Reduction',
            value: '18%',
            trend: '+2%',
          ),
        ),
      ],
    );
  }
}

class _BottomMetricTile extends StatelessWidget {
  final String label;
  final String value;
  final String trend;
  const _BottomMetricTile({
    required this.label,
    required this.value,
    required this.trend,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              color: Colors.white38,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                trend,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF8CFF5A),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// TABLET LAYOUT
class _TabletDashboard extends StatelessWidget {
  const _TabletDashboard();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Tablet View Under Construction'));
  }
}

/// MOBILE LAYOUT
class _MobileDashboard extends StatelessWidget {
  final int currentIndex;
  final Function(int) onIndexChanged;

  const _MobileDashboard({
    required this.currentIndex,
    required this.onIndexChanged,
  });

  @override
  Widget build(BuildContext context) {
    final screens = [
      const _MobileDashboardView(),
      const LiveMapScreen(),
      const EmergencyScreen(),
      const NotificationsScreen(),
      const AnalyticsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(child: screens[currentIndex]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: onIndexChanged,
        backgroundColor: const Color(0xFF07131F),
        indicatorColor: const Color(0xFF18F2FF).withOpacity(0.1),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            label: 'Home',
          ),
          NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Map'),
          NavigationDestination(
            icon: CircleAvatar(
              backgroundColor: Colors.red,
              radius: 14,
              child: Icon(Icons.sos, color: Colors.white, size: 16),
            ),
            label: 'SOS',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_outlined),
            label: 'Alerts',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            label: 'Stats',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _MobileDashboardView extends StatelessWidget {
  const _MobileDashboardView();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
          sliver: SliverToBoxAdapter(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Good Evening, Arpit 👋',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'City Status: ${controller.emergencyActive ? "Urgent" : "Stable"}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const CircleAvatar(
                  backgroundColor: Colors.white10,
                  child: Icon(Icons.search, color: Colors.white70),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: [
                _QuickStatPill(
                  label: '${controller.alerts.length} Congestion Alerts',
                  color: Colors.orange,
                ),
                const SizedBox(width: 12),
                _QuickStatPill(
                  label: controller.emergencyActive
                      ? '1 Emergency Active'
                      : '0 Emergency',
                  color: controller.emergencyActive ? Colors.red : Colors.blue,
                ),
              ],
            ),
          ),
        ),
        const SliverPadding(
          padding: EdgeInsets.all(20),
          sliver: SliverToBoxAdapter(child: HeroMap()),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverToBoxAdapter(child: _AIRecCard(controller: controller)),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 40)),
      ],
    );
  }
}

class _QuickStatPill extends StatelessWidget {
  final String label;
  final Color color;
  const _QuickStatPill({required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _AIRecCard extends StatelessWidget {
  final TrafficController controller;
  const _AIRecCard({required this.controller});
  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.error_outline, color: Colors.orange, size: 20),
              SizedBox(width: 8),
              Text(
                '🚨 Attention Required',
                style: TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            controller.aiPrediction,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.auto_awesome,
                  color: Color(0xFF8CFF5A),
                  size: 16,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    controller.aiAction,
                    style: const TextStyle(
                      color: Color(0xFF8CFF5A),
                      fontWeight: FontWeight.bold,
                    ),
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

class HeroMap extends StatelessWidget {
  const HeroMap({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 240,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: const Color(0xFF0B191F),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: LiveMapScreen(),
      ),
    );
  }
}
