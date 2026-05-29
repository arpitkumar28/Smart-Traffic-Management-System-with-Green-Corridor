import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();
    
    if (controller.activationStage != EmergencyActivationStage.none && 
        controller.activationStage != EmergencyActivationStage.active) {
      return _ActivationFlowView(stage: controller.activationStage);
    }

    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Emergency Mode',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        if (!controller.emergencyActive)
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.emergency_share,
                  color: Color(0xFFFF7A45),
                  size: 76,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Ambulance Priority Standby',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'System ready to prioritize emergency vehicles and create dynamic green corridors.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white60),
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
          )
        else
          Column(
            children: [
              _GreenCorridorHero(controller: controller),
              const SizedBox(height: 18),
              _AIDecisionLog(),
            ],
          ),
      ],
    );
  }
}

class _ActivationFlowView extends StatelessWidget {
  final EmergencyActivationStage stage;
  const _ActivationFlowView({required this.stage});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: Color(0xFF8CFF5A)),
          const SizedBox(height: 40),
          const Text(
            'ESTABLISHING GREEN CORRIDOR',
            style: TextStyle(
              fontSize: 18, 
              fontWeight: FontWeight.w900, 
              letterSpacing: 2,
              color: Color(0xFF8CFF5A),
            ),
          ),
          const SizedBox(height: 40),
          _FlowStep(
            label: 'Emergency Detected', 
            isActive: stage.index >= EmergencyActivationStage.detecting.index,
            isCompleted: stage.index > EmergencyActivationStage.detecting.index,
          ),
          _FlowStep(
            label: 'AI Route Analysis', 
            isActive: stage.index >= EmergencyActivationStage.analyzing.index,
            isCompleted: stage.index > EmergencyActivationStage.analyzing.index,
          ),
          _FlowStep(
            label: 'Path Optimization', 
            isActive: stage.index >= EmergencyActivationStage.optimizing.index,
            isCompleted: stage.index > EmergencyActivationStage.optimizing.index,
          ),
          _FlowStep(
            label: 'Signal Synchronization', 
            isActive: stage.index >= EmergencyActivationStage.synchronizing.index,
            isCompleted: stage.index > EmergencyActivationStage.synchronizing.index,
          ),
        ],
      ),
    );
  }
}

class _FlowStep extends StatelessWidget {
  final String label;
  final bool isActive;
  final bool isCompleted;

  const _FlowStep({
    required this.label, 
    required this.isActive, 
    required this.isCompleted
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(
            isCompleted ? Icons.check_circle : Icons.circle_outlined,
            color: isCompleted ? const Color(0xFF8CFF5A) : (isActive ? Colors.white : Colors.white10),
          ),
          const SizedBox(width: 16),
          Text(
            label,
            style: TextStyle(
              fontSize: 16,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              color: isActive ? Colors.white : Colors.white10,
            ),
          ),
          if (isActive && !isCompleted) ...[
            const SizedBox(width: 8),
            const SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ]
        ],
      ),
    );
  }
}

class _GreenCorridorHero extends StatelessWidget {
  final TrafficController controller;
  const _GreenCorridorHero({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0B191F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF8CFF5A).withOpacity(0.5), width: 2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF8CFF5A).withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🚑 GREEN CORRIDOR ACTIVE',
                    style: TextStyle(
                      color: Color(0xFF8CFF5A),
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Text(
                    'Ambulance A-204',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              IconButton(
                onPressed: () => controller.deactivateEmergencyMode(),
                icon: const Icon(Icons.cancel, color: Colors.redAccent),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Destination: City Hospital',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const Divider(height: 32, color: Colors.white10),
          Row(
            children: [
              Expanded(
                child: _Metric(
                  label: 'Current ETA',
                  value: '${controller.emergency.etaSeconds ~/ 60} min',
                  icon: Icons.timer,
                ),
              ),
              Expanded(
                child: _Metric(
                  label: 'Time Saved',
                  value: '${controller.emergency.timeSavedSeconds ~/ 60}m ${controller.emergency.timeSavedSeconds % 60}s',
                  icon: Icons.bolt,
                  color: const Color(0xFF8CFF5A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Signals Updated:',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: controller.emergency.route.map((sig) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF8CFF5A).withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: const Color(0xFF8CFF5A).withOpacity(0.3)),
              ),
              child: Text(
                '✓ $sig',
                style: const TextStyle(color: Color(0xFF8CFF5A), fontWeight: FontWeight.bold, fontSize: 12),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? color;

  const _Metric({required this.label, required this.value, required this.icon, this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: Colors.white60),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
          ],
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: color ?? Colors.white,
          ),
        ),
      ],
    );
  }
}

class _AIDecisionLog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.psychology, color: Color(0xFF18F2FF), size: 20),
              SizedBox(width: 8),
              Text(
                'AI Command Center',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _LogItem(time: '10:28 PM', event: 'Congestion predicted near Civic Center.'),
          _LogItem(time: '10:29 PM', event: 'Signal SIG-03 adjusted +12s.'),
          _LogItem(time: '10:30 PM', event: 'Green Corridor activated.'),
          _LogItem(time: '10:31 PM', event: 'ETA reduced by 3m 24s.', isLast: true),
        ],
      ),
    );
  }
}

class _LogItem extends StatelessWidget {
  final String time;
  final String event;
  final bool isLast;

  const _LogItem({required this.time, required this.event, this.isLast = false});

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Column(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(color: Color(0xFF18F2FF), shape: BoxShape.circle),
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: Colors.white12),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(time, style: const TextStyle(fontSize: 10, color: Colors.white38)),
                Text(event, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
