import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class LabRequestsScreen extends StatelessWidget {
  const LabRequestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/lab',
      title: 'Laboratoire',
      emptyIcon: Icons.science_outlined,
      emptyText: 'Aucune demande labo',
      itemBuilder: (item) {
        final status = item['status'] ?? 'pending';
        final statusMap = {'pending': 'En attente', 'in_progress': 'En cours', 'completed': 'Terminé', 'cancelled': 'Annulé'};
        final colorMap = {'pending': AppTheme.warning, 'in_progress': AppTheme.primary, 'completed': AppTheme.success, 'cancelled': AppTheme.danger};
        return ItemCard(
          icon: Icons.science_outlined,
          color: AppTheme.accent,
          title: item['animal_name'] ?? 'Labo #${item['id']}',
          subtitle: '${item['test_type'] ?? item['request_date'] ?? ''} — ${item['party_name'] ?? ''}',
          trailingWidget: StatusBadge(label: statusMap[status] ?? status, color: colorMap[status] ?? AppTheme.primary),
        );
      },
    );
  }
}
