import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class InvoicesScreen extends StatelessWidget {
  const InvoicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/invoices',
      title: 'Factures',
      emptyIcon: Icons.receipt_long_outlined,
      emptyText: 'Aucune facture',
      searchable: true,
      itemBuilder: (item) {
        final status = item['status'] ?? 'draft';
        final statusMap = {'draft': 'Brouillon', 'sent': 'Envoyée', 'paid': 'Payée', 'overdue': 'En retard', 'cancelled': 'Annulée'};
        final colorMap = {'draft': Colors.grey, 'sent': AppTheme.primary, 'paid': AppTheme.success, 'overdue': AppTheme.danger, 'cancelled': Colors.grey};
        return ItemCard(
          icon: Icons.receipt_long_outlined,
          color: AppTheme.warning,
          title: item['invoice_number'] ?? 'Facture #${item['id']}',
          subtitle: '${item['party_name'] ?? ''} — ${item['invoice_date'] ?? ''}',
          trailingWidget: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('${item['total_amount'] ?? 0} XAF', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.primary)),
            const SizedBox(height: 4),
            StatusBadge(label: statusMap[status] ?? status, color: colorMap[status] ?? AppTheme.primary),
          ]),
        );
      },
    );
  }
}
