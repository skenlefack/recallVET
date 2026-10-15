import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class VaccinationsScreen extends StatelessWidget {
  const VaccinationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/vaccinations',
      title: 'Vaccinations',
      emptyIcon: Icons.vaccines,
      emptyText: 'Aucune vaccination',
      itemBuilder: (item) => ItemCard(
        icon: Icons.vaccines,
        color: AppTheme.success,
        title: item['animal_name'] ?? 'Vaccination #${item['id']}',
        subtitle: '${item['vaccine_name'] ?? item['vaccine_type_name'] ?? ''} — ${item['vaccination_date'] ?? ''}',
        trailing: item['next_due_date'],
      ),
    );
  }
}
