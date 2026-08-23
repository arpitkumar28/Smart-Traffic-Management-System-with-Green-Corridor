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
            'EMERGENCY OPS',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: Color(0xFF00E5FF),
              letterSpacing: 2.0,
            ),
          ),
          const Text(
            'SIGNAL PRIORITY',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -1.0,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'System in high-alert monitoring mode.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.5),
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          Center(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(40),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00E5FF).withValues(alpha: 0.05),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFF00E5FF).withValues(alpha: 0.1),
                    ),
                  ),
                  child: Icon(
                    Icons.security,
                    color: const Color(0xFF00E5FF).withValues(alpha: 0.2),
                    size: 100,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'PROTOCOLS READY',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 4,
                    color: Colors.white24,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed:
                  context.read<TrafficController>().systemStatus ==
                      SystemStatus.live
                  ? () => _showCommandReview(context)
                  : null,
              style: FilledButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 20),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 10,
                shadowColor: Colors.red.withValues(alpha: 0.5),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bolt, size: 24),
                  SizedBox(width: 12),
                  Text(
                    'PREPARE GREEN CORRIDOR',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
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
              icon: const Icon(Icons.auto_graph, size: 20),
              label: const Text(
                'SIMULATE CONGESTION',
                style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF00E5FF),
                side: const BorderSide(color: Color(0xFF00E5FF), width: 1.5),
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

  Future<void> _showCommandReview(BuildContext context) async {
    final controller = context.read<TrafficController>();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('REVIEW COMMAND'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vehicle: ${controller.emergency.vehicleId}'),
            Text('Destination: ${controller.emergency.destination}'),
            Text('Route: ${controller.emergency.route.join(' -> ')}'),
            const SizedBox(height: 12),
            const Text(
              'The backend will confirm whether coordination can be executed.',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('CANCEL'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('CONFIRM COMMAND'),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      await context.read<TrafficController>().activateEmergencyMode();
    }
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
          colors: [Colors.red.withValues(alpha: 0.2), Colors.transparent],
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 40),
          _LivePulsingBadge(),
          const SizedBox(height: 24),
          const Text(
            'SIMULATED CORRIDOR CONFIRMED',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
              color: Color(0xFF00FF9D),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            controller.emergency.vehicleId,
            style: const TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -2,
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
                  value: 'CRITICAL',
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
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: GlassCard(
              padding: const EdgeInsets.all(32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _MiniMetric(
                    label: 'Time Saved',
                    value: '${controller.emergency.timeSavedSeconds ~/ 60}m',
                    icon: Icons.speed,
                  ),
                  _MiniMetric(
                    label: 'Hubs Locked',
                    value: '${controller.signalsOptimized}',
                    icon: Icons.lock_outline,
                  ),
                  _MiniMetric(
                    label: 'Integrity',
                    value: '100%',
                    icon: Icons.verified_user,
                  ),
                ],
              ),
            ),
          ),

          TextButton(
            onPressed: () => controller.deactivateEmergencyMode(),
            child: Text(
              'TERMINATE PROTOCOL',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.3),
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 2,
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
            color: Colors.red.withValues(
              alpha: 0.1 + (_controller.value * 0.2),
            ),
            border: Border.all(
              color: Colors.red.withValues(alpha: 0.5 * _controller.value),
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.red.withValues(alpha: 0.3 * _controller.value),
                blurRadius: 20,
                spreadRadius: 5,
              ),
            ],
          ),
          child: const Icon(Icons.emergency, color: Colors.white, size: 40),
        );
      },
    );
  }
}

class _HeroMetaTile extends StatelessWidget {
  final String label, value;
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
            fontSize: 9,
            letterSpacing: 2,
            color: const Color(0xFF00E5FF),
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}

class _ETADisplay extends StatelessWidget {
  final int before, after;
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
                color: Colors.white.withValues(alpha: 0.2),
                fontWeight: FontWeight.w900,
              ),
            ),
            const Text(
              'ORIGINAL',
              style: TextStyle(
                fontSize: 9,
                color: Colors.white24,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Icon(
            Icons.arrow_forward_rounded,
            color: Color(0xFF00FF9D),
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
                color: Color(0xFF00FF9D),
              ),
            ),
            const Text(
              'OPTIMIZED',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Color(0xFF00FF9D),
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _MiniMetric extends StatelessWidget {
  final String label, value;
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
        Icon(
          icon,
          color: const Color(0xFF00E5FF).withValues(alpha: 0.7),
          size: 20,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 8,
            color: Colors.white.withValues(alpha: 0.4),
            fontWeight: FontWeight.w900,
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
          const SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(
              color: Color(0xFF00E5FF),
              strokeWidth: 6,
            ),
          ),
          const SizedBox(height: 40),
          const Text(
            'SYNCHRONIZING GRID',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
              color: Color(0xFF00E5FF),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _getStageText().toUpperCase(),
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
            ),
            textAlign: TextAlign.center,
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
        return 'Calculating optimal neural path...';
      case EmergencyActivationStage.optimizing:
        return 'Clearing congestion points...';
      case EmergencyActivationStage.synchronizing:
        return 'Locking signal sequence...';
      default:
        return 'Establishing Green Corridor...';
    }
  }
}
