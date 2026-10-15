import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../config/theme.dart';

/// Generic list screen that fetches data from an API endpoint.
/// Supports pull-to-refresh, search, empty state, and custom item builder.
class ApiListScreen extends StatefulWidget {
  final String endpoint;
  final String title;
  final IconData emptyIcon;
  final String emptyText;
  final bool searchable;
  final Widget Function(Map<String, dynamic> item) itemBuilder;
  final VoidCallback? onFabPressed;
  final String? fabLabel;

  const ApiListScreen({
    super.key,
    required this.endpoint,
    required this.title,
    required this.itemBuilder,
    this.emptyIcon = Icons.inbox_outlined,
    this.emptyText = 'Aucun élément',
    this.searchable = false,
    this.onFabPressed,
    this.fabLabel,
  });

  @override
  State<ApiListScreen> createState() => _ApiListScreenState();
}

class _ApiListScreenState extends State<ApiListScreen> {
  final ApiService _api = ApiService();
  final TextEditingController _searchCtrl = TextEditingController();
  List<dynamic> _items = [];
  bool _loading = true;
  int _total = 0;

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  Future<void> _load([String? search]) async {
    setState(() => _loading = true);
    String url = '${widget.endpoint}?limit=50';
    if (search != null && search.isNotEmpty) url += '&search=$search';
    final res = await _api.get(url);
    if (res['success'] == true) {
      setState(() {
        _items = res['data'] ?? [];
        _total = res['pagination']?['total'] ?? _items.length;
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          if (_total > 0)
            Center(child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                child: Text('$_total', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            )),
        ],
      ),
      body: Column(children: [
        if (widget.searchable)
          Container(
            margin: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)]),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Rechercher...', hintStyle: TextStyle(color: Colors.grey[400]),
                prefixIcon: const Icon(Icons.search, color: AppTheme.primary),
                border: InputBorder.none, contentPadding: const EdgeInsets.symmetric(vertical: 14),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear, size: 20), onPressed: () { _searchCtrl.clear(); _load(); })
                    : null,
              ),
              onSubmitted: _load,
              onChanged: (v) => setState(() {}),
            ),
          ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _items.isEmpty
                  ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(widget.emptyIcon, size: 64, color: Colors.grey[300]),
                      const SizedBox(height: 12),
                      Text(widget.emptyText, style: TextStyle(color: Colors.grey[500], fontSize: 16)),
                    ]))
                  : RefreshIndicator(
                      onRefresh: () => _load(_searchCtrl.text), color: AppTheme.primary,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: _items.length,
                        itemBuilder: (ctx, i) => widget.itemBuilder(_items[i] as Map<String, dynamic>),
                      ),
                    ),
        ),
      ]),
      floatingActionButton: widget.onFabPressed != null
          ? FloatingActionButton.extended(
              onPressed: widget.onFabPressed,
              icon: const Icon(Icons.add),
              label: Text(widget.fabLabel ?? 'Ajouter'),
            )
          : null,
    );
  }
}

/// Reusable list tile for items
class ItemCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String? trailing;
  final Widget? trailingWidget;
  final VoidCallback? onTap;

  const ItemCard({
    super.key, required this.icon, required this.color,
    required this.title, required this.subtitle,
    this.trailing, this.trailingWidget, this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 3),
            Text(subtitle, style: TextStyle(color: Colors.grey[500], fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
          ])),
          if (trailingWidget != null) trailingWidget!
          else if (trailing != null) Text(trailing!, style: TextStyle(color: Colors.grey[400], fontSize: 11)),
        ]),
      ),
    );
  }
}

/// Status badge widget
class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const StatusBadge({super.key, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }
}
