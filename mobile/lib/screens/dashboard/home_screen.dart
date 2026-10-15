import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() => _loading = true);
    final res = await _api.get('/v1/analytics/appointments-stats');
    if (res['success'] == true) {
      setState(() {
        _stats = res['data'];
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return RefreshIndicator(
      onRefresh: _loadDashboard,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Welcome card
          Card(
            color: AppTheme.primaryGreen,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bonjour ${user?['first_name'] ?? ''} !',
                    style: const TextStyle(
                      fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Bienvenue sur RecallVET',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.8)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Stats
          if (_loading)
            const Center(child: Padding(
              padding: EdgeInsets.all(32),
              child: CircularProgressIndicator(),
            ))
          else if (_stats != null)
            ...[
              _buildStatRow([
                _StatItem('Programmés', _stats!['scheduled']?.toString() ?? '0', Icons.calendar_today, Colors.blue),
                _StatItem('Terminés', _stats!['completed']?.toString() ?? '0', Icons.check_circle, AppTheme.lightGreen),
              ]),
              const SizedBox(height: 12),
              _buildStatRow([
                _StatItem('Annulés', _stats!['cancelled']?.toString() ?? '0', Icons.cancel, Colors.orange),
                _StatItem('Absents', _stats!['no_show']?.toString() ?? '0', Icons.person_off, Colors.red),
              ]),
            ],
          const SizedBox(height: 24),

          // Quick actions
          const Text('Actions rapides', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          _buildQuickActions(),
        ],
      ),
    );
  }

  Widget _buildStatRow(List<_StatItem> items) {
    return Row(
      children: items.map((item) => Expanded(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Icon(item.icon, color: item.color, size: 28),
                const SizedBox(height: 8),
                Text(item.value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: item.color)),
                const SizedBox(height: 4),
                Text(item.label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'icon': Icons.add_circle, 'label': 'Nouvelle\nconsultation', 'route': '/encounters/new'},
      {'icon': Icons.calendar_month, 'label': 'Prendre\nRDV', 'route': '/appointments/new'},
      {'icon': Icons.search, 'label': 'Chercher\nanimal', 'route': '/animals'},
      {'icon': Icons.medication, 'label': 'Dispenser\nmédicament', 'route': '/pharmacy'},
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 8,
      children: actions.map((a) => InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {}, // TODO: navigate
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(a['icon'] as IconData, color: AppTheme.primaryGreen),
            ),
            const SizedBox(height: 6),
            Text(
              a['label'] as String,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, height: 1.2),
            ),
          ],
        ),
      )).toList(),
    );
  }
}

class _StatItem {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  _StatItem(this.label, this.value, this.icon, this.color);
}
