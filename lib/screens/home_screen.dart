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
          NavigationDestination(icon: Icon(Icons.emergency), label: 'SOS'),
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
        const Text(
          'GreenFlow AI',
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        const Text(
          'Live city traffic intelligence',
          style: TextStyle(color: Colors.white60),
        ),
        const SizedBox(height: 18),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.25,
          children: [
            _Metric(label: 'Flow', value: '${controller.networkFlow}%'),
            _Metric(
              label: 'Vehicles/min',
              value: '${controller.vehiclesPerMinute}',
            ),
            _Metric(label: 'Wait', value: '${controller.avgWaitSeconds}s'),
            _Metric(label: 'Signals', value: '${controller.signals.length}'),
          ],
        ),
        const SizedBox(height: 18),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Signal Status',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 12),
              ...controller.signals.map(
                (signal) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      Icon(
                        Icons.traffic,
                        color: signal.mode.name == 'priority'
                            ? const Color(0xFF8CFF5A)
                            : const Color(0xFF18F2FF),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(signal.name)),
                      Text('${signal.load}%'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: Colors.white60)),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: Color(0xFF8CFF5A),
            ),
          ),
        ],
      ),
    );
  }
}
