import admin from "firebase-admin";
import { readFile } from "fs/promises";

// โหลด serviceAccountKey.json
const serviceAccount = JSON.parse(
  await readFile(new URL("./study-habit-tracker-78b96-firebase-adminsdk-fbsvc-d5eb31d2f3.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const messagingAdmin = admin.messaging();
