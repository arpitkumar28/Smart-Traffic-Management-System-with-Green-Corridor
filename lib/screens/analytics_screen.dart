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
          'Analytics',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'AI Insights',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 18),
              _Bar(label: 'Network flow', value: controller.networkFlow),
              _Bar(label: 'Response improvement', value: 38),
              _Bar(label: 'Eco savings', value: 64),
              _Bar(label: 'Congestion risk', value: 72),
            ],
          ),
        ),
      ],
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [Text(label), Text('$value%')],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              minHeight: 10,
              value: value / 100,
              color: const Color(0xFF8CFF5A),
              backgroundColor: Colors.white.withValues(alpha: 0.1),
            ),
          ),
        ],
      ),
    );
  }
}
