import 'package:flutter/material.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_background.dart';

class DataSourcesScreen extends StatelessWidget {
  const DataSourcesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NeonBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Text(
                    'Data Sources',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'Live intelligence feeds powered by Wire Protocol integration.',
                style: TextStyle(color: Colors.white60),
              ),
              const SizedBox(height: 32),
              const _DataSourceTile(
                title: 'City Dashboard',
                status: 'Connected',
                icon: Icons.location_city,
                color: Color(0xFF18F2FF),
              ),
              const _DataSourceTile(
                title: 'Traffic Reports',
                status: 'Connected',
                icon: Icons.traffic,
                color: Color(0xFF8CFF5A),
              ),
              const _DataSourceTile(
                title: 'Weather Feed',
                status: 'Syncing',
                icon: Icons.cloud_queue,
                color: Colors.orangeAccent,
              ),
              const _DataSourceTile(
                title: 'Emergency Feed',
                status: 'Priority',
                icon: Icons.emergency,
                color: Colors.redAccent,
              ),
              const _DataSourceTile(
                title: 'Road Conditions',
                status: 'Connected',
                icon: Icons.add_road,
                color: Colors.blueAccent,
              ),
              const SizedBox(height: 48),
              Center(
                child: Column(
                  children: [
                    Container(
                      height: 40,
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(
                            0xFF18F2FF,
                          ).withValues(alpha: 0.35),
                        ),
                        color: const Color(0xFF18F2FF).withValues(alpha: 0.08),
                      ),
                      child: const Center(
                        child: Text(
                          'WIRE',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 4,
                            color: Color(0xFF18F2FF),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Powered by Wire APIs',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white38,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DataSourceTile extends StatelessWidget {
  final String title;
  final String status;
  final IconData icon;
  final Color color;

  const _DataSourceTile({
    required this.title,
    required this.status,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        status,
                        style: TextStyle(
                          fontSize: 12,
                          color: color.withOpacity(0.8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.check_circle_outline,
              color: Colors.white24,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
