import 'package:flutter/material.dart';
import 'dart:async';

import 'login_screen.dart';
import '../widgets/neon_background.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Timer? _navigationTimer;

  @override
  void initState() {
    super.initState();
    _navigationTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    });
  }

  @override
  void dispose() {
    _navigationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: NeonBackground(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.route, color: Color(0xFF8CFF5A), size: 72),
              SizedBox(height: 18),
              Text(
                'GreenFlow AI Mobile',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
              ),
              SizedBox(height: 8),
              Text(
                'Emergency corridor intelligence',
                style: TextStyle(color: Colors.white60),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
