import 'package:flutter_test/flutter_test.dart';
import 'package:smart_traffic_management_system_with_green_corridor/main.dart';

void main() {
  testWidgets('GreenFlow Mobile starts on splash screen', (tester) async {
    await tester.pumpWidget(const GreenFlowMobileApp());

    expect(find.text('GreenFlow Mobile'), findsOneWidget);
    expect(find.text('Emergency corridor intelligence'), findsOneWidget);
  });
}
