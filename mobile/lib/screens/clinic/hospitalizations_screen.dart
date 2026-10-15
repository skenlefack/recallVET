import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class HospitalizationsScreen extends StatelessWidget {
  const HospitalizationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/hospitalizations',
      title: 'Hospitalisations',
      emptyIcon: Icons.local_hospital_outlined,
      emptyText: 'Aucune hospitalisation',
      itemBuilder: (item) {
        final status = item['status'] ?? 'admitted';
        final colorMap = {'admitted': AppTheme.warning, 'discharged': AppTheme.success, 'deceased': AppTheme.danger};
        final labelMap = {'admitted': 'Admis', 'discharged': 'Sorti', 'deceased': 'Décédé'};
        return ItemCard(
          icon: Icons.local_hospital_outlined,
          color: AppTheme.danger,
          title: item['animal_name'] ?? 'Hospi #${item['id']}',
          subtitle: 'Admis le ${item['admission_date'] ?? ''} — ${item['reason'] ?? ''}',
          trailingWidget: StatusBadge(label: labelMap[status] ?? status, color: colorMap[status] ?? AppTheme.primary),
        );
      },
    );
  }
}
