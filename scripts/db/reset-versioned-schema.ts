import { loadEnvConfig } from "@next/env";
import {
  SCHEMA_META_COLLECTION,
  SCHEMA_META_DOC_ID,
  getAllDbCollectionKeys,
  getVersionedCollectionName
} from "../../lib/db/schema";

type FirestoreDb = ReturnType<typeof import("../../lib/firebase-admin").getFirestore>;

async function deleteCollection(db: FirestoreDb, collectionName: string): Promise<number> {
  const collectionRef = db.collection(collectionName);
  let deleted = 0;
  const batchSize = 300;
  let lastDocId: string | null = null;

  while (true) {
    let query = collectionRef.orderBy("__name__").limit(batchSize);
    if (lastDocId) query = query.startAfter(lastDocId);
    const snap = await query.get();
    if (snap.empty) break;

    const batch = db.batch();
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
      deleted += 1;
    }
    await batch.commit();

    lastDocId = snap.docs[snap.docs.length - 1]!.id;
    if (snap.size < batchSize) break;
  }

  return deleted;
}

async function main() {
  loadEnvConfig(process.cwd());
  const { getFirestore } = await import("../../lib/firebase-admin");
  const db = getFirestore();

  for (const key of getAllDbCollectionKeys()) {
    const collectionName = getVersionedCollectionName(key);
    const deleted = await deleteCollection(db, collectionName);
    console.log(`[db:reset:versioned] ${collectionName}: deleted=${deleted}`);
  }

  await db.collection(SCHEMA_META_COLLECTION).doc(SCHEMA_META_DOC_ID).set(
    { resetAt: new Date().toISOString() },
    { merge: true }
  );

  console.log("[db:reset:versioned] complete");
}

main().catch((error) => {
  console.error("[db:reset:versioned] failed");
  console.error(error);
  process.exit(1);
});
