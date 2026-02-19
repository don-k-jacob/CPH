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

async function getCollectionCount(db: FirestoreDb, collectionName: string): Promise<number> {
  return (await db.collection(collectionName).count().get()).data().count;
}

async function copyLegacyCollectionToVersioned(
  db: FirestoreDb,
  legacyCollectionName: string,
  versionedCollectionName: string
): Promise<number> {
  const source = db.collection(legacyCollectionName);
  const target = db.collection(versionedCollectionName);
  let copied = 0;
  let lastDocId: string | null = null;
  const batchSize = 300;

  while (true) {
    let query = source.orderBy("__name__").limit(batchSize);
    if (lastDocId) query = query.startAfter(lastDocId);
    const snap = await query.get();
    if (snap.empty) break;

    const batch = db.batch();
    for (const doc of snap.docs) {
      batch.set(target.doc(doc.id), doc.data(), { merge: true });
      copied += 1;
    }
    await batch.commit();

    lastDocId = snap.docs[snap.docs.length - 1]!.id;
    if (snap.size < batchSize) break;
  }

  return copied;
}

async function main() {
  loadEnvConfig(process.cwd());
  const { getFirestore } = await import("../../lib/firebase-admin");
  const db = getFirestore();
  const keys = getAllDbCollectionKeys();
  const now = new Date().toISOString();

  const report: Array<{
    key: string;
    legacyCollection: string;
    versionedCollection: string;
    copied: number;
    legacyCount: number;
    versionedCount: number;
  }> = [];

  for (const key of keys) {
    const legacyCollection = getLegacyCollectionName(key);
    const versionedCollection = getVersionedCollectionName(key);
    const legacyCount = await getCollectionCount(db, legacyCollection);
    const copied = legacyCount > 0
      ? await copyLegacyCollectionToVersioned(db, legacyCollection, versionedCollection)
      : 0;
    const versionedCount = await getCollectionCount(db, versionedCollection);
    report.push({ key, legacyCollection, versionedCollection, copied, legacyCount, versionedCount });
    console.log(
      `[db:migrate:v1] ${key} :: ${legacyCollection} (${legacyCount}) -> ${versionedCollection} (${versionedCount}), copied=${copied}`
    );
  }

  await db.collection(SCHEMA_META_COLLECTION).doc(SCHEMA_META_DOC_ID).set(
    {
      activeVersion: FIRESTORE_SCHEMA_VERSION,
      activeNamespace: FIRESTORE_SCHEMA_NAMESPACE,
      migratedAt: now,
      collections: report
    },
    { merge: true }
  );

  console.log(`[db:migrate:v1] migration complete for schema ${FIRESTORE_SCHEMA_VERSION}`);
}

main().catch((error) => {
  console.error("[db:migrate:v1] migration failed");
  console.error(error);
  process.exit(1);
});
