import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class PrescriptionsScreen extends StatelessWidget {
  const PrescriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/prescriptions',
      title: 'Ordonnances',
      emptyIcon: Icons.description_outlined,
      emptyText: 'Aucune ordonnance',
      itemBuilder: (item) => ItemCard(
        icon: Icons.description_outlined,
        color: AppTheme.primary,
        title: item['animal_name'] ?? 'Ordonnance #${item['id']}',
        subtitle: '${item['prescription_date'] ?? ''} — ${item['party_name'] ?? ''}',
        trailing: item['line_count'] != null ? '${item['line_count']} méd.' : null,
      ),
    );
  }
}
