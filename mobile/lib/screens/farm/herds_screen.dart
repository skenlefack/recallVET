import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class HerdsScreen extends StatelessWidget {
  const HerdsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/farm/herds',
      title: 'Troupeaux',
      emptyIcon: Icons.groups,
      emptyText: 'Aucun troupeau',
      itemBuilder: (item) => ItemCard(
        icon: Icons.groups,
        color: AppTheme.accent,
        title: item['name'] ?? 'Troupeau #${item['id']}',
        subtitle: '${item['species_name'] ?? ''} — ${item['farm_name'] ?? ''}',
        trailing: '${item['head_count'] ?? 0} têtes',
      ),
    );
  }
}
