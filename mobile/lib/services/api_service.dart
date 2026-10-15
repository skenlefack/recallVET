import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  String? _refreshToken;
  String? _tenantId;

  Future<void> loadTokens() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _refreshToken = prefs.getString('refreshToken');
    _tenantId = prefs.getString('tenantId');
  }

  Future<void> saveTokens(String token, String refreshToken, {String? tenantId}) async {
    final prefs = await SharedPreferences.getInstance();
    _token = token;
    _refreshToken = refreshToken;
    await prefs.setString('token', token);
    await prefs.setString('refreshToken', refreshToken);
    if (tenantId != null) {
      _tenantId = tenantId;
      await prefs.setString('tenantId', tenantId);
    }
  }

  Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    _token = null;
    _refreshToken = null;
    _tenantId = null;
    await prefs.remove('token');
    await prefs.remove('refreshToken');
    await prefs.remove('tenantId');
  }

  bool get isAuthenticated => _token != null;
  String? get tenantId => _tenantId;

  Map<String, String> get _headers => {
    ...ApiConfig.defaultHeaders,
    if (_token != null) 'Authorization': 'Bearer $_token',
    if (_tenantId != null) 'X-Tenant-Id': _tenantId!,
  };

  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final res = await http.get(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: _headers,
      ).timeout(ApiConfig.timeout);

      if (res.statusCode == 401) {
        final refreshed = await _refreshAccessToken();
        if (refreshed) return get(endpoint);
      }

      return _parseResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final res = await http.post(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: _headers,
        body: jsonEncode(data),
      ).timeout(ApiConfig.timeout);

      if (res.statusCode == 401) {
        final refreshed = await _refreshAccessToken();
        if (refreshed) return post(endpoint, data);
      }

      return _parseResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final res = await http.put(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: _headers,
        body: jsonEncode(data),
      ).timeout(ApiConfig.timeout);

      if (res.statusCode == 401) {
        final refreshed = await _refreshAccessToken();
        if (refreshed) return put(endpoint, data);
      }

      return _parseResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> delete(String endpoint) async {
    try {
      final res = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: _headers,
      ).timeout(ApiConfig.timeout);

      return _parseResponse(res);
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<bool> _refreshAccessToken() async {
    if (_refreshToken == null) return false;
    try {
      final res = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/refresh'),
        headers: ApiConfig.defaultHeaders,
        body: jsonEncode({'refreshToken': _refreshToken}),
      );
      final data = _parseResponse(res);
      if (data['token'] != null) {
        await saveTokens(data['token'], data['refreshToken'] ?? _refreshToken!);
        return true;
      }
    } catch (_) {}
    await clearTokens();
    return false;
  }

  Map<String, dynamic> _parseResponse(http.Response res) {
    try {
      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      return {'success': false, 'message': 'Invalid response'};
    }
  }
}
