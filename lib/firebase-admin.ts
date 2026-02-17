import type { App } from "firebase-admin/app";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore as getFirestoreLib } from "firebase-admin/firestore";
import { getStorage as getStorageLib } from "firebase-admin/storage";

function getPrivateKey(): string {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key || typeof key !== "string") {
    throw new Error(
      "Missing FIREBASE_PRIVATE_KEY. Set it in .env or .env.local with your Firebase service account private key (PEM). " +
        "Use literal \\n for newlines if stored on one line."
    );
  }
  return key.replace(/\\n/g, "\n").trim();
}

function getApp(): App {
  const existing = getApps()[0];
  if (existing) {
    return existing as App;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !clientEmail) {
    throw new Error(
      "Missing Firebase admin env: set FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL (and FIREBASE_PRIVATE_KEY) in .env or .env.local"
    );
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: getPrivateKey()
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Firebase Admin cert failed: ${message}. Check FIREBASE_PRIVATE_KEY is a valid PEM string (e.g. -----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----).`
    );
  }
}

let app: App | null = null;

function getFirebaseApp(): App {
  if (!app) {
    app = getApp();
  }
  return app;
}

let _firestore: ReturnType<typeof getFirestoreLib> | null = null;
let _storage: ReturnType<typeof getStorageLib> | null = null;

/** Lazily initialized so build can succeed without Firebase env vars. */
export function getFirestore(): ReturnType<typeof getFirestoreLib> {
  if (!_firestore) _firestore = getFirestoreLib(getFirebaseApp());
  return _firestore;
}

/** Lazily initialized so build can succeed without Firebase env vars. */
export function getStorage(): ReturnType<typeof getStorageLib> {
  if (!_storage) _storage = getStorageLib(getFirebaseApp());
  return _storage;
}
