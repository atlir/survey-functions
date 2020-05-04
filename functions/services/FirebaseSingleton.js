const admin = require("firebase-admin");
const serviceAccount = require("./../firebase-secret.json");
let singleton = Symbol();
let singletonEnforcer = Symbol();

class FirebaseSingleton {
  constructor(enforcer) {
    if (enforcer !== singletonEnforcer)
      throw new Error("Instantiation failed: use Singleton.getInstance() instead of new.");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL,
    });

    this.db = admin.firestore();
  }

  static get instance() {
    if (!this[singleton]) this[singleton] = new FirebaseSingleton(singletonEnforcer);
    return this[singleton];
  }

  static set instance(v) {
    throw new Error("Can't change constant property!");
  }
}

module.exports = FirebaseSingleton;
