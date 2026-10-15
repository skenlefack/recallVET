import 'package:flutter/material.dart';
import '../../widgets/api_list_screen.dart';
import '../../config/theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ApiListScreen(
      endpoint: '/v1/notifications',
      title: 'Notifications',
      emptyIcon: Icons.notifications_none,
      emptyText: 'Aucune notification',
      itemBuilder: (item) {
        final type = item['type'] ?? 'info';
        final colorMap = {'success': AppTheme.success, 'warning': AppTheme.warning, 'error': AppTheme.danger, 'info': AppTheme.primary};
        final iconMap = {'success': Icons.check_circle, 'warning': Icons.warning_amber, 'error': Icons.error, 'info': Icons.info_outline};
        final isRead = item['is_read'] == 1;
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isRead ? Colors.white : AppTheme.accentVeryLight,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isRead ? Colors.grey.shade100 : AppTheme.accent.withValues(alpha: 0.3)),
          ),
          child: Row(children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: (colorMap[type] ?? AppTheme.primary).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(iconMap[type] ?? Icons.info_outline, color: colorMap[type] ?? AppTheme.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item['title'] ?? '', style: TextStyle(fontWeight: isRead ? FontWeight.w500 : FontWeight.w700, fontSize: 14)),
              if (item['body'] != null)
                Text(item['body'], style: TextStyle(color: Colors.grey[500], fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Text(item['created_at']?.toString().substring(0, 16) ?? '', style: TextStyle(color: Colors.grey[400], fontSize: 11)),
            ])),
          ]),
        );
      },
    );
  }
}
