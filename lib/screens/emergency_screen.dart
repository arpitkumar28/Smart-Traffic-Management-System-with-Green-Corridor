import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Emergency Mode',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(
                Icons.emergency_share,
                color: controller.emergencyActive
                    ? const Color(0xFF8CFF5A)
                    : const Color(0xFFFF7A45),
                size: 76,
              ),
              const SizedBox(height: 16),
              Text(
                controller.emergencyActive
                    ? 'Green Corridor Active'
                    : 'Ambulance Priority Standby',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Vehicle ${controller.emergency.vehicleId} - ETA ${controller.emergency.etaSeconds ~/ 60} min - saved ${controller.emergency.timeSavedSeconds ~/ 60} min',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white60),
              ),
              const SizedBox(height: 22),
              FilledButton.icon(
                onPressed: () =>
                    context.read<TrafficController>().activateEmergencyMode(),
                icon: const Icon(Icons.local_hospital),
                label: const Text('Activate Ambulance Mode'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
