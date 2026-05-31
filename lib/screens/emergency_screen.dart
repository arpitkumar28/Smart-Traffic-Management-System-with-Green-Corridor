import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/traffic_controller.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();

    if (controller.activationStage != EmergencyActivationStage.none &&
        controller.activationStage != EmergencyActivationStage.active) {
      return _ActivationFlowView(stage: controller.activationStage);
    }

    if (controller.emergencyActive) {
      return _ActiveCorridorHero(controller: controller);
    }

    return _EmergencyStandbyView();
  }
}

class _EmergencyStandbyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),
          const Text(
            'Emergency Response',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            'System is monitoring for high-priority signals.',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
          const Spacer(),
          Center(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(40),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.security,
                    color: Colors.white.withOpacity(0.1),
                    size: 100,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'READY FOR ACTION',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                    color: Colors.white24,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () =>
                  context.read<TrafficController>().activateEmergencyMode(),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 20),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.sos, size: 24),
                  SizedBox(width: 12),
                  Text(
                    'TRIGGER GREEN CORRIDOR',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () =>
                  context.read<TrafficController>().simulateCongestionSpike(),
              icon: const Icon(Icons.auto_graph),
              label: const Text(
                'SIMULATE AI CONGESTION ALERT',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF18F2FF),
                side: const BorderSide(color: Color(0xFF18F2FF)),
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _ActiveCorridorHero extends StatelessWidget {
  final TrafficController controller;
  const _ActiveCorridorHero({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.red.withOpacity(0.2), Colors.transparent],
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 40),
          _LivePulsingBadge(),
          const SizedBox(height: 24),
          const Text(
            'GREEN CORRIDOR ACTIVE',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
              color: Color(0xFF8CFF5A),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            controller.emergency.vehicleId,
            style: const TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 40),

          // Destination Info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _HeroMetaTile(
                  label: 'Destination',
                  value: controller.emergency.destination,
                ),
                _HeroMetaTile(
                  label: 'Priority',
                  value: 'Level 1 (Critical)',
                  alignEnd: true,
                ),
              ],
            ),
          ),

          const Spacer(),

          // Immersive ETA Animation
          _ETADisplay(
            before: controller.etaBeforeMinutes,
            after: controller.etaAfterMinutes,
          ),

          const Spacer(),

          // Bottom Stats
          Container(
            padding: const EdgeInsets.all(32),
            margin: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _MiniMetric(
                  label: 'Time Saved',
                  value: '4 min',
                  icon: Icons.speed,
                ),
                _MiniMetric(
                  label: 'Signals Opt.',
                  value: '12',
                  icon: Icons.traffic,
                ),
                _MiniMetric(
                  label: 'Path Integrity',
                  value: '100%',
                  icon: Icons.verified_user,
                ),
              ],
            ),
          ),

          TextButton(
            onPressed: () => controller.deactivateEmergencyMode(),
            child: Text(
              'End Simulation',
              style: TextStyle(
                color: Colors.white.withOpacity(0.3),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _LivePulsingBadge extends StatefulWidget {
  @override
  State<_LivePulsingBadge> createState() => _LivePulsingBadgeState();
}

class _LivePulsingBadgeState extends State<_LivePulsingBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
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
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.red.withOpacity(0.1 + (_controller.value * 0.2)),
            border: Border.all(
              color: Colors.red.withOpacity(0.5 * _controller.value),
              width: 2,
            ),
          ),
          child: const Icon(Icons.emergency, color: Colors.red, size: 40),
        );
      },
    );
  }
}

class _HeroMetaTile extends StatelessWidget {
  final String label;
  final String value;
  final bool alignEnd;
  const _HeroMetaTile({
    required this.label,
    required this.value,
    this.alignEnd = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: alignEnd
          ? CrossAxisAlignment.end
          : CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            letterSpacing: 1,
            color: Colors.white.withOpacity(0.4),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}

class _ETADisplay extends StatelessWidget {
  final int before;
  final int after;
  const _ETADisplay({required this.before, required this.after});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Column(
          children: [
            Text(
              '$before min',
              style: TextStyle(
                fontSize: 24,
                decoration: TextDecoration.lineThrough,
                color: Colors.white.withOpacity(0.2),
              ),
            ),
            const Text(
              'Original',
              style: TextStyle(fontSize: 10, color: Colors.white24),
            ),
          ],
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Icon(
            Icons.arrow_forward_rounded,
            color: Color(0xFF8CFF5A),
            size: 32,
          ),
        ),
        Column(
          children: [
            Text(
              '$after min',
              style: const TextStyle(
                fontSize: 56,
                fontWeight: FontWeight.w900,
                color: Color(0xFF8CFF5A),
              ),
            ),
            const Text(
              'Optimized ETA',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF8CFF5A),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _MiniMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _MiniMetric({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.white38, size: 18),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 9,
            color: Colors.white.withOpacity(0.3),
            fontWeight: FontWeight.bold,
          ),
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
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: Color(0xFF18F2FF)),
          const SizedBox(height: 40),
          const Text(
            'SYNCHRONIZING CITY',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 4,
              color: Color(0xFF18F2FF),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _getStageText(),
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  String _getStageText() {
    switch (stage) {
      case EmergencyActivationStage.detecting:
        return 'Locating nearest emergency unit...';
      case EmergencyActivationStage.analyzing:
        return 'Calculating optimal path...';
      case EmergencyActivationStage.optimizing:
        return 'Clearing congestion points...';
      case EmergencyActivationStage.synchronizing:
        return 'Locking signal sequence...';
      default:
        return 'Establishing Green Corridor...';
    }
  }
}
