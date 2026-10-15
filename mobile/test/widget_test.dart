import 'package:flutter_test/flutter_test.dart';
import 'package:recallvet_mobile/main.dart';

void main() {
  testWidgets('App starts and shows loading', (WidgetTester tester) async {
    await tester.pumpWidget(const RecallVetApp());
    expect(find.byType(RecallVetApp), findsOneWidget);
  });
}
