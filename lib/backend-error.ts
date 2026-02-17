export function getBackendErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "Unknown backend error");

  if (raw.includes("Cloud Firestore API has not been used") || raw.includes("SERVICE_DISABLED")) {
    return "Cloud Firestore API is disabled for this Google Cloud project. Enable Firestore API and retry.";
  }

  if (raw.includes("Missing Firebase admin env")) {
    return "Firebase admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.";
  }

  if (raw.includes("Firebase Admin cert failed") || raw.includes("FIREBASE_PRIVATE_KEY")) {
    return "Firebase Admin credentials are invalid. Verify your service account key values in .env/.env.local.";
  }

  if (raw.includes("permission") || raw.includes("PERMISSION_DENIED")) {
    return "Firebase permission denied. Check service account roles and Firestore/Storage security configuration.";
  }

  return "Backend is currently unavailable. Please check Firebase configuration and try again.";
}
