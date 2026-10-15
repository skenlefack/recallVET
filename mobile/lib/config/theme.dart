import 'package:flutter/material.dart';

class AppTheme {
  // Bleu dauphin palette
  static const Color primary = Color(0xFF0077B6);
  static const Color primaryDark = Color(0xFF023E8A);
  static const Color primaryLight = Color(0xFF00B4D8);
  static const Color accent = Color(0xFF48CAE4);
  static const Color accentLight = Color(0xFF90E0EF);
  static const Color accentVeryLight = Color(0xFFCAF0F8);
  static const Color bgLight = Color(0xFFF0F7FF);
  static const Color success = Color(0xFF2DC653);
  static const Color warning = Color(0xFFFFB703);
  static const Color danger = Color(0xFFE63946);

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primary,
      primary: primary,
      secondary: accent,
      surface: Colors.white,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: bgLight,
    appBarTheme: const AppBarTheme(
      backgroundColor: primary,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      selectedItemColor: primary,
      unselectedItemColor: Color(0xFF94A3B8),
      type: BottomNavigationBarType.fixed,
      showUnselectedLabels: true,
      elevation: 12,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        elevation: 2,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFDEE2E6)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primary, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade100),
      ),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primary,
      foregroundColor: Colors.white,
      elevation: 4,
    ),
  );
}
