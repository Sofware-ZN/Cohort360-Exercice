import type { Medication } from "../types/medication";

const API_URL = "http://localhost:8000";


/* Récupère la liste de tous les médicaments */

export async function getMedications() {
  const response = await fetch(`${API_URL}/Medication`);
  if (!response.ok) throw new Error("Failed to fetch medications");
  return response.json(); // Retourne directement la liste
}

/* Récupère un médicament par ID */

export async function getMedicationById(id: number): Promise<Medication> {
  const response = await fetch(`${API_URL}/Medication/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  return response.json();
}
