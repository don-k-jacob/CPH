import { loadEnvConfig } from "@next/env";
import { getAllDbCollectionKeys, getLegacyCollectionName } from "../../lib/db/schema";

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
    const collectionName = getLegacyCollectionName(key);
    const deleted = await deleteCollection(db, collectionName);
    console.log(`[db:reset:legacy] ${collectionName}: deleted=${deleted}`);
  }

  console.log("[db:reset:legacy] complete");
}

main().catch((error) => {
  console.error("[db:reset:legacy] failed");
  console.error(error);
  process.exit(1);
});
