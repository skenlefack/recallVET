import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class SalesScreen extends StatelessWidget {
  const SalesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/pharmacy/sales',
      title: 'Ventes',
      emptyIcon: Icons.point_of_sale,
      emptyText: 'Aucune vente',
      itemBuilder: (item) => ItemCard(
        icon: Icons.point_of_sale,
        color: AppTheme.success,
        title: item['sale_number'] ?? 'Vente #${item['id']}',
        subtitle: '${item['party_name'] ?? 'Comptoir'} — ${item['sale_date'] ?? ''}',
        trailingWidget: Text('${item['total_amount'] ?? 0} XAF',
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.primary)),
      ),
    );
  }
}
