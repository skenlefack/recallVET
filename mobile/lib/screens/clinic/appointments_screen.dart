import 'package:flutter/material.dart';
import '../../services/api_service.dart';

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
    final res = await _api.get('/v1/clinic/appointments?limit=25');
    if (res['success'] == true) {
      setState(() {
        _appointments = res['data'] ?? [];
        _loading = false;
      });
    } else {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    if (_appointments.isEmpty) {
      return const Center(child: Text('Aucun rendez-vous'));
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _appointments.length,
        itemBuilder: (ctx, i) {
          final apt = _appointments[i];
          final status = apt['status'] ?? '';
          final statusColor = status == 'completed' ? Colors.green
              : status == 'cancelled' ? Colors.red
              : Colors.orange;

          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: statusColor.withValues(alpha: 0.15),
                child: Icon(Icons.calendar_today, color: statusColor, size: 20),
              ),
              title: Text(apt['animal_name'] ?? apt['party_name'] ?? 'RDV #${apt['id']}'),
              subtitle: Text('${apt['scheduled_date'] ?? ''} — ${apt['scheduled_time'] ?? ''}'),
              trailing: Chip(
                label: Text(status, style: TextStyle(fontSize: 11, color: statusColor)),
                backgroundColor: statusColor.withValues(alpha: 0.1),
                side: BorderSide.none,
                padding: EdgeInsets.zero,
              ),
            ),
          );
        },
      ),
    );
  }
}
