import 'package:flutter/material.dart';

void main() {
  runApp(const QuickCommerceRiderApp());
}

class QuickCommerceRiderApp extends StatefulWidget {
  const QuickCommerceRiderApp({super.key});

  @override
  State<QuickCommerceRiderApp> createState() => _QuickCommerceRiderAppState();
}

class _QuickCommerceRiderAppState extends State<QuickCommerceRiderApp> {
  bool darkMode = false;

  @override
  Widget build(BuildContext context) {
    final seed = const Color(0xFF075DF4);
    return MaterialApp(
      title: 'Quick Commerce Rider App',
      debugShowCheckedModeBanner: false,
      themeMode: darkMode ? ThemeMode.dark : ThemeMode.light,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: seed),
        scaffoldBackgroundColor: const Color(0xFFF7FAFF),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.dark),
      ),
      home: RiderHome(onThemeChanged: (value) => setState(() => darkMode = value)),
    );
  }
}

class RiderHome extends StatefulWidget {
  const RiderHome({required this.onThemeChanged, super.key});

  final ValueChanged<bool> onThemeChanged;

  @override
  State<RiderHome> createState() => _RiderHomeState();
}

class _RiderHomeState extends State<RiderHome> {
  int index = 0;
  bool isOnline = true;
  bool darkMode = false;

  final screens = const [
    RiderScreenSpec('Splash', Icons.delivery_dining, 'Auto-check JWT token and route rider to dashboard or login.'),
    RiderScreenSpec('Login', Icons.phone_android, 'Validate phone number, generate OTP, and support Google/Apple login.'),
    RiderScreenSpec('OTP Verification', Icons.password, 'Verify 6 digit OTP, show countdown timer, and allow resend.'),
    RiderScreenSpec('Dashboard', Icons.dashboard, 'Online toggle, earnings, incentives, and new order section.'),
    RiderScreenSpec('New Order Popup', Icons.notification_important, '15 second accept/reject offer with pickup, drop, distance, and payout.'),
    RiderScreenSpec('Live Map Navigation', Icons.map, 'Google Maps route line, ETA, live distance, and turn-by-turn navigation.'),
    RiderScreenSpec('Order Details', Icons.receipt_long, 'Order ID, addresses, item list, call buttons, and swipe pickup.'),
    RiderScreenSpec('Pickup', Icons.store, 'Store details, call store, navigate, verify location, and confirm pickup.'),
    RiderScreenSpec('Delivery', Icons.home_pin, 'Customer details, instructions, navigate, delivery OTP, and delivered action.'),
    RiderScreenSpec('Earnings', Icons.account_balance_wallet, 'Daily, weekly, monthly earnings and transaction history.'),
    RiderScreenSpec('Order History', Icons.history, 'Completed and cancelled orders with search and filters.'),
    RiderScreenSpec('Profile', Icons.person, 'Rider photo, name, rider ID, rating, documents, vehicle, and bank details.'),
    RiderScreenSpec('Vehicle Info', Icons.two_wheeler, 'Vehicle type, number, brand, model, color, and admin approval request.'),
    RiderScreenSpec('Documents', Icons.verified_user, 'Aadhaar, license, RC, insurance, pollution certificate and OCR approval.'),
    RiderScreenSpec('Settings', Icons.settings, 'Notifications, sound, language, dark mode, privacy, terms, and logout.'),
    RiderScreenSpec('Support', Icons.support_agent, 'Help center, issue report, call support, chat support, FAQ, and SOS.'),
  ];

  @override
  Widget build(BuildContext context) {
    final screen = screens[index];
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quick Commerce Rider'),
        actions: [
          IconButton(
            tooltip: 'SOS',
            onPressed: () {},
            icon: const Icon(Icons.sos),
          ),
          Switch(
            value: darkMode,
            onChanged: (value) {
              setState(() => darkMode = value);
              widget.onThemeChanged(value);
            },
          ),
        ],
      ),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth > 760;
            return Row(
              children: [
                if (wide) NavigationRail(
                  selectedIndex: index,
                  onDestinationSelected: (value) => setState(() => index = value),
                  destinations: screens.map((item) => NavigationRailDestination(
                    icon: Icon(item.icon),
                    label: Text(item.title),
                  )).toList(),
                ),
                Expanded(child: ScreenCanvas(spec: screen, isOnline: isOnline, onOnlineChanged: (value) => setState(() => isOnline = value))),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _bottomIndexForScreen(index),
        onDestinationSelected: (value) => setState(() => index = [3, 9, 10, 11][value]),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet), label: 'Earnings'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          children: [
            const DrawerHeader(child: Text('All Rider Screens')),
            for (var i = 0; i < screens.length; i++)
              ListTile(
                leading: Icon(screens[i].icon),
                title: Text('${i + 1}. ${screens[i].title}'),
                selected: i == index,
                onTap: () {
                  Navigator.pop(context);
                  setState(() => index = i);
                },
              ),
          ],
        ),
      ),
    );
  }

  int _bottomIndexForScreen(int screenIndex) {
    if (screenIndex == 9) return 1;
    if (screenIndex == 10) return 2;
    if (screenIndex == 11) return 3;
    return 0;
  }
}

class ScreenCanvas extends StatelessWidget {
  const ScreenCanvas({
    required this.spec,
    required this.isOnline,
    required this.onOnlineChanged,
    super.key,
  });

  final RiderScreenSpec spec;
  final bool isOnline;
  final ValueChanged<bool> onOnlineChanged;

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.primary;
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 430),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(backgroundColor: color, foregroundColor: Colors.white, child: Icon(spec.icon)),
                      const SizedBox(width: 12),
                      Expanded(child: Text(spec.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800))),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(spec.description),
                  const SizedBox(height: 20),
                  if (spec.title == 'Dashboard') DashboardPreview(isOnline: isOnline, onChanged: onOnlineChanged),
                  if (spec.title == 'Earnings') const EarningsPreview(),
                  if (spec.title == 'New Order Popup') const NewOrderPreview(),
                  if (spec.title == 'Live Map Navigation') const MapPreview(),
                  if (!['Dashboard', 'Earnings', 'New Order Popup', 'Live Map Navigation'].contains(spec.title))
                    Expanded(
                      child: ListView(
                        children: const [
                          _InfoTile('Primary action', 'Production code connects this screen to secured REST APIs.'),
                          _InfoTile('Realtime', 'Socket.IO updates order and location state live.'),
                          _InfoTile('Security', 'JWT, secure storage, rate limits, GPS validation, and audit logs.'),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class DashboardPreview extends StatelessWidget {
  const DashboardPreview({required this.isOnline, required this.onChanged, super.key});

  final bool isOnline;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: ListView(
        children: [
          SwitchListTile(value: isOnline, onChanged: onChanged, title: const Text('You are Online')),
          const _MetricCard(label: "Today's Earnings", value: '₹1,245.80'),
          const Row(children: [
            Expanded(child: _MetricCard(label: 'Completed', value: '06')),
            SizedBox(width: 8),
            Expanded(child: _MetricCard(label: 'Hours', value: '01:45')),
            SizedBox(width: 8),
            Expanded(child: _MetricCard(label: 'Incentive', value: '₹180')),
          ]),
        ],
      ),
    );
  }
}

class EarningsPreview extends StatelessWidget {
  const EarningsPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return const Expanded(
      child: Column(
        children: [
          SegmentedButton<String>(
            segments: [
              ButtonSegment(value: 'daily', label: Text('Daily')),
              ButtonSegment(value: 'weekly', label: Text('Weekly')),
              ButtonSegment(value: 'monthly', label: Text('Monthly')),
            ],
            selected: {'daily'},
          ),
          _MetricCard(label: 'Total Earnings = Base Pay + Distance Pay + Surge + Bonus + Tips', value: '₹1,245.80'),
        ],
      ),
    );
  }
}

class NewOrderPreview extends StatelessWidget {
  const NewOrderPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          const _InfoTile('Pickup', 'Daily Needs Store, 0.8 km away'),
          const _InfoTile('Drop', 'Rohit Sharma, 2.6 km away'),
          const _MetricCard(label: 'Order Payout', value: '₹46.50'),
          FilledButton(onPressed: () {}, child: const Text('Accept Order')),
          TextButton(onPressed: () {}, child: const Text('Reject Order')),
        ],
      ),
    );
  }
}

class MapPreview extends StatelessWidget {
  const MapPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(color: Theme.of(context).colorScheme.primaryContainer, borderRadius: BorderRadius.circular(14)),
        child: const Center(child: Text('Google Maps route, ETA, live distance, and turn-by-turn navigation')),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 6),
          Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900)),
        ]),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile(this.title, this.subtitle);

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.check_circle_outline),
      title: Text(title),
      subtitle: Text(subtitle),
    );
  }
}

class RiderScreenSpec {
  const RiderScreenSpec(this.title, this.icon, this.description);

  final String title;
  final IconData icon;
  final String description;
}
