// src/services/academicService.js
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../utils/firebase";

export function calculateFinalAverage(grades) {
  if (!grades || grades.length === 0) return null;
  const validGrades = grades.filter((g) => typeof g.grade === "number");
  if (validGrades.length === 0) return null;
  const sum = validGrades.reduce((acc, g) => acc + g.grade, 0);
  return Number((sum / validGrades.length).toFixed(1));
}

export function getAcademicStatus(finalAverage, attendance) {
  const unjustified = attendance?.unjustifiedAbsences || 0;

  if (finalAverage === null) return "amarelo";
  if (finalAverage < 10 || unjustified >= 5) return "vermelho";
  if (finalAverage >= 14 && unjustified === 0) return "verde";
  return "amarelo";
}

export async function getAcademicRecord(athleteId, academicYear, term) {
  const colRef = collection(db, "atletas", athleteId, "academico");
  const q = query(
    colRef,
    where("academicYear", "==", academicYear),
    where("term", "==", term)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getAcademicRecordsByAthlete(athleteId) {
  const colRef = collection(db, "atletas", athleteId, "academico");
  const q = query(colRef, orderBy("academicYear", "desc"), orderBy("term", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function saveAcademicRecord(athleteId, record) {
  const finalAverage = calculateFinalAverage(record.grades);
  const academicStatus = getAcademicStatus(finalAverage, record.attendance);

  const colRef = collection(db, "atletas", athleteId, "academico");
  const docRef = record.id ? doc(colRef, record.id) : doc(colRef);

  const data = {
    ...record,
    finalAverage,
    academicStatus,
    updatedAt: serverTimestamp(),
  };

  if (!record.id) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(docRef, data, { merge: true });
  return docRef.id;
}
