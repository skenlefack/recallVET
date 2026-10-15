import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';

class AnimalsScreen extends StatefulWidget {
  const AnimalsScreen({super.key});

  @override
  State<AnimalsScreen> createState() => _AnimalsScreenState();
}

class _AnimalsScreenState extends State<AnimalsScreen> {
  final ApiService _api = ApiService();
  final TextEditingController _searchCtrl = TextEditingController();
  List<dynamic> _animals = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  Future<void> _load([String? search]) async {
    setState(() => _loading = true);
    final q = search != null && search.isNotEmpty ? '&search=$search' : '';
    final res = await _api.get('/v1/clinic/animals?limit=50$q');
    if (res['success'] == true) {
      setState(() { _animals = res['data'] ?? []; _loading = false; });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // Search bar
      Container(
        margin: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8),
        ]),
        child: TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(
            hintText: 'Rechercher un animal...', hintStyle: TextStyle(color: Colors.grey[400]),
            prefixIcon: const Icon(Icons.search, color: AppTheme.primary),
            border: InputBorder.none, contentPadding: const EdgeInsets.symmetric(vertical: 14),
            suffixIcon: _searchCtrl.text.isNotEmpty ? IconButton(
              icon: const Icon(Icons.clear, size: 20), onPressed: () { _searchCtrl.clear(); _load(); },
            ) : null,
          ),
          onSubmitted: _load,
          onChanged: (v) => setState(() {}),
        ),
      ),

      // List
      Expanded(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _animals.isEmpty
                ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.pets, size: 64, color: Colors.grey[300]),
                    const SizedBox(height: 12),
                    Text('Aucun animal trouvé', style: TextStyle(color: Colors.grey[500])),
                  ]))
                : RefreshIndicator(
                    onRefresh: () => _load(_searchCtrl.text), color: AppTheme.primary,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: _animals.length,
                      itemBuilder: (ctx, i) {
                        final a = _animals[i];
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
                                gradient: LinearGradient(colors: [AppTheme.primary.withValues(alpha: 0.15), AppTheme.accent.withValues(alpha: 0.1)]),
                                borderRadius: BorderRadius.circular(13),
                              ),
                              child: const Icon(Icons.pets, color: AppTheme.primary, size: 22),
                            ),
                            const SizedBox(width: 14),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(a['name'] ?? a['animal_code'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                              const SizedBox(height: 3),
                              Text('${a['species_name'] ?? ''} — ${a['owner_name'] ?? ''}',
                                  style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                            ])),
                            Text(a['animal_code'] ?? '', style: TextStyle(color: Colors.grey[400], fontSize: 11)),
                          ]),
                        );
                      },
                    ),
                  ),
      ),
    ]);
  }
}
