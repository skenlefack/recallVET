import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class HealthEventsScreen extends StatelessWidget {
  const HealthEventsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/farm/health-events',
      title: 'Événements sanitaires',
      emptyIcon: Icons.warning_amber_outlined,
      emptyText: 'Aucun événement',
      itemBuilder: (item) => ItemCard(
        icon: Icons.warning_amber_outlined,
        color: AppTheme.danger,
        title: item['event_type'] ?? 'Événement #${item['id']}',
        subtitle: '${item['farm_name'] ?? ''} — ${item['event_date'] ?? ''}',
        trailingWidget: StatusBadge(
          label: item['status'] == 'resolved' ? 'Résolu' : 'Actif',
          color: item['status'] == 'resolved' ? AppTheme.success : AppTheme.danger,
        ),
      ),
    );
  }
}
