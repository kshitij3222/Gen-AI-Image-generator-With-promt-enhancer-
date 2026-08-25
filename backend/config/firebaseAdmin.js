const { getApps, initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let firebaseApp;

// Production: use environment variables
if (process.env.FIREBASE_PROJECT_ID) {
  firebaseApp =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,

            clientEmail:
              process.env.FIREBASE_CLIENT_EMAIL,

            privateKey:
              process.env.FIREBASE_PRIVATE_KEY.replace(
                /\\n/g,
                "\n"
              )
          })
        })
      : getApps()[0];
}

// Local development: use serviceAccountKey.json
else {
  const serviceAccount =
    require("./serviceAccountKey.json");

  firebaseApp =
    getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount)
        })
      : getApps()[0];
}

const firebaseAuth = getAuth(firebaseApp);

module.exports = {
  firebaseApp,
  firebaseAuth
};