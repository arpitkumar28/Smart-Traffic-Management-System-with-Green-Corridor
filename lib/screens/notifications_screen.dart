import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final alerts = context.watch<TrafficController>().alerts;
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Notifications',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        ...alerts.map(
          (alert) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  Icons.notifications_active,
                  color: alert.priority > 2
                      ? const Color(0xFFFF7A45)
                      : const Color(0xFF18F2FF),
                ),
                title: Text(alert.title),
                subtitle: Text(alert.message),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
