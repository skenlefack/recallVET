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
  Map<String, int> _counts = {};
  List<dynamic> _recentNotifs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() => _loading = true);
    final results = await Future.wait([
      _api.get('/v1/analytics/appointments-stats'),
      _api.get('/v1/clinic/animals?limit=1'),
      _api.get('/v1/clinic/parties?limit=1'),
      _api.get('/v1/clinic/encounters?limit=1'),
      _api.get('/v1/notifications?limit=5'),
    ]);

    setState(() {
      if (results[0]['success'] == true) _stats = results[0]['data'];
      _counts = {
        'animals': results[1]['pagination']?['total'] ?? 0,
        'clients': results[2]['pagination']?['total'] ?? 0,
        'encounters': results[3]['pagination']?['total'] ?? 0,
      };
      if (results[4]['success'] == true) _recentNotifs = results[4]['data'] ?? [];
      _loading = false;
    });
  }

  String _getGreeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Bonjour';
    if (h < 18) return "Bon après-midi";
    return 'Bonsoir';
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadAll,
      color: AppTheme.primary,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          _buildWelcomeCard(user),
          const SizedBox(height: 20),
          _buildStatsGrid(),
          const SizedBox(height: 20),
          _buildQuickActions(context),
          const SizedBox(height: 20),
          _buildAppointmentSummary(),
          const SizedBox(height: 20),
          _buildRecentActivity(),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard(Map<String, dynamic>? user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [AppTheme.primaryDark, AppTheme.primary, AppTheme.primaryLight],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${_getGreeting()} ${user?['first_name'] ?? ''} !',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 6),
              Text('Bienvenue sur RecallVET',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
            ]),
          ),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.pets, color: Colors.white, size: 32),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    final items = [
      _StatData('Clients', '${_counts['clients'] ?? 0}', Icons.people_alt_outlined, AppTheme.primary),
      _StatData('Animaux', '${_counts['animals'] ?? 0}', Icons.pets, AppTheme.accent),
      _StatData('Consultations', '${_counts['encounters'] ?? 0}', Icons.medical_services_outlined, AppTheme.success),
      _StatData('RDV ce mois', '${(_stats?['scheduled'] ?? 0) + (_stats?['completed'] ?? 0)}', Icons.calendar_month, AppTheme.warning),
    ];

    return GridView.count(
      crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1.5,
      children: items.map((s) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(16),
          border: Border.all(color: s.color.withValues(alpha: 0.15)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: s.color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(s.icon, color: s.color, size: 20),
          ),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(s.value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: s.color)),
            Text(s.label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          ]),
        ]),
      )).toList(),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _Action('Consultation', Icons.add_circle, AppTheme.primary, () => Navigator.pushNamed(context, '/encounters/new')),
      _Action('RDV', Icons.calendar_today, AppTheme.accent, () => Navigator.pushNamed(context, '/appointments/new')),
      _Action('Animal', Icons.pets, AppTheme.success, () => Navigator.pushNamed(context, '/animals/new')),
      _Action('Facture', Icons.receipt_long, AppTheme.warning, () => Navigator.pushNamed(context, '/invoices/new')),
    ];

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Actions rapides', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
      const SizedBox(height: 12),
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: actions.map((a) => InkWell(
          onTap: a.onTap, borderRadius: BorderRadius.circular(16),
          child: SizedBox(
            width: 75,
            child: Column(children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: a.color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(a.icon, color: a.color, size: 24),
              ),
              const SizedBox(height: 6),
              Text(a.label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
            ]),
          ),
        )).toList(),
      ),
    ]);
  }

  Widget _buildAppointmentSummary() {
    if (_stats == null) return const SizedBox.shrink();

    final items = [
      _BarItem('Programmés', _stats!['scheduled'] ?? 0, AppTheme.primary),
      _BarItem('Terminés', _stats!['completed'] ?? 0, AppTheme.success),
      _BarItem('Annulés', _stats!['cancelled'] ?? 0, AppTheme.warning),
      _BarItem('Absents', _stats!['no_show'] ?? 0, AppTheme.danger),
    ];
    final total = items.fold<int>(0, (sum, i) => sum + i.value);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Rendez-vous du mois', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 14),
        // Horizontal bar
        if (total > 0)
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: Row(children: items.where((i) => i.value > 0).map((i) => Expanded(
              flex: i.value,
              child: Container(height: 10, color: i.color),
            )).toList()),
          ),
        if (total == 0)
          Container(height: 10, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(6))),
        const SizedBox(height: 12),
        Wrap(spacing: 16, runSpacing: 8, children: items.map((i) => Row(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 10, height: 10, decoration: BoxDecoration(color: i.color, borderRadius: BorderRadius.circular(3))),
          const SizedBox(width: 6),
          Text('${i.label}: ${i.value}', style: TextStyle(fontSize: 12, color: Colors.grey[700])),
        ])).toList()),
      ]),
    );
  }

  Widget _buildRecentActivity() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Activité récente', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          Icon(Icons.history, size: 20, color: Colors.grey[400]),
        ]),
        const SizedBox(height: 12),
        if (_recentNotifs.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Center(child: Text('Aucune activité récente', style: TextStyle(color: Colors.grey[500]))),
          )
        else
          ..._recentNotifs.take(4).map((n) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _notifColor(n['type']).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(_notifIcon(n['type']), size: 16, color: _notifColor(n['type'])),
              ),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(n['title'] ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                if (n['body'] != null)
                  Text(n['body'], style: TextStyle(fontSize: 11, color: Colors.grey[500]), maxLines: 1, overflow: TextOverflow.ellipsis),
              ])),
            ]),
          )),
      ]),
    );
  }

  Color _notifColor(String? type) => switch (type) { 'success' => AppTheme.success, 'warning' => AppTheme.warning, 'error' => AppTheme.danger, _ => AppTheme.primary };
  IconData _notifIcon(String? type) => switch (type) { 'success' => Icons.check_circle, 'warning' => Icons.warning_amber, 'error' => Icons.error, _ => Icons.info_outline };
}

class _StatData { final String label, value; final IconData icon; final Color color; _StatData(this.label, this.value, this.icon, this.color); }
class _Action { final String label; final IconData icon; final Color color; final VoidCallback onTap; _Action(this.label, this.icon, this.color, this.onTap); }
class _BarItem { final String label; final int value; final Color color; _BarItem(this.label, this.value, this.color); }
