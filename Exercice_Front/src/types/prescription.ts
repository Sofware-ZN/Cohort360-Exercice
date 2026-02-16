export type Prescription ={
  id: number;
  patient: number;
  medication: number;
  start_date: string;
  end_date: string;
  status: "valide" | "en_attente" | "suppr";
  comment: string;
  created_at: string;
  updated_at: string;
}

export type PrescriptionDetail = Prescription & {
  patient_data?: {
    id: number;
    last_name: string;
    first_name: string;
    birth_date: string;
  };
  medication_data?: {
    id: number;
    code: string;
    label: string;
    status: string;
  };
}

export type PrescriptionFilter = {
  patient?: number;
  medication?: number;
  status?: "valide" | "en_attente" | "suppr";
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}
