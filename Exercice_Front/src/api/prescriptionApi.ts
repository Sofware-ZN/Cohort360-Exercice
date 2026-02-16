import type { Prescription, PrescriptionFilter } from "../types/prescription";

const API_URL = "http://localhost:8000";

interface ApiResponse<T> {
  results?: T[];
  count?: number;
  next?: string;
  previous?: string;
  [key: string]: any;
}

/* Récupère la liste des prescriptions avec filtrage optionnel */

export async function getPrescriptions(
  filters?: PrescriptionFilter,
  page?: number,
  pageSize?: number
): Promise<ApiResponse<Prescription>> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.patient) params.append("patient", filters.patient.toString());
    if (filters.medication) params.append("medication", filters.medication.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.start_date_from) params.append("start_date_from", filters.start_date_from);
    if (filters.start_date_to) params.append("start_date_to", filters.start_date_to);
    if (filters.end_date_from) params.append("end_date_from", filters.end_date_from);
    if (filters.end_date_to) params.append("end_date_to", filters.end_date_to);
  }

  if (page) params.append("page", page.toString());
  if (pageSize) params.append("page_size", pageSize.toString());

  const query = params.toString();
  const url = query ? `${API_URL}/prescription?${query}` : `${API_URL}/prescription`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  return response.json();
}

/**
 * Récupère une prescription par ID
 */
export async function getPrescriptionById(id: number): Promise<Prescription> {
  const response = await fetch(`${API_URL}/prescription/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  return response.json();
}

/**
 * Crée une nouvelle prescription
 */
export async function createPrescription(prescription: Omit<Prescription, "id" | "created_at" | "updated_at">): Promise<Prescription> {
  const response = await fetch(`${API_URL}/prescription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.non_field_errors || `Erreur API: ${response.status}`);
  }
  return response.json();
}

/**
 * Mise à jour d'une prescription
 */
export async function updatePrescription(id: number, prescription: Partial<Omit<Prescription, "id" | "created_at" | "updated_at">>): Promise<Prescription> {
  const response = await fetch(`${API_URL}/prescription/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `Erreur API: ${response.status}`);
  }
  return response.json();
}

/**
 * Suppression d'une prescription
 */
export async function deletePrescription(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/prescription/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
}
