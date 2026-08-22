import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/traffic_models.dart';
import '../state/traffic_controller.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_background.dart';

class WireCommandCenterScreen extends StatelessWidget {
  const WireCommandCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<TrafficController>();

    return Scaffold(
      body: NeonBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(18.0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'WIRE COMMAND CENTER',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF18F2FF),
                          ),
                        ),
                        Text(
                          'Anakin Wire Intelligent Intelligence Feed',
                          style: TextStyle(fontSize: 10, color: Colors.white54),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  children: [
                    _sectionHeader('CONNECTED SOURCES'),
                    const SizedBox(height: 12),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _sourceChip('Traffic API', true),
                          _sourceChip('Weather Station', true),
                          _sourceChip('Emergency Webhook', true),
                          _sourceChip('Satellite Feed', false),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    _sectionHeader('LATEST INTELLIGENCE'),
                    const SizedBox(height: 12),
                    ...controller.wireIntelligence.map(
                      (intel) => _intelCard(intel),
                    ),
                    const SizedBox(height: 24),
                    _sectionHeader('ENGINE ACTIONS TRIGGERED'),
                    const SizedBox(height: 12),
                    _actionCard(
                      'Signal Optimization',
                      'Zone 4 priority timing applied',
                      Icons.traffic,
                    ),
                    _actionCard(
                      'Route Recalculation',
                      'Emergency route bypass active',
                      Icons.alt_route,
                    ),
                    const SizedBox(height: 24),
                    _sectionHeader('LIVE STATUS'),
                    const SizedBox(height: 12),
                    GlassCard(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            const CircularProgressIndicator(
                              value: 0.98,
                              color: Color(0xFF18F2FF),
                              strokeWidth: 2,
                            ),
                            const SizedBox(width: 16),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Intelligence Processing Core',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '98.4% Accuracy Rate • Latency 14ms',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.white54,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            _pulseDot(),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.5,
        color: Colors.white38,
      ),
    );
  }

  Widget _sourceChip(String label, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: active
            ? const Color(0xFF18F2FF).withValues(alpha: 0.1)
            : Colors.white10,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: active
              ? const Color(0xFF18F2FF).withValues(alpha: 0.5)
              : Colors.white10,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: active ? const Color(0xFF18F2FF) : Colors.white24,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: active ? const Color(0xFF18F2FF) : Colors.white24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _intelCard(WireIntelligence intel) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: GlassCard(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    intel.source.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF18F2FF),
                    ),
                  ),
                  Text(
                    intel.timestamp,
                    style: const TextStyle(fontSize: 10, color: Colors.white24),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                intel.message,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text(
                    'Risk Level: ',
                    style: TextStyle(fontSize: 10, color: Colors.white38),
                  ),
                  Text(
                    intel.riskLevel,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color:
                          intel.riskLevel == 'High' ||
                              intel.riskLevel == 'Critical'
                          ? Colors.redAccent
                          : Colors.greenAccent,
                    ),
                  ),
                  const Spacer(),
                  const Text(
                    'Powered by Anakin Wire',
                    style: TextStyle(
                      fontSize: 8,
                      color: Colors.white24,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _actionCard(String title, String subtitle, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: GlassCard(
        child: ListTile(
          leading: Icon(icon, color: const Color(0xFF8CFF5A), size: 20),
          title: Text(
            title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          subtitle: Text(
            subtitle,
            style: const TextStyle(fontSize: 12, color: Colors.white54),
          ),
          trailing: const Icon(
            Icons.check_circle,
            color: Color(0xFF8CFF5A),
            size: 16,
          ),
        ),
      ),
    );
  }

  Widget _pulseDot() {
    return Container(
      width: 10,
      height: 10,
      decoration: const BoxDecoration(
        color: Colors.greenAccent,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(color: Colors.greenAccent, blurRadius: 4, spreadRadius: 1),
        ],
      ),
    );
  }
}
