import 'package:flutter/material.dart';
import 'dart:async';
import '../models/traffic_models.dart';
import '../services/api_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_background.dart';

class DataSourcesScreen extends StatefulWidget {
  const DataSourcesScreen({super.key});

  @override
  State<DataSourcesScreen> createState() => _DataSourcesScreenState();
}

class _DataSourcesScreenState extends State<DataSourcesScreen> {
  final ApiService _api = ApiService();
  List<IoTNode> _nodes = [];
  StreamSubscription<Map<String, dynamic>>? _updates;

  @override
  void initState() {
    super.initState();
    _loadNodes();
    _updates = _api.updateStream.listen(_applyUpdate);
  }

  void _applyUpdate(Map<String, dynamic> message) {
    if (message['type'] != 'IOT_NODE_UPDATE') return;
    final payload = message['payload'];
    if (payload is! Map<String, dynamic>) return;
    final nodeId = payload['nodeId'];
    if (nodeId is! String || !mounted) return;
    setState(() {
      _nodes = _nodes.map((node) => node.nodeId == nodeId ? node.copyWith(
        status: payload['status'] as String?,
        vehicleCount: payload['vehicleCount'] as int?,
        queueLengthMeters: payload['queueLengthMeters'] as int?,
        signalState: payload['signalState'] as String?,
        lastUpdated: DateTime.tryParse(payload['lastUpdated'] as String? ?? ''),
      ) : node).toList();
    });
  }

  @override
  void dispose() {
    _updates?.cancel();
    super.dispose();
  }

  Future<void> _loadNodes() async {
    try {
      final nodes = (await _api.getIoTNodes()).whereType<Map<String, dynamic>>().map(IoTNode.fromJson).toList();
      if (mounted) setState(() => _nodes = nodes);
    } catch (_) {}
  }

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
              const SizedBox(height: 24),
              const Text('VIRTUAL IoT NETWORK', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF18F2FF))),
              const SizedBox(height: 6),
              const Text('SIMULATION ONLY · Physical hardware is not connected.', style: TextStyle(color: Colors.white60)),
              const SizedBox(height: 12),
              ..._nodes.map((node) => _VirtualNodeTile(node: node)),
              const SizedBox(height: 20),
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

class _VirtualNodeTile extends StatelessWidget {
  const _VirtualNodeTile({required this.node});
  final IoTNode node;

  @override
  Widget build(BuildContext context) {
    final color = node.status == 'ONLINE'
        ? Colors.greenAccent
        : node.status == 'OFFLINE'
            ? Colors.redAccent
            : Colors.orangeAccent;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Icon(Icons.memory, color: color),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(node.nodeId, style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text('${node.mode} · ${node.status}', style: TextStyle(color: color, fontSize: 12)),
                  Text('${node.vehicleCount} vehicles · ${node.queueLengthMeters} m queue · ${node.signalState}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            Text('${node.lastUpdated.hour.toString().padLeft(2, '0')}:${node.lastUpdated.minute.toString().padLeft(2, '0')}', style: const TextStyle(color: Colors.white54, fontSize: 11)),
          ],
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
                color: color.withValues(alpha: 0.1),
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
                          color: color.withValues(alpha: 0.8),
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
