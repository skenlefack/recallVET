import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';

class StockScreen extends StatefulWidget {
  const StockScreen({super.key});

  @override
  State<StockScreen> createState() => _StockScreenState();
}

class _StockScreenState extends State<StockScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _levels = [];
  Map<String, dynamic>? _alerts;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    final results = await Future.wait([
      _api.get('/v1/pharmacy/stock/levels'),
      _api.get('/v1/analytics/stock-alerts'),
    ]);
    setState(() {
      if (results[0]['success'] == true) _levels = results[0]['data'] ?? [];
      if (results[1]['success'] == true) _alerts = results[1]['data'];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Stock')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load, color: AppTheme.primary,
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  // Alerts summary
                  if (_alerts != null && ((_alerts!['below_reorder'] as List?)?.isNotEmpty == true || (_alerts!['expiring_soon'] as List?)?.isNotEmpty == true))
                    Container(
                      padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(color: AppTheme.danger.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.danger.withValues(alpha: 0.2))),
                      child: Row(children: [
                        const Icon(Icons.warning_amber, color: AppTheme.danger),
                        const SizedBox(width: 12),
                        Expanded(child: Text(
                          '${(_alerts!['below_reorder'] as List?)?.length ?? 0} produit(s) sous le seuil, '
                          '${(_alerts!['expiring_soon'] as List?)?.length ?? 0} lot(s) bientôt périmé(s)',
                          style: const TextStyle(fontSize: 13, color: AppTheme.danger),
                        )),
                      ]),
                    ),
                  // Stock levels
                  ..._levels.map((p) {
                    final onHand = p['total_on_hand'] ?? 0;
                    final reorder = p['reorder_level'] ?? 0;
                    final isLow = reorder > 0 && onHand < reorder;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: isLow ? AppTheme.danger.withValues(alpha: 0.3) : Colors.grey.shade100),
                      ),
                      child: Row(children: [
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: (isLow ? AppTheme.danger : AppTheme.primary).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.inventory_2_outlined, color: isLow ? AppTheme.danger : AppTheme.primary, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(p['product_name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          Text('SKU: ${p['sku'] ?? ''}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                        ])),
                        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                          Text('$onHand ${p['unit'] ?? ''}', style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 15, color: isLow ? AppTheme.danger : AppTheme.primary)),
                          if (reorder > 0)
                            Text('seuil: $reorder', style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                        ]),
                      ]),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
