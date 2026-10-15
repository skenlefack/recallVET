class ApiConfig {
  // Change this to your production URL
  static const String baseUrl = 'https://api.recallvet.com/api';

  // For local development, use:
  // static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:5000/api'; // iOS simulator

  static const Duration timeout = Duration(seconds: 15);

  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
