import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await _api.get('/v1/pharmacy/products?limit=50');
    if (res['success'] == true) {
      setState(() { _products = res['data'] ?? []; _loading = false; });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_products.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.medication, size: 64, color: Colors.grey[300]),
        const SizedBox(height: 12),
        Text('Aucun produit', style: TextStyle(color: Colors.grey[500])),
      ]));
    }

    return RefreshIndicator(
      onRefresh: _load, color: AppTheme.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _products.length,
        itemBuilder: (ctx, i) {
          final p = _products[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade100),
            ),
            child: Row(children: [
              Container(
                width: 46, height: 46,
                decoration: BoxDecoration(
                  color: AppTheme.accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: const Icon(Icons.medication, color: AppTheme.primary, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(p['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 3),
                Text(p['sku'] ?? '', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${p['selling_price'] ?? 0} XAF',
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.primary),
                ),
              ),
            ]),
          );
        },
      ),
    );
  }
}
