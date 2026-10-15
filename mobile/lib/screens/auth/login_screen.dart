import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _submitting = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    _animController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    final auth = context.read<AuthProvider>();
    final success = await auth.login(_emailController.text.trim(), _passwordController.text);
    setState(() => _submitting = false);

    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(auth.error ?? 'Identifiants incorrects')),
          ]),
          backgroundColor: AppTheme.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF023E8A), Color(0xFF0077B6), Color(0xFF00B4D8)],
              ),
            ),
          ),

          // Decorative elements
          Positioned(right: -80, top: -80, child: _decoCircle(280, 0.06)),
          Positioned(left: -60, bottom: -60, child: _decoCircle(240, 0.04)),
          Positioned(right: 30, bottom: 180, child: _decoCircle(120, 0.07)),
          Positioned(left: 40, top: 120, child: _decoCircle(80, 0.05)),

          // Watermark paw
          Positioned(
            right: -20, top: 80,
            child: Opacity(opacity: 0.05, child: Icon(Icons.pets, size: 220, color: Colors.white)),
          ),

          // Wave bottom
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: CustomPaint(size: Size(MediaQuery.of(context).size.width, 100), painter: _WavePainter()),
          ),

          // Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: SlideTransition(
                  position: _slideAnim,
                  child: FadeTransition(
                    opacity: _fadeAnim,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Logo
                        Container(
                          width: 85, height: 85,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(22),
                            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 24, offset: const Offset(0, 8))],
                          ),
                          child: const Icon(Icons.pets, color: AppTheme.primary, size: 42),
                        ),
                        const SizedBox(height: 18),
                        RichText(text: TextSpan(
                          style: const TextStyle(fontSize: 30, fontWeight: FontWeight.bold, letterSpacing: 1),
                          children: [
                            const TextSpan(text: 'Recall', style: TextStyle(color: Colors.white)),
                            TextSpan(text: 'VET', style: TextStyle(color: AppTheme.accentLight)),
                          ],
                        )),
                        const SizedBox(height: 6),
                        Text('Gestion vétérinaire', style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.7))),
                        const SizedBox(height: 40),

                        // Login card
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [BoxShadow(color: AppTheme.primaryDark.withValues(alpha: 0.15), blurRadius: 40, offset: const Offset(0, 12))],
                          ),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const Text('Connexion', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
                                const SizedBox(height: 6),
                                Text('Accédez à votre espace', style: TextStyle(color: Colors.grey[500], fontSize: 14), textAlign: TextAlign.center),
                                const SizedBox(height: 28),
                                _buildField(_emailController, 'Email', Icons.email_outlined, TextInputType.emailAddress,
                                    validator: (v) { if (v == null || v.isEmpty) return 'Email requis'; if (!v.contains('@')) return 'Email invalide'; return null; }),
                                const SizedBox(height: 16),
                                _buildField(_passwordController, 'Mot de passe', Icons.lock_outlined, TextInputType.text, obscure: _obscurePassword,
                                    suffixIcon: IconButton(
                                      icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: Colors.grey),
                                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                    ),
                                    validator: (v) => v == null || v.isEmpty ? 'Mot de passe requis' : null,
                                    onSubmit: (_) => _handleLogin()),
                                const SizedBox(height: 28),
                                SizedBox(
                                  height: 52,
                                  child: ElevatedButton(
                                    onPressed: _submitting ? null : _handleLogin,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primary,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                      elevation: 4,
                                      shadowColor: AppTheme.primary.withValues(alpha: 0.4),
                                    ),
                                    child: _submitting
                                        ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                                        : const Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Text('Se connecter', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                              SizedBox(width: 8),
                                              Icon(Icons.arrow_forward_rounded, size: 20),
                                            ],
                                          ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 36),
                        Text('www.recallvet.com', style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 13)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(TextEditingController ctrl, String label, IconData icon, TextInputType type,
      {bool obscure = false, Widget? suffixIcon, String? Function(String?)? validator, void Function(String)? onSubmit}) {
    return TextFormField(
      controller: ctrl, keyboardType: type, obscureText: obscure, onFieldSubmitted: onSubmit,
      textInputAction: onSubmit != null ? TextInputAction.done : TextInputAction.next,
      decoration: InputDecoration(
        labelText: label, prefixIcon: Icon(icon, color: AppTheme.primary.withValues(alpha: 0.7)),
        suffixIcon: suffixIcon, filled: true, fillColor: AppTheme.bgLight,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppTheme.primary, width: 2)),
      ),
      validator: validator,
    );
  }

  Widget _decoCircle(double size, double opacity) => Container(
    width: size, height: size,
    decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: opacity)),
  );
}

class _WavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withValues(alpha: 0.05);
    final path = Path();
    path.moveTo(0, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.25, 0, size.width * 0.5, size.height * 0.3);
    path.quadraticBezierTo(size.width * 0.75, size.height * 0.6, size.width, size.height * 0.2);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
