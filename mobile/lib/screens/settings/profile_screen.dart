import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(title: const Text('Mon profil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.primaryDark, AppTheme.primary]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(children: [
              CircleAvatar(
                radius: 40, backgroundColor: Colors.white.withValues(alpha: 0.2),
                child: Text(
                  '${user?['first_name']?[0] ?? ''}${user?['last_name']?[0] ?? ''}',
                  style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 12),
              Text('${user?['first_name'] ?? ''} ${user?['last_name'] ?? ''}',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(user?['email'] ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.7))),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
                child: Text(user?['role'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 12)),
              ),
            ]),
          ),
          const SizedBox(height: 20),

          // Info fields
          _infoTile(Icons.email_outlined, 'Email', user?['email'] ?? ''),
          _infoTile(Icons.person_outline, 'Prénom', user?['first_name'] ?? ''),
          _infoTile(Icons.person_outline, 'Nom', user?['last_name'] ?? ''),
          _infoTile(Icons.shield_outlined, 'Rôle', user?['role'] ?? ''),
          _infoTile(Icons.language, 'Langue', user?['preferred_language'] ?? 'fr'),
        ],
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey.shade100)),
    child: Row(children: [
      Icon(icon, color: AppTheme.primary, size: 22),
      const SizedBox(width: 14),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
      ]),
    ]),
  );
}
