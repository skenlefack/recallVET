import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../config/theme.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _appointments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await _api.get('/v1/clinic/appointments?limit=30');
    if (res['success'] == true) {
      setState(() { _appointments = res['data'] ?? []; _loading = false; });
    } else {
      setState(() => _loading = false);
    }
  }

  Color _statusColor(String? s) => switch (s) {
    'completed' => AppTheme.success, 'cancelled' => AppTheme.danger,
    'no_show' => Colors.grey, _ => AppTheme.primary,
  };
  String _statusLabel(String? s) => switch (s) {
    'completed' => 'Terminé', 'cancelled' => 'Annulé',
    'no_show' => 'Absent', 'scheduled' => 'Programmé', _ => s ?? '',
  };

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_appointments.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.calendar_today, size: 64, color: Colors.grey[300]),
        const SizedBox(height: 12),
        Text('Aucun rendez-vous', style: TextStyle(color: Colors.grey[500], fontSize: 16)),
      ]));
    }

    return RefreshIndicator(
      onRefresh: _load, color: AppTheme.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _appointments.length,
        itemBuilder: (ctx, i) {
          final apt = _appointments[i];
          final color = _statusColor(apt['status']);
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(14),
              border: Border(left: BorderSide(color: color, width: 4)),
            ),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.calendar_today, color: color, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(apt['animal_name'] ?? apt['party_name'] ?? 'RDV #${apt['id']}',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 4),
                Text('${apt['scheduled_date'] ?? ''} — ${apt['scheduled_time'] ?? ''}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                child: Text(_statusLabel(apt['status']), style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
              ),
            ]),
          );
        },
      ),
    );
  }
}
