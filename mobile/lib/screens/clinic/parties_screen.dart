import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class PartiesScreen extends StatelessWidget {
  const PartiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/clinic/parties',
      title: 'Clients',
      emptyIcon: Icons.people_alt_outlined,
      emptyText: 'Aucun client',
      searchable: true,
      itemBuilder: (item) => ItemCard(
        icon: Icons.person_outline,
        color: AppTheme.primary,
        title: item['display_name'] ?? 'Client #${item['id']}',
        subtitle: item['phone_primary'] ?? item['email'] ?? '',
        trailing: item['party_type'] == 'company' ? 'Société' : 'Individu',
      ),
    );
  }
}
