import 'package:flutter/material.dart';

import 'home_screen.dart';
import '../widgets/glass_card.dart';
import '../widgets/neon_background.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NeonBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            children: [
              const SizedBox(height: 60),
              // Hero Branding
              const Center(
                child: Icon(
                  Icons.radar_rounded,
                  color: Color(0xFF18F2FF),
                  size: 80,
                ),
              ),
              const SizedBox(height: 24),
              const Center(
                child: Text(
                  'GREENFLOW AI',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                  ),
                ),
              ),
              const Center(
                child: Text(
                  'Urban Emergency Response Infrastructure',
                  style: TextStyle(
                    color: Color(0xFF18F2FF),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 48),

              // Product Features "Landing Page" style
              const _FeatureItem(
                icon: Icons.auto_graph,
                title: 'AI Traffic Prediction',
                desc: 'Real-time congestion forecasting with 94% confidence.',
              ),
              const _FeatureItem(
                icon: Icons.emergency_share,
                title: 'Dynamic Green Corridors',
                desc: 'Instant signal synchronization for emergency vehicles.',
              ),
              const _FeatureItem(
                icon: Icons.hub,
                title: 'City Digital Twin',
                desc: 'Live network topology mapping powered by Wire.',
              ),

              const SizedBox(height: 48),
              
              GlassCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'COMMAND CENTER ACCESS',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: () => Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (_) => const HomeScreen()),
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF18F2FF),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('ENTER COMMAND CENTER', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () {},
                      child: const Text('Request System Access', style: TextStyle(color: Colors.white38)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              const Center(
                child: Text(
                  'POWERED BY WIRE CONNECTED INTELLIGENCE',
                  style: TextStyle(fontSize: 9, color: Colors.white24, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String desc;
  const _FeatureItem({required this.icon, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF18F2FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: const Color(0xFF18F2FF), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(desc, style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
