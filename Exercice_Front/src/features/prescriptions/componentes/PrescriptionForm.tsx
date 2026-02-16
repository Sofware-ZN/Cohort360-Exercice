import { useState, useEffect } from "react";
import type { Prescription } from "../../../types/prescription";
import type { Patient } from "../../../types/patient";
import type { Medication } from "../../../types/medication";
import { createPrescription, updatePrescription } from "../../../api/prescriptionApi";
import { getPatients } from "../../../api/patientApi";
import { getMedications } from "../../../api/medicationApi";
import "./PrescriptionForm.css";

interface PrescriptionFormProps {
  prescription?: Prescription;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PrescriptionForm({
  prescription,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState({
    patient: prescription?.patient || "",
    medication: prescription?.medication || "",
    start_date: prescription?.start_date || "",
    end_date: prescription?.end_date || "",
    status: prescription?.status || "en_attente",
    comment: prescription?.comment || "",
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [patientsData, medicationsData] = await Promise.all([
        getPatients(),
        getMedications(),
      ]);
      setPatients(patientsData);
      setMedications(medicationsData);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.patient) {
        throw new Error("Veuillez sélectionner un patient");
      }
      if (!formData.medication) {
        throw new Error("Veuillez sélectionner un médicament");
      }
      if (!formData.start_date) {
        throw new Error("Veuillez entrer une date de début");
      }
      if (!formData.end_date) {
        throw new Error("Veuillez entrer une date de fin");
      }

      const submissionData = {
        patient: parseInt(String(formData.patient)),
        medication: parseInt(String(formData.medication)),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status as "valide" | "en_attente" | "suppr",
        comment: formData.comment,
      };

      if (prescription?.id) {
        await updatePrescription(prescription.id, submissionData);
      } else {
        await createPrescription(submissionData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="prescription-form-container">
      <div className="form-backdrop" onClick={onCancel}></div>
      <div className="form-modal">
        <div className="form-header">
          <h2>{prescription?.id ? "Modifier la prescription" : "Nouvelle prescription"}</h2>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patient">
              Patient <span className="required">*</span>
            </label>
            <select
              id="patient"
              name="patient"
              value={formData.patient}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionnez un patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="medication">
              Médicament <span className="required">*</span>
            </label>
            <select
              id="medication"
              name="medication"
              value={formData.medication}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionnez un médicament</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">
                Date de début <span className="required">*</span>
              </label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">
                Date de fin <span className="required">*</span>
              </label>
              <input
                id="end_date"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Statut <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="en_attente">En attente</option>
              <option value="valide">Valide</option>
              <option value="suppr">Supprimé</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Commentaire</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={4}
              placeholder="Commentaire optionnel..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
