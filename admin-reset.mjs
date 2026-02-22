/**
 * admin-reset.mjs
 *
 * 1. Smaže týdenní tipy (pole `weekly`) u všech uživatelů v kolekci `picks`
 * 2. Nahradí všechna kola v `game/state` jediným novým kolem č. 1
 *    s deadlinem 23. 2. 2026 20:00
 *
 * Spuštění: node admin-reset.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteField,
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
  // ── 1. Smazat týdenní tipy u všech uživatelů ─────────────────────────────
  console.log('📋 Načítám kolekci picks…');
  const picksSnap = await getDocs(collection(db, 'picks'));
  console.log(`   Nalezeno ${picksSnap.size} uživatelů`);

  let cleared = 0;
  for (const userDoc of picksSnap.docs) {
    const data = userDoc.data();
    if (data.weekly && Object.keys(data.weekly).length > 0) {
      await updateDoc(doc(db, 'picks', userDoc.id), { weekly: deleteField() });
      console.log(`   ✓ Vymazány tipy: ${data.nick || userDoc.id}`);
      cleared++;
    }
  }
  console.log(`\n✅ Smazáno týdenních tipů u ${cleared} uživatelů\n`);

  // ── 2. Reset kol — smaž vše, vytvoř jediné kolo č. 1 ─────────────────────
  console.log('📋 Načítám game/state…');
  const stateRef  = doc(db, 'game', 'state');
  const stateSnap = await getDoc(stateRef);

  if (!stateSnap.exists()) {
    console.error('❌ Dokument game/state neexistuje!');
    process.exit(1);
  }

  const state = stateSnap.data();
  const oldWeeks = state.weeks || [];
  console.log(`   Mažu ${oldWeeks.length} stávajících kol`);

  const newWeek = {
    id:      'w' + Date.now(),
    weekNum: 1,
    label:   '1. kolo',
    deadline: '2026-02-23T20:00',
    closed:  false,
    results: [],
  };

  await setDoc(stateRef, { ...state, weeks: [newWeek] });
  console.log(`✅ Vytvořeno kolo č. 1 s deadlinem 2026-02-23T20:00`);
}

main().catch(err => {
  console.error('❌ Chyba:', err.message);
  process.exit(1);
});
