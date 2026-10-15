import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  bool get isAuthenticated => _api.isAuthenticated;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _api.post('/auth/login', {
      'email': email,
      'password': password,
    });

    if (res['success'] == true && res['data'] != null) {
      final data = res['data'] as Map<String, dynamic>;
      final tenants = data['tenants'] as List? ?? [];
      final tenantId = tenants.isNotEmpty ? tenants[0]['id']?.toString() : null;

      await _api.saveTokens(
        data['token'],
        data['refreshToken'] ?? '',
        tenantId: tenantId,
      );

      return {
        'success': true,
        'user': data['user'],
        'tenants': tenants,
      };
    }

    return {
      'success': false,
      'message': res['message'] ?? 'Identifiants incorrects',
    };
  }

  Future<void> logout() async {
    await _api.clearTokens();
  }

  Future<Map<String, dynamic>> getProfile() async {
    return _api.get('/account/profile');
  }
}
