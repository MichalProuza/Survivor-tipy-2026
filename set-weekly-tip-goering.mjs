/**
 * set-weekly-tip-goering.mjs
 *
 * Ručně nastaví týdenní tip pro uživatele „Hermann Göring" v 1. kole:
 *   pick1 = matej  (Matěj, kmen Hrdinové)
 *   pick2 = otakar (Otakar, kmen Padouši)
 *
 * Spuštění: node set-weekly-tip-goering.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyAdP93H0jPkveq0PJsbWt3epgJk36Dn6oY",
  authDomain:        "survivor-tipy.firebaseapp.com",
  projectId:         "survivor-tipy",
  storageBucket:     "survivor-tipy.firebasestorage.app",
  messagingSenderId: "949806018331",
  appId:             "1:949806018331:web:acea014bbea16d82076dbe"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function main() {
  // ── 1. Zjisti ID prvního kola z game/state ────────────────────────────────
  console.log('📋 Načítám game/state…');
  const stateSnap = await getDoc(doc(db, 'game', 'state'));
  if (!stateSnap.exists()) {
    console.error('❌ Dokument game/state neexistuje!');
    process.exit(1);
  }

  const weeks = stateSnap.data().weeks || [];
  if (weeks.length === 0) {
    console.error('❌ Žádná kola v game/state!');
    process.exit(1);
  }

  const firstWeek = weeks[0];
  const weekId = firstWeek.id;
  console.log(`   První kolo: id="${weekId}", label="${firstWeek.label || firstWeek.weekNum}"`);

  // ── 2. Najdi uživatele „Hermann Göring" v kolekci picks ──────────────────
  console.log('\n📋 Hledám uživatele Hermann Göring v kolekci picks…');
  const picksSnap = await getDocs(collection(db, 'picks'));
  console.log(`   Celkem uživatelů: ${picksSnap.size}`);

  const targetDoc = picksSnap.docs.find(d => d.data().nick === 'Hermann Göring');

  if (!targetDoc) {
    console.error('❌ Uživatel „Hermann Göring" nebyl nalezen v kolekci picks!');
    console.log('   Dostupné přezdívky:');
    picksSnap.docs.forEach(d => console.log(`     - "${d.data().nick || '(bez přezdívky)'}"`));
    process.exit(1);
  }

  console.log(`   ✓ Nalezen: uid=${targetDoc.id}, nick="${targetDoc.data().nick}"`);

  // ── 3. Nastav týdenní tip ─────────────────────────────────────────────────
  const existingWeekly = targetDoc.data().weekly || {};
  if (existingWeekly[weekId]) {
    console.log(`\n⚠️  Uživatel již má tip pro kolo "${weekId}": pick1=${existingWeekly[weekId].pick1}, pick2=${existingWeekly[weekId].pick2}`);
    console.log('   Přepisuji…');
  }

  await updateDoc(doc(db, 'picks', targetDoc.id), {
    [`weekly.${weekId}`]: { pick1: 'matej', pick2: 'otakar' },
  });

  console.log(`\n✅ Týdenní tip pro „Hermann Göring" nastaven:`);
  console.log(`   Kolo:  ${weekId}`);
  console.log(`   pick1: matej  (Matěj, Hrdinové)`);
  console.log(`   pick2: otakar (Otakar, Padouši)`);
}

main().catch(err => {
  console.error('❌ Chyba:', err.message);
  process.exit(1);
});
