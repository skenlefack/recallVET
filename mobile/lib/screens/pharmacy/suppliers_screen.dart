import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class SuppliersScreen extends StatelessWidget {
  const SuppliersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/pharmacy/suppliers',
      title: 'Fournisseurs',
      emptyIcon: Icons.local_shipping_outlined,
      emptyText: 'Aucun fournisseur',
      searchable: true,
      itemBuilder: (item) => ItemCard(
        icon: Icons.local_shipping_outlined,
        color: AppTheme.accent,
        title: item['name'] ?? 'Fournisseur #${item['id']}',
        subtitle: '${item['contact_person'] ?? ''} — ${item['phone'] ?? ''}',
        trailing: item['city'],
      ),
    );
  }
}
