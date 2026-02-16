import type { Patient } from "../types/patient";

const API_URL = "http://localhost:8000";

/* Récupère la liste de tous les patients */

export async function getPatients() {
  const response = await fetch(`${API_URL}/Patient`);
  if (!response.ok) throw new Error("Failed to fetch patients");
  return response.json(); // Retourne directement la liste
}

/* Récupère un patient par ID */

export async function getPatientById(id: number): Promise<Patient> {
  const response = await fetch(`${API_URL}/Patient/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  return response.json();
}
