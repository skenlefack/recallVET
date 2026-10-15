import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class SurgeriesScreen extends StatelessWidget {
  const SurgeriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/surgeries',
      title: 'Chirurgies',
      emptyIcon: Icons.content_cut,
      emptyText: 'Aucune chirurgie',
      itemBuilder: (item) => ItemCard(
        icon: Icons.content_cut,
        color: AppTheme.primaryDark,
        title: item['animal_name'] ?? 'Chirurgie #${item['id']}',
        subtitle: '${item['procedure_name'] ?? item['surgery_type'] ?? ''} — ${item['surgery_date'] ?? ''}',
        trailingWidget: StatusBadge(
          label: item['status'] == 'completed' ? 'Terminée' : item['status'] == 'scheduled' ? 'Programmée' : (item['status'] ?? ''),
          color: item['status'] == 'completed' ? AppTheme.success : AppTheme.warning,
        ),
      ),
    );
  }
}
