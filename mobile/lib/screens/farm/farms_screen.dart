import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class FarmsScreen extends StatelessWidget {
  const FarmsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/farm/farms',
      title: 'Exploitations',
      emptyIcon: Icons.agriculture,
      emptyText: 'Aucune exploitation',
      searchable: true,
      itemBuilder: (item) => ItemCard(
        icon: Icons.agriculture,
        color: AppTheme.success,
        title: item['name'] ?? 'Exploitation #${item['id']}',
        subtitle: '${item['farm_code'] ?? ''} — ${item['owner_name'] ?? ''}',
        trailing: '${item['herd_count'] ?? 0} troupeau(x)',
      ),
    );
  }
}
