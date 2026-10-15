import 'package:flutter/material.dart';
import '../../services/api_service.dart';

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
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load([String? search]) async {
    setState(() => _loading = true);
    final q = search != null && search.isNotEmpty ? '&search=$search' : '';
    final res = await _api.get('/v1/clinic/animals?limit=50$q');
    if (res['success'] == true) {
      setState(() {
        _animals = res['data'] ?? [];
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: 'Rechercher un animal...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchCtrl.clear();
                        _load();
                      },
                    )
                  : null,
            ),
            onSubmitted: _load,
          ),
        ),

        // List
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _animals.isEmpty
                  ? const Center(child: Text('Aucun animal trouvé'))
                  : RefreshIndicator(
                      onRefresh: () => _load(_searchCtrl.text),
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: _animals.length,
                        itemBuilder: (ctx, i) {
                          final a = _animals[i];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.green.withValues(alpha: 0.1),
                                child: const Icon(Icons.pets, color: Colors.green),
                              ),
                              title: Text(a['name'] ?? a['animal_code'] ?? ''),
                              subtitle: Text(
                                '${a['species_name'] ?? ''} — ${a['owner_name'] ?? ''}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 13),
                              ),
                              trailing: Text(
                                a['animal_code'] ?? '',
                                style: TextStyle(color: Colors.grey[400], fontSize: 11),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
        ),
      ],
    );
  }
}
