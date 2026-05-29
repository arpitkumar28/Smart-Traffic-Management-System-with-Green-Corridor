import 'package:flutter/material.dart';

import '../widgets/glass_card.dart';
import 'data_sources_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Text(
          'Profile & Settings',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 18),
        const GlassCard(
          child: ListTile(
            leading: CircleAvatar(child: Icon(Icons.local_hospital)),
            title: Text('Emergency Operator'),
            subtitle: Text('Role: ambulance_priority'),
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            children: [
              SwitchListTile(
                value: true,
                onChanged: (_) {},
                title: const Text('Realtime emergency alerts'),
              ),
              SwitchListTile(
                value: true,
                onChanged: (_) {},
                title: const Text('Eco route suggestions'),
              ),
              SwitchListTile(
                value: true,
                onChanged: (_) {},
                title: const Text('Automatic green corridor sync'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        const Text(
          'Integrations',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        GlassCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: const Icon(Icons.api, color: Color(0xFF18F2FF)),
            title: const Text('Data Sources & APIs'),
            subtitle: const Text('Powered by Wire Protocol'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DataSourcesScreen()),
              );
            },
          ),
        ),
        const SizedBox(height: 32),
        Center(
          child: TextButton(
            onPressed: () {},
            child: const Text('Logout', style: TextStyle(color: Colors.redAccent)),
          ),
        ),
      ],
    );
  }
}
