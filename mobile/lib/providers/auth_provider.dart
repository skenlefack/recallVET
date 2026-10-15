import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  Map<String, dynamic>? _user;
  List<dynamic> _tenants = [];
  bool _loading = true;
  String? _error;

  Map<String, dynamic>? get user => _user;
  List<dynamic> get tenants => _tenants;
  bool get loading => _loading;
  bool get isAuthenticated => _apiService.isAuthenticated && _user != null;
  String? get error => _error;

  Future<void> init() async {
    await _apiService.loadTokens();
    if (_apiService.isAuthenticated) {
      await _loadProfile();
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    _loading = true;
    notifyListeners();

    final res = await _authService.login(email, password);

    if (res['success'] == true) {
      _user = res['user'];
      _tenants = res['tenants'] ?? [];
      _loading = false;
      notifyListeners();
      return true;
    }

    _error = res['message'] ?? 'Erreur de connexion';
    _loading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _tenants = [];
    notifyListeners();
  }

  Future<void> _loadProfile() async {
    final res = await _authService.getProfile();
    if (res['success'] == true) {
      _user = res['data'];
    } else {
      await _authService.logout();
    }
  }
}
