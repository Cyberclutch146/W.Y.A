const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    // Delete subcollections (rsvps, goodsPledges)
    const rsvps = await doc.ref.collection('rsvps').get();
    rsvps.forEach(rsvp => batch.delete(rsvp.ref));
    
    const pledges = await doc.ref.collection('goodsPledges').get();
    pledges.forEach(pledge => batch.delete(pledge.ref));

    batch.delete(doc.ref);
  }

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function main() {
  console.log("Starting deletion of 'events' collection...");
  await deleteCollection(db, 'events', 50);
  console.log("Successfully wiped all events and their nested data!");
  process.exit(0);
}

main().catch(console.error);
