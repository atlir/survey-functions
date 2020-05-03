const admin = require("firebase-admin");
const serviceAccount = require("./../firebase-secret.json");

let instance = null;
class FirebaseService {
  constructor() {
    if (instance === null) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DB_URL,
      });

      this.db = admin.firestore();
      instance = this.db;
    } else {
      this.db = instance;
    }
  }
}

module.exports = FirebaseService;
