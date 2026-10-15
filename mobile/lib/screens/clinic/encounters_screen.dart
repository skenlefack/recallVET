import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class EncountersScreen extends StatelessWidget {
  const EncountersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/encounters',
      title: 'Consultations',
      emptyIcon: Icons.medical_services_outlined,
      emptyText: 'Aucune consultation',
      searchable: true,
      itemBuilder: (item) => ItemCard(
        icon: Icons.medical_services_outlined,
        color: AppTheme.primary,
        title: item['animal_name'] ?? 'Consultation #${item['id']}',
        subtitle: '${item['encounter_date'] ?? ''} — ${item['party_name'] ?? ''}',
        trailingWidget: StatusBadge(
          label: item['status'] == 'completed' ? 'Terminée' : 'En cours',
          color: item['status'] == 'completed' ? AppTheme.success : AppTheme.primary,
        ),
      ),
    );
  }
}
