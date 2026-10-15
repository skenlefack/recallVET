import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  bool get isAuthenticated => _api.isAuthenticated;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _api.post('/auth/login', {
      'email': email,
      'password': password,
    });

    if (res['success'] == true && res['token'] != null) {
      final tenantId = res['tenants'] != null && (res['tenants'] as List).isNotEmpty
          ? res['tenants'][0]['tenant_id']?.toString()
          : null;

      await _api.saveTokens(
        res['token'],
        res['refreshToken'] ?? '',
        tenantId: tenantId,
      );
    }

    return res;
  }

  Future<void> logout() async {
    await _api.clearTokens();
  }

  Future<Map<String, dynamic>> getProfile() async {
    return _api.get('/account/profile');
  }
}
