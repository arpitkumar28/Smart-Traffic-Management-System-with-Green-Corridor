import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/splash_screen.dart';
import 'state/traffic_controller.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GreenFlowMobileApp());
}

class GreenFlowMobileApp extends StatelessWidget {
  const GreenFlowMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => TrafficController()..startDemo(),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'GreenFlow AI Mobile',
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF030712),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF00E5FF),
            brightness: Brightness.dark,
            primary: const Color(0xFF00E5FF),
            secondary: const Color(0xFF00FF9D),
            surface: const Color(0xFF07171B),
          ),
          useMaterial3: true,
          fontFamily: 'Roboto',
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
