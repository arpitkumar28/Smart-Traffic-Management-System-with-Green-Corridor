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
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'GreenFlow AI',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
                ),
                Text(
                  'Live city traffic intelligence',
                  style: TextStyle(color: Colors.white60, fontSize: 12),
                ),
              ],
            ),
            CircleAvatar(
              backgroundColor: Colors.white10,
              child: IconButton(
                icon: const Icon(Icons.person_outline, size: 20),
                onPressed: () {},
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        if (controller.emergencyActive) _EmergencyBanner(controller: controller),
        const SizedBox(height: 18),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: [
            _Metric(
              label: 'Traffic Flow',
              value: '${controller.networkFlow}%',
              trend: controller.networkFlowTrend,
              isPositive: true,
            ),
            _Metric(
              label: 'Vehicles/min',
              value: '${controller.vehiclesPerMinute}',
              trend: controller.vpmTrend,
              isPositive: true,
            ),
            _Metric(
              label: 'Avg. Wait',
              value: '${controller.avgWaitSeconds}s',
              trend: controller.waitTrend,
              isPositive: false,
            ),
            _Metric(
              label: 'Active Signals',
              value: '${controller.signals.length}',
              trend: 'Stable',
              isPositive: true,
            ),
          ],
        ),
        const SizedBox(height: 18),
        const Text(
          'Live City Map',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        const _MiniMap(),
        const SizedBox(height: 18),
        _AIInsightsCard(controller: controller),
        const SizedBox(height: 18),
        _SignalStatusSection(controller: controller),
        const SizedBox(height: 18),
        _LiveEventsFeed(controller: controller),
        const SizedBox(height: 32),
      ],
    );
  }
}

class _EmergencyBanner extends StatelessWidget {
  const _EmergencyBanner({required this.controller});
  final TrafficController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF3B30), Color(0xFF8E0000)],
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.emergency, color: Colors.white, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'GREEN CORRIDOR ACTIVE',
                  style: TextStyle(
                    fontWeight: FontWeight.black,
                    letterSpacing: 1.2,
                  ),
                ),
                Text(
                  'Ambulance #${controller.emergency.vehicleId} • ETA: ${controller.emergency.etaSeconds ~/ 60} min',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
          ),
          const Text(
            'OPTIMIZED',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.greenAccent),
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
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
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
                  color: isPositive ? const Color(0xFF8CFF5A) : Colors.redAccent,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniMap extends StatelessWidget {
  const _MiniMap();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.zero,
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          image: const DecorationImage(
            image: NetworkImage('https://api.placeholder.com/400/200'), // Replace with real map thumbnail or custom paint
            fit: BoxFit.cover,
            opacity: 0.3,
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.map_outlined, color: Color(0xFF18F2FF), size: 32),
              Text('Live Traffic Map View', style: TextStyle(fontSize: 12, color: Colors.white60)),
            ],
          ),
        ),
      ),
    );
  }
}

class _AIInsightsCard extends StatelessWidget {
  const _AIInsightsCard({required this.controller});
  final TrafficController controller;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.psychology, color: Color(0xFF18F2FF), size: 20),
              const SizedBox(width: 8),
              const Text(
                'AI PREDICTION',
                style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Live', style: TextStyle(fontSize: 10, color: Colors.blue)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            controller.aiPrediction,
            style: const TextStyle(fontSize: 14, color: Colors.white),
          ),
          const SizedBox(height: 12),
          const Text(
            'SUGGESTED ACTION',
            style: TextStyle(fontSize: 10, color: Colors.white54, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.bolt, color: Color(0xFF8CFF5A), size: 16),
              const SizedBox(width: 4),
              Text(
                controller.aiAction,
                style: const TextStyle(color: Color(0xFF8CFF5A), fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SignalStatusSection extends StatelessWidget {
  const _SignalStatusSection({required this.controller});
  final TrafficController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Signal Status',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...controller.signals.map((signal) => _SignalItem(signal: signal)),
      ],
    );
  }
}

class _SignalItem extends StatelessWidget {
  const _SignalItem({required this.signal});
  final dynamic signal;

  @override
  Widget build(BuildContext context) {
    Color statusColor;
    String signalText;
    
    switch (signal.mode.name) {
      case 'priority':
        statusColor = const Color(0xFF8CFF5A);
        signalText = 'Green (Priority)';
        break;
      case 'red':
        statusColor = Colors.redAccent;
        signalText = 'Red';
        break;
      case 'yellow':
        statusColor = Colors.orangeAccent;
        signalText = 'Yellow';
        break;
      default:
        statusColor = Colors.greenAccent;
        signalText = 'Green';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: statusColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: statusColor.withOpacity(0.5), blurRadius: 8),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(signal.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('Traffic Load: ${signal.load}%', style: const TextStyle(fontSize: 12, color: Colors.white54)),
                ],
              ),
            ),
            Text(
              signalText,
              style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ],
        ),
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
          'Recent Events',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GlassCard(
          padding: const EdgeInsets.all(0),
          child: Column(
            children: controller.alerts.take(3).map((alert) {
              return ListTile(
                dense: true,
                leading: _getIconForAlert(alert.title),
                title: Text(alert.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                subtitle: Text(alert.message, style: const TextStyle(fontSize: 12, color: Colors.white60)),
                trailing: const Text('Just now', style: TextStyle(fontSize: 10, color: Colors.white38)),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _getIconForAlert(String title) {
    if (title.contains('Emergency') || title.contains('Corridor')) {
      return const Icon(Icons.emergency_outlined, color: Colors.redAccent, size: 20);
    }
    if (title.contains('AI') || title.contains('Congestion')) {
      return const Icon(Icons.warning_amber_rounded, color: Colors.orangeAccent, size: 20);
    }
    return const Icon(Icons.info_outline, color: Color(0xFF18F2FF), size: 20);
  }
}
