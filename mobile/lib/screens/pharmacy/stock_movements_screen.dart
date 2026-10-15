import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class StockMovementsScreen extends StatelessWidget {
  const StockMovementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/pharmacy/stock/movements',
      title: 'Mouvements stock',
      emptyIcon: Icons.swap_horiz,
      emptyText: 'Aucun mouvement',
      itemBuilder: (item) {
        final type = item['movement_type'] ?? '';
        final isIn = type.contains('in') || type.contains('receipt') || type.contains('return');
        return ItemCard(
          icon: isIn ? Icons.arrow_downward : Icons.arrow_upward,
          color: isIn ? AppTheme.success : AppTheme.warning,
          title: item['product_name'] ?? 'Mouvement #${item['id']}',
          subtitle: '${type} — Qté: ${item['quantity'] ?? 0}',
          trailing: item['created_at']?.toString().substring(0, 10),
        );
      },
    );
  }
}
