import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';

import '../models/traffic_models.dart';

class FirebaseTrafficService {
  FirebaseTrafficService();

  FirebaseDatabase? _database;

  Future<void> initialize() async {
    await Firebase.initializeApp();
    _database = FirebaseDatabase.instance;
  }

  Future<UserCredential> login(String email, String password) {
    return FirebaseAuth.instance.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  Stream<DatabaseEvent> liveTrafficStream() {
    final database = _database;
    if (database == null) {
      return const Stream.empty();
    }
    return database.ref('traffic/live').onValue;
  }

  Future<void> activateEmergency(EmergencyEvent event) async {
    final database = _database;
    if (database == null) {
      return;
    }
    await database.ref('greenCorridor/current').set({
      'active': event.active,
      'vehicleId': event.vehicleId,
      'route': event.route,
      'etaSeconds': event.etaSeconds,
      'timeSavedSeconds': event.timeSavedSeconds,
      'updatedAt': ServerValue.timestamp,
    });
    await database.ref('alerts').push().set({
      'type': 'emergency',
      'message': 'Mobile ambulance mode activated',
      'createdAt': ServerValue.timestamp,
    });
  }
}
