const admin = require("firebase-admin");
const serviceAccount = require("./../firebase-secret.json");


class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL,
    });

    this.db = admin.firestore();
  }
}

module.exports = FirebaseService;