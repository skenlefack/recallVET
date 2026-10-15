import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class VisitsScreen extends StatelessWidget {
  const VisitsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/farm/visits',
      title: 'Visites',
      emptyIcon: Icons.assignment_outlined,
      emptyText: 'Aucune visite',
      itemBuilder: (item) {
        final status = item['status'] ?? 'planned';
        final colorMap = {'planned': AppTheme.warning, 'in_progress': AppTheme.primary, 'completed': AppTheme.success, 'closed': AppTheme.success};
        final labelMap = {'planned': 'Planifiée', 'in_progress': 'En cours', 'completed': 'Terminée', 'closed': 'Clôturée'};
        return ItemCard(
          icon: Icons.assignment_outlined,
          color: AppTheme.primary,
          title: item['farm_name'] ?? 'Visite #${item['id']}',
          subtitle: '${item['visit_date'] ?? ''} — ${item['visit_type'] ?? ''}',
          trailingWidget: StatusBadge(label: labelMap[status] ?? status, color: colorMap[status] ?? AppTheme.primary),
        );
      },
    );
  }
}
