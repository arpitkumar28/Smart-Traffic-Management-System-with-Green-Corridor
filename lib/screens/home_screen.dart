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
      body: Column(
        children: [
          const _SystemStatusBanner(),
          Expanded(
            child: NeonBackground(
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
          ),
        ],
      ),
    );
  }
}

class _SystemStatusBanner extends StatelessWidget {
  const _SystemStatusBanner();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    final label = switch (controller.systemStatus) {
      SystemStatus.live => 'LIVE CONNECTED',
      SystemStatus.demo => 'SIMULATION - Demo data',
      SystemStatus.stale => 'STALE - Last update is not current',
      SystemStatus.offline => 'OFFLINE - Live data unavailable',
      SystemStatus.connecting => 'CONNECTING',
      SystemStatus.reconnecting => 'RECONNECTING',
    };
    final color = controller.systemStatus == SystemStatus.live
        ? const Color(0xFF00FF9D)
        : Colors.orangeAccent;

    return Material(
      color: const Color(0xFF07171B),
      child: SafeArea(
        bottom: false,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  controller.errorMessage ?? label,
                  style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
              if (controller.systemStatus == SystemStatus.offline ||
                  controller.systemStatus == SystemStatus.stale)
                TextButton(
                  onPressed: controller.refreshFromApi,
                  child: const Text('RETRY'),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// DESKTOP LAYOUT (1024px+)
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
        color: const Color(0xFF030712).withValues(alpha: 0.82),
        border: const Border(bottom: BorderSide(color: Color(0xFF00E5FF), width: 0.5)),
      ),
      child: Row(
        children: [
          const Text(
            'GREENFLOW',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: Color(0xFF00E5FF),
            ),
          ),
          const SizedBox(width: 40),
          _NavStatusItem(
            label: 'CITY STATUS',
            value: controller.emergencyActive ? 'URGENT' : 'STABLE',
            color: controller.emergencyActive
                ? Colors.red
                : const Color(0xFF00FF9D),
          ),
          const SizedBox(width: 28),
          _NavStatusItem(
            label: 'LIVE SOURCES',
            value: '${controller.wireIntelligence.length} STREAMS',
            color: const Color(0xFF00E5FF),
          ),
          const SizedBox(width: 28),
          _NavStatusItem(
            label: 'CONNECTED HUBS',
            value: '14 ACTIVE',
            color: const Color(0xFF00FF9D),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
            decoration: BoxDecoration(
              color: const Color(0xFF00E5FF).withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.2)),
            ),
            child: Row(
              children: const [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFF07171B),
                  child: Icon(Icons.person, size: 18, color: Colors.white70),
                ),
                SizedBox(width: 12),
                Text(
                  'COMMANDER',
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
  final String label, value;
  final Color color;
  const _NavStatusItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.bold, letterSpacing: 1)),
        Row(
          children: [
            Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
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
          const Text('OPS SUMMARY', style: TextStyle(fontSize: 12, letterSpacing: 1, fontWeight: FontWeight.w900, color: Color(0xFF00E5FF))),
          const SizedBox(height: 18),
          _DashboardTag(
            label: 'Status',
            value: controller.emergencyActive ? 'Green Corridor Live' : 'Monitoring',
            accent: controller.emergencyActive ? Colors.redAccent : const Color(0xFF00FF9D),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              _DashboardStat(label: 'Vehicles / min', value: '${controller.vehiclesPerMinute}'),
              const SizedBox(width: 12),
              _DashboardStat(label: 'Active Signals', value: '${controller.activeSignals}'),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _DashboardStat(label: 'Average Delay', value: '${controller.avgWaitSeconds}s'),
              const SizedBox(width: 12),
              _DashboardStat(
                label: 'Responder ETA',
                value: controller.emergencyActive ? '${controller.emergency.etaSeconds ~/ 60}m' : 'N/A',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DashboardTag extends StatelessWidget {
  final String label, value;
  final Color accent;
  const _DashboardTag({required this.label, required this.value, required this.accent});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(color: accent.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(12), border: Border.all(color: accent.withValues(alpha: 0.3))),
          child: Text(value, style: TextStyle(color: accent, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
        const Spacer(),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.white38, letterSpacing: 1, fontWeight: FontWeight.w900)),
      ],
    );
  }
}

class _DashboardStat extends StatelessWidget {
  final String label, value;
  const _DashboardStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.white38, letterSpacing: 1, fontWeight: FontWeight.w900)),
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
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                color: Color(0xFF030712),
              ),
              child: Row(
                children: [
                  const Icon(Icons.map, color: Color(0xFF00E5FF)),
                  const SizedBox(width: 12),
                  const Text('NEON DISTRICT GRID', style: TextStyle(fontSize: 12, letterSpacing: 1, fontWeight: FontWeight.w900, color: Colors.white)),
                  const Spacer(),
                  _StatusBadge(
                    label: controller.emergencyActive ? 'EMERGENCY PROTOCOL' : 'GRID STABLE',
                    color: controller.emergencyActive ? Colors.red : const Color(0xFF00FF9D),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
                child: const LiveMapScreen(isHeroMode: true),
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
      decoration: BoxDecoration(color: color.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(24), border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color, letterSpacing: 1)),
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
              Icon(Icons.bolt, color: Color(0xFF00FF9D), size: 20),
              SizedBox(width: 12),
              Text('GREEN CORRIDOR', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12, color: Color(0xFF00FF9D))),
            ],
          ),
          const SizedBox(height: 18),
          Text(controller.emergencyActive ? 'Ambulance route priority set' : 'System Ready', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: controller.emergencyActive ? 0.9 : 0.0, color: const Color(0xFF00FF9D), backgroundColor: Colors.white10),
          if (controller.emergencyActive) ...[
            const SizedBox(height: 16),
            _InfoRow(label: 'Vehicle', value: controller.emergency.vehicleId),
            const SizedBox(height: 10),
            _InfoRow(label: 'ETA', value: '${controller.emergency.etaSeconds ~/ 60}m ${controller.emergency.etaSeconds % 60}s'),
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('$label:', style: const TextStyle(fontSize: 11, color: Colors.white38, fontWeight: FontWeight.w900)),
        const SizedBox(width: 8),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _AIDecisionCenter extends StatelessWidget {
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
              Icon(Icons.psychology, color: Color(0xFF00E5FF), size: 20),
              SizedBox(width: 12),
              Text('DECISION ENGINE', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12, color: Color(0xFF00E5FF))),
            ],
          ),
          const SizedBox(height: 20),
          Text(controller.aiPrediction, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFF00FF9D).withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF00FF9D).withValues(alpha: 0.2))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('RECOMMENDED ACTION', style: TextStyle(fontSize: 9, color: Color(0xFF00FF9D), fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text(controller.aiAction, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12)),
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
              Icon(Icons.emergency, color: controller.emergencyActive ? Colors.red : Colors.white24, size: 20),
              const SizedBox(width: 12),
              const Text('EMERGENCY STATUS', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12)),
            ],
          ),
          if (controller.emergencyActive) ...[
            const SizedBox(height: 16),
            Text(controller.emergency.vehicleId, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
            const SizedBox(height: 12),
            _EmergencyMetricRow(label: 'Destination', value: controller.emergency.destination),
          ] else
            const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Center(child: Text('Standby Mode', style: TextStyle(color: Colors.white24, fontWeight: FontWeight.w900)))),
        ],
      ),
    );
  }
}

class _EmergencyMetricRow extends StatelessWidget {
  final String label, value;
  const _EmergencyMetricRow({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.w900)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ],
    );
  }
}

class _WireIntelligencePanel extends StatelessWidget {
  const _WireIntelligencePanel();
  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    final latest = controller.wireIntelligence.isNotEmpty ? controller.wireIntelligence.first : null;
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.bolt, color: Color(0xFF00E5FF), size: 20),
              SizedBox(width: 12),
              Text('WIRE INTEL', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12, color: Color(0xFF00E5FF))),
            ],
          ),
          const SizedBox(height: 20),
          if (latest != null) ...[
            Text(latest.message, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Text(latest.source, style: const TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.w900)),
                const Spacer(),
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)), child: Text(latest.riskLevel, style: const TextStyle(fontSize: 9, color: Colors.red, fontWeight: FontWeight.w900))),
              ],
            ),
          ] else
            const Text('Scanning...', style: TextStyle(color: Colors.white24, fontWeight: FontWeight.w900)),
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
          const Text('LIVE EVENT LOG', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12, color: Colors.white)),
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
                      Container(width: 6, height: 6, margin: const EdgeInsets.only(top: 6), decoration: const BoxDecoration(color: Color(0xFF00E5FF), shape: BoxShape.circle)),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(event['message'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text(event['created_at'], style: const TextStyle(fontSize: 9, color: Colors.white30, fontWeight: FontWeight.w900)),
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
        Expanded(child: _BottomMetricTile(label: 'Grid Flow', value: '${controller.networkFlow}%', trend: controller.networkFlowTrend)),
        const SizedBox(width: 16),
        Expanded(child: _BottomMetricTile(label: 'Avg Latency', value: '${controller.avgWaitSeconds}s', trend: controller.waitTrend)),
        const SizedBox(width: 16),
        Expanded(child: _BottomMetricTile(label: 'Efficiency', value: '92%', trend: '+4%')),
        const SizedBox(width: 16),
        Expanded(child: _BottomMetricTile(label: 'CO2 Offset', value: '18%', trend: '+2%')),
      ],
    );
  }
}

class _BottomMetricTile extends StatelessWidget {
  final String label, value, trend;
  const _BottomMetricTile({required this.label, required this.value, required this.trend});
  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
              const SizedBox(width: 8),
              Text(trend, style: const TextStyle(fontSize: 11, color: Color(0xFF00FF9D), fontWeight: FontWeight.w900)),
            ],
          ),
        ],
      ),
    );
  }
}

class _TabletDashboard extends StatelessWidget {
  const _TabletDashboard();
  @override
  Widget build(BuildContext context) { return const Center(child: Text('Tablet Interface Optimizing...')); }
}

/// MOBILE DASHBOARD
class _MobileDashboard extends StatelessWidget {
  final int currentIndex;
  final Function(int) onIndexChanged;
  const _MobileDashboard({required this.currentIndex, required this.onIndexChanged});

  @override
  Widget build(BuildContext context) {
    final screens = [const _MobileDashboardView(), const LiveMapScreen(), const EmergencyScreen(), const NotificationsScreen(), const AnalyticsScreen(), const ProfileScreen()];
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(child: screens[currentIndex]),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFF00E5FF), width: 0.5))),
        child: NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: onIndexChanged,
          backgroundColor: const Color(0xFF030712),
          indicatorColor: const Color(0xFF00E5FF).withValues(alpha: 0.1),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.dashboard_rounded, size: 20), label: 'HUB'),
            NavigationDestination(icon: Icon(Icons.map_rounded, size: 20), label: 'MAP'),
            NavigationDestination(icon: CircleAvatar(backgroundColor: Colors.red, radius: 14, child: Icon(Icons.sos, color: Colors.white, size: 16)), label: 'SOS'),
            NavigationDestination(icon: Icon(Icons.notifications_active_rounded, size: 20), label: 'ALERTS'),
            NavigationDestination(icon: Icon(Icons.bar_chart_rounded, size: 20), label: 'STATS'),
          ],
        ),
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
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          sliver: SliverToBoxAdapter(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('COMMANDER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF00E5FF), letterSpacing: 2)),
                    const Text('NEON DISTRICT', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1)),
                  ],
                ),
                Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFF00E5FF).withValues(alpha: 0.1), shape: BoxShape.circle, border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.2))), child: const Icon(Icons.radar_rounded, color: Color(0xFF00E5FF), size: 24)),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                _QuickStatPill(label: 'GRID STATUS: ${controller.emergencyActive ? "URGENT" : "STABLE"}', color: controller.emergencyActive ? Colors.red : const Color(0xFF00FF9D)),
                const SizedBox(width: 12),
                _QuickStatPill(label: '${controller.wireIntelligence.length} DATA STREAMS', color: const Color(0xFF00E5FF)),
              ],
            ),
          ),
        ),
        const SliverPadding(padding: EdgeInsets.all(24), sliver: SliverToBoxAdapter(child: HeroMap())),
        SliverPadding(padding: const EdgeInsets.symmetric(horizontal: 24), sliver: SliverToBoxAdapter(child: _AIRecCard(controller: controller))),
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
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
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
          Row(
            children: [
              const Icon(Icons.psychology, color: Color(0xFF00FF9D), size: 20),
              const SizedBox(width: 10),
              const Text('DECISION INSIGHTS', style: TextStyle(color: Color(0xFF00FF9D), fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.0)),
            ],
          ),
          const SizedBox(height: 16),
          Text(controller.aiPrediction, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFF00FF9D).withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF00FF9D).withValues(alpha: 0.2))),
            child: Row(
              children: [
                const Icon(Icons.bolt, color: Color(0xFF00FF9D), size: 16),
                const SizedBox(width: 12),
                Expanded(child: Text(controller.aiAction, style: const TextStyle(color: Color(0xFF00FF9D), fontWeight: FontWeight.bold, fontSize: 13))),
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
      height: 220,
      width: double.infinity,
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.2)), boxShadow: [BoxShadow(color: const Color(0xFF00E5FF).withValues(alpha: 0.1), blurRadius: 15)]),
      child: ClipRRect(borderRadius: BorderRadius.circular(24), child: const LiveMapScreen(isHeroMode: true)),
    );
  }
}
