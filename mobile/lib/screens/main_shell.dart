import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../config/theme.dart';
import 'dashboard/home_screen.dart';
import 'clinic/appointments_screen.dart';
import 'clinic/animals_screen.dart';
import 'clinic/parties_screen.dart';
import 'clinic/encounters_screen.dart';
import 'clinic/vaccinations_screen.dart';
import 'clinic/lab_requests_screen.dart';
import 'clinic/hospitalizations_screen.dart';
import 'clinic/surgeries_screen.dart';
import 'clinic/prescriptions_screen.dart';
import 'clinic/invoices_screen.dart';
import 'farm/farms_screen.dart';
import 'farm/herds_screen.dart';
import 'farm/visits_screen.dart';
import 'farm/health_events_screen.dart';
import 'pharmacy/products_screen.dart';
import 'pharmacy/suppliers_screen.dart';
import 'pharmacy/stock_screen.dart';
import 'pharmacy/stock_movements_screen.dart';
import 'pharmacy/sales_screen.dart';
import 'settings/profile_screen.dart';
import 'notifications/notifications_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _screens = const [
    HomeScreen(),
    AppointmentsScreen(),
    AnimalsScreen(),
    ProductsScreen(),
  ];

  final _titles = ['RecallVET', 'Rendez-vous', 'Animaux', 'Pharmacie'];

  void _navigateTo(BuildContext context, Widget screen) {
    Navigator.pop(context); // close drawer
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_currentIndex]),
        leading: Builder(builder: (ctx) => IconButton(
          icon: const Icon(Icons.menu_rounded),
          onPressed: () => Scaffold.of(ctx).openDrawer(),
        )),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: _buildDrawer(context),
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -2))],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Accueil'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded), label: 'RDV'),
            BottomNavigationBarItem(icon: Icon(Icons.pets_rounded), label: 'Animaux'),
            BottomNavigationBarItem(icon: Icon(Icons.medication_rounded), label: 'Pharma'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateTo(context, const EncountersScreen()),
        tooltip: 'Nouvelle consultation',
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final user = context.read<AuthProvider>().user;

    return Drawer(
      child: Column(children: [
        // Header
        Container(
          width: double.infinity,
          padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 20, 20, 20),
          decoration: const BoxDecoration(
            gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [AppTheme.primaryDark, AppTheme.primary]),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            CircleAvatar(
              radius: 28, backgroundColor: Colors.white.withValues(alpha: 0.2),
              child: Text('${user?['first_name']?[0] ?? ''}${user?['last_name']?[0] ?? ''}',
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),
            Text('${user?['first_name'] ?? ''} ${user?['last_name'] ?? ''}',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
            Text(user?['email'] ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
          ]),
        ),

        // Menu
        Expanded(child: ListView(padding: EdgeInsets.zero, children: [
          _section('CLINIQUE'),
          _item(Icons.people_alt_outlined, 'Clients', () => _navigateTo(context, const PartiesScreen())),
          _item(Icons.pets, 'Animaux', () { Navigator.pop(context); setState(() => _currentIndex = 2); }),
          _item(Icons.calendar_today, 'Rendez-vous', () { Navigator.pop(context); setState(() => _currentIndex = 1); }),
          _item(Icons.medical_services_outlined, 'Consultations', () => _navigateTo(context, const EncountersScreen())),
          _item(Icons.vaccines, 'Vaccinations', () => _navigateTo(context, const VaccinationsScreen())),
          _item(Icons.science_outlined, 'Laboratoire', () => _navigateTo(context, const LabRequestsScreen())),
          _item(Icons.local_hospital_outlined, 'Hospitalisations', () => _navigateTo(context, const HospitalizationsScreen())),
          _item(Icons.content_cut, 'Chirurgies', () => _navigateTo(context, const SurgeriesScreen())),
          _item(Icons.description_outlined, 'Ordonnances', () => _navigateTo(context, const PrescriptionsScreen())),
          _item(Icons.receipt_long_outlined, 'Factures', () => _navigateTo(context, const InvoicesScreen())),

          _section('ÉLEVAGE'),
          _item(Icons.agriculture, 'Exploitations', () => _navigateTo(context, const FarmsScreen())),
          _item(Icons.groups, 'Troupeaux', () => _navigateTo(context, const HerdsScreen())),
          _item(Icons.assignment_outlined, 'Visites', () => _navigateTo(context, const VisitsScreen())),
          _item(Icons.warning_amber_outlined, 'Événements sanitaires', () => _navigateTo(context, const HealthEventsScreen())),

          _section('PHARMACIE'),
          _item(Icons.medication, 'Produits', () { Navigator.pop(context); setState(() => _currentIndex = 3); }),
          _item(Icons.local_shipping_outlined, 'Fournisseurs', () => _navigateTo(context, const SuppliersScreen())),
          _item(Icons.inventory_2_outlined, 'Stock', () => _navigateTo(context, const StockScreen())),
          _item(Icons.swap_horiz, 'Mouvements stock', () => _navigateTo(context, const StockMovementsScreen())),
          _item(Icons.point_of_sale, 'Ventes', () => _navigateTo(context, const SalesScreen())),

          _section('PARAMÈTRES'),
          _item(Icons.person_outline, 'Mon profil', () => _navigateTo(context, const ProfileScreen())),
          _item(Icons.notifications_outlined, 'Notifications', () => _navigateTo(context, const NotificationsScreen())),

          const Divider(),
          _item(Icons.logout, 'Déconnexion', () {
            Navigator.pop(context);
            context.read<AuthProvider>().logout();
          }, color: AppTheme.danger),
          const SizedBox(height: 20),
        ])),
      ]),
    );
  }

  Widget _section(String title) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 20, 20, 6),
    child: Text(title, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[400], letterSpacing: 1)),
  );

  Widget _item(IconData icon, String label, VoidCallback onTap, {Color? color}) => ListTile(
    leading: Icon(icon, color: color ?? AppTheme.primary, size: 22),
    title: Text(label, style: TextStyle(fontSize: 14, color: color ?? Colors.grey[800])),
    dense: true,
    visualDensity: const VisualDensity(vertical: -2),
    onTap: onTap,
  );
}
