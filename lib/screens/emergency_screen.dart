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
          'Command Center',
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
        const Text(
          'EMERGENCY RESPONSE UNIT',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Color(0xFF18F2FF),
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 24),
        if (!controller.emergencyActive)
          _StandbyView()
        else
          Column(
            children: [
              _GreenCorridorHero(controller: controller),
              const SizedBox(height: 18),
              _ImpactMetricsGrid(controller: controller),
              const SizedBox(height: 18),
              _AIDecisionLog(),
            ],
          ),
      ],
    );
  }
}

class _StandbyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(Icons.security, color: Color(0xFF18F2FF), size: 80),
          const SizedBox(height: 16),
          const Text(
            'SYSTEM STANDBY',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            'Ready to establish Green Corridors. High-priority vehicle detection active.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white60),
          ),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: () =>
                context.read<TrafficController>().activateEmergencyMode(),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text(
              'MANUAL EMERGENCY TRIGGER',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
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
          const _BrainAnimation(),
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
            isCompleted:
                stage.index > EmergencyActivationStage.optimizing.index,
          ),
          _FlowStep(
            label: 'Signal Synchronization',
            isActive:
                stage.index >= EmergencyActivationStage.synchronizing.index,
            isCompleted:
                stage.index > EmergencyActivationStage.synchronizing.index,
          ),
        ],
      ),
    );
  }
}

class _BrainAnimation extends StatefulWidget {
  const _BrainAnimation();

  @override
  State<_BrainAnimation> createState() => _BrainAnimationState();
}

class _BrainAnimationState extends State<_BrainAnimation>
    with SingleTickerProviderStateMixin {
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
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                const Color(
                  0xFF18F2FF,
                ).withOpacity(0.5 * (1 - _controller.value)),
                Colors.transparent,
              ],
            ),
          ),
          child: const Icon(
            Icons.psychology,
            size: 60,
            color: Color(0xFF18F2FF),
          ),
        );
      },
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
    required this.isCompleted,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(
            isCompleted ? Icons.check_circle : Icons.circle_outlined,
            color: isCompleted
                ? const Color(0xFF8CFF5A)
                : (isActive ? Colors.white : Colors.white10),
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
        border: Border.all(
          color: const Color(0xFF8CFF5A).withOpacity(0.5),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF8CFF5A).withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Column(
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
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                  Text(
                    'VEHICLE: A-204',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              IconButton(
                onPressed: () => controller.deactivateEmergencyMode(),
                icon: const Icon(Icons.cancel, color: Colors.white24),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Progress Visualization
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 140,
                height: 140,
                child: CircularProgressIndicator(
                  value: 0.65,
                  strokeWidth: 10,
                  backgroundColor: Colors.white10,
                  color: const Color(0xFF8CFF5A),
                ),
              ),
              Column(
                children: [
                  const Text(
                    'ETA',
                    style: TextStyle(fontSize: 12, color: Colors.white38),
                  ),
                  Text(
                    '${controller.emergency.etaSeconds ~/ 60}m',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF8CFF5A),
                    ),
                  ),
                  const Text(
                    'REMAINING',
                    style: TextStyle(fontSize: 10, color: Colors.white38),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 32),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _StatusItem(label: 'DESTINATION', value: 'City Hospital'),
              _StatusItem(label: 'PRIORITY', value: 'Level 1 (Critical)'),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatusItem extends StatelessWidget {
  final String label;
  final String value;
  const _StatusItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: Colors.white38,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}

class _ImpactMetricsGrid extends StatelessWidget {
  final TrafficController controller;
  const _ImpactMetricsGrid({required this.controller});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _MetricCard(
          label: 'ETA BEFORE',
          value: '8 Minutes',
          icon: Icons.timer_outlined,
          color: Colors.white54,
        ),
        _MetricCard(
          label: 'ETA AFTER',
          value: '4 Minutes',
          icon: Icons.bolt,
          color: const Color(0xFF8CFF5A),
        ),
        _MetricCard(
          label: 'TIME SAVED',
          value: '4 Minutes',
          icon: Icons.history,
          color: const Color(0xFF8CFF5A),
        ),
        _MetricCard(
          label: 'FLOW OPTIMIZED',
          value: '94%',
          icon: Icons.waves,
          color: const Color(0xFF18F2FF),
        ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: Colors.white38,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
        ],
      ),
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
              Icon(Icons.terminal, color: Color(0xFF18F2FF), size: 20),
              SizedBox(width: 8),
              Text(
                'AI LIVE DECISION LOG',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _LogItem(time: '10:20 PM', event: 'AI detected congestion patterns'),
          _LogItem(
            time: '10:21 PM',
            event: 'Signal optimized for smooth transition',
          ),
          _LogItem(
            time: '10:22 PM',
            event: 'Emergency vehicle detected at SIG-04',
          ),
          _LogItem(
            time: '10:22 PM',
            event: 'Green Corridor activated city-wide',
          ),
          _LogItem(
            time: '10:23 PM',
            event: 'ETA reduced by 4 minutes',
            isLast: true,
          ),
        ],
      ),
    );
  }
}

class _LogItem extends StatelessWidget {
  final String time;
  final String event;
  final bool isLast;

  const _LogItem({
    required this.time,
    required this.event,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Column(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: Color(0xFF18F2FF),
                  shape: BoxShape.circle,
                ),
              ),
              if (!isLast)
                Expanded(child: Container(width: 1, color: Colors.white10)),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      time,
                      style: const TextStyle(
                        fontSize: 9,
                        color: Colors.white24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        event,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
