import { loadEnvConfig } from "@next/env";
import {
  FIRESTORE_SCHEMA_NAMESPACE,
  FIRESTORE_SCHEMA_VERSION,
  SCHEMA_META_COLLECTION,
  SCHEMA_META_DOC_ID,
  getAllDbCollectionKeys,
  getLegacyCollectionName,
  getVersionedCollectionName
} from "../../lib/db/schema";

type FirestoreDb = ReturnType<typeof import("../../lib/firebase-admin").getFirestore>;

function pad(value: string, width: number): string {
  if (value.length >= width) return value;
  return value + " ".repeat(width - value.length);
}

async function getCollectionCount(db: FirestoreDb, collectionName: string): Promise<number> {
  return (await db.collection(collectionName).count().get()).data().count;
}

async function main() {
  loadEnvConfig(process.cwd());
  const { getFirestore } = await import("../../lib/firebase-admin");
  const db = getFirestore();

  console.log(`[db:schema:status] schema=${FIRESTORE_SCHEMA_VERSION}, namespace=${FIRESTORE_SCHEMA_NAMESPACE}`);
  console.log("");

  const keys = getAllDbCollectionKeys();
  const headers = {
    key: 22,
    legacy: 34,
    legacyCount: 13,
    versioned: 40,
    versionedCount: 13
  };

  console.log(
    `${pad("key", headers.key)} ${pad("legacyCollection", headers.legacy)} ${pad("legacyCount", headers.legacyCount)} ${pad("versionedCollection", headers.versioned)} ${pad("versionedCount", headers.versionedCount)}`
  );
  console.log("-".repeat(headers.key + headers.legacy + headers.legacyCount + headers.versioned + headers.versionedCount + 4));

  for (const key of keys) {
    const legacyCollection = getLegacyCollectionName(key);
    const versionedCollection = getVersionedCollectionName(key);
    const [legacyCount, versionedCount] = await Promise.all([
      getCollectionCount(db, legacyCollection),
      getCollectionCount(db, versionedCollection)
    ]);
    console.log(
      `${pad(key, headers.key)} ${pad(legacyCollection, headers.legacy)} ${pad(String(legacyCount), headers.legacyCount)} ${pad(versionedCollection, headers.versioned)} ${pad(String(versionedCount), headers.versionedCount)}`
    );
  }

  const metaSnap = await db.collection(SCHEMA_META_COLLECTION).doc(SCHEMA_META_DOC_ID).get();
  console.log("");
  if (!metaSnap.exists) {
    console.log("[db:schema:status] no schema metadata doc found");
    return;
  }

  const data = metaSnap.data() ?? {};
  console.log("[db:schema:status] schema metadata:");
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error("[db:schema:status] failed");
  console.error(error);
  process.exit(1);
});
