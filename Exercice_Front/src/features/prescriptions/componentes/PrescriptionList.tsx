import { useEffect, useState } from "react";
import type { Prescription } from "../../../types/prescription";
import type { PrescriptionFilter } from "../../../types/prescription";
import type { Patient } from "../../../types/patient";
import type { Medication } from "../../../types/medication";

interface PrescriptionQuery extends PrescriptionFilter {
  _page: number;
  _limit: number;
}
import { getPrescriptions, deletePrescription } from "../../../api/prescriptionApi";
import { getPatients } from "../../../api/patientApi";
import { getMedications } from "../../../api/medicationApi";
import "./PrescriptionList.css";

interface PrescriptionListProps {
  onEdit?: (prescription: Prescription) => void;
  onAdd?: () => void;
}

export function PrescriptionList({ onEdit, onAdd }: PrescriptionListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // État des filtres
  const [filters, setFilters] = useState<PrescriptionFilter>({});
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [patientFilter, setPatientFilter] = useState<string>("");
  const [medicationFilter, setMedicationFilter] = useState<string>("");
  const [startDateFrom, setStartDateFrom] = useState<string>("");
  const [startDateTo, setStartDateTo] = useState<string>("");
  const [endDateFrom, setEndDateFrom] = useState<string>("");
  const [endDateTo, setEndDateTo] = useState<string>("");

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, []);

  // Charger les prescriptions avec filtres
  useEffect(() => {
    loadPrescriptions();
  }, [filters, currentPage]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, medicationsData] = await Promise.all([
        getPatients(),
        getMedications(),
      ]);
      setPatients(patientsData);
      setMedications(medicationsData);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPrescriptions() {
    try {
      setLoading(true);
      setError(null);
      const query: PrescriptionQuery = {
        ...filters,
        _page: currentPage,
        _limit: ITEMS_PER_PAGE,
      };
      const response = await getPrescriptions(query);

      // Vérification du format de la réponse pour éviter les erreurs si l'API renvoie un tableau direct
      if (Array.isArray(response)) {
        // Si l'API renvoie un tableau, on vérifie si elle a renvoyé toutes les données (pagination client)
        if (response.length > ITEMS_PER_PAGE) {
          setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          setPrescriptions(response.slice(startIndex, startIndex + ITEMS_PER_PAGE));
        } else {
          setPrescriptions(response);
          setTotalPages(1);
        }
      } else {
        setPrescriptions(response.data || []);
        // Supporte 'total', 'count' ou 'totalCount' selon l'API
        const total = response.total || response.count || response.totalCount || 0;
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setError("Erreur lors du chargement des prescriptions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFilters() {
    const newFilters: PrescriptionFilter = {};
    if (patientFilter) newFilters.patient = parseInt(patientFilter);
    if (medicationFilter) newFilters.medication = parseInt(medicationFilter);
    if (statusFilter) newFilters.status = statusFilter as any;
    if (startDateFrom) newFilters.start_date_from = startDateFrom;
    if (startDateTo) newFilters.start_date_to = startDateTo;
    if (endDateFrom) newFilters.end_date_from = endDateFrom;
    if (endDateTo) newFilters.end_date_to = endDateTo;

    setFilters(newFilters);
    setCurrentPage(1);
  }

  function handleClearFilters() {
    setStatusFilter("");
    setPatientFilter("");
    setMedicationFilter("");
    setStartDateFrom("");
    setStartDateTo("");
    setEndDateFrom("");
    setEndDateTo("");
    setFilters({});
    setCurrentPage(1);
  }

  async function handleDelete(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette prescription ?")) {
      try {
        await deletePrescription(id);
        loadPrescriptions();
      } catch (err) {
        setError("Erreur lors de la suppression");
        console.error(err);
      }
    }
  }

  function getPatientName(patientId: number): string {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Inconnu";
  }

  function getMedicationLabel(medicationId: number): string {
    const medication = medications.find((m) => m.id === medicationId);
    return medication ? medication.label : "Inconnu";
  }

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case "valide":
        return "badge-success";
      case "en_attente":
        return "badge-warning";
      case "suppr":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  }

  if (loading && prescriptions.length === 0) {
    return <div className="prescription-list">Chargement...</div>;
  }

  return (
    <div className="prescription-list">
      <div className="prescription-header">
        <h2>Prescriptions</h2>
        {onAdd && (
          <button className="btn btn-primary" onClick={onAdd}>
            + Nouvelle Prescription
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-section">
        <h3>Filtres</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label>Patient</label>
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            >
              <option value="">Tous les patients</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Médicament</label>
            <select
              value={medicationFilter}
              onChange={(e) => setMedicationFilter(e.target.value)}
            >
              <option value="">Tous les médicaments</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="valide">Valide</option>
              <option value="en_attente">En attente</option>
              <option value="suppr">Supprimé</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Date de début: du</label>
            <input
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>au</label>
            <input
              type="date"
              value={startDateTo}
              onChange={(e) => setStartDateTo(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date de fin: du</label>
            <input
              type="date"
              value={endDateFrom}
              onChange={(e) => setEndDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>au</label>
            <input
              type="date"
              value={endDateTo}
              onChange={(e) => setEndDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-buttons">
          <button className="btn btn-secondary" onClick={handleApplyFilters}>
            Appliquer les filtres
          </button>
          <button className="btn btn-light" onClick={handleClearFilters}>
            Réinitialiser
          </button>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <p>Aucune prescription trouvée</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Patient (Prénom Nom)</th>
                <th>Médicament</th>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Statut</th>
                <th>Commentaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{getPatientName(prescription.patient)}</td>
                  <td>{getMedicationLabel(prescription.medication)}</td>
                  <td>{new Date(prescription.start_date).toLocaleDateString("fr-FR")}</td>
                  <td>{new Date(prescription.end_date).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(prescription.status)}`}>
                      {prescription.status === "en_attente" ? "En attente" : prescription.status === "valide" ? "Valide" : "Supprimé"}
                    </span>
                  </td>
                  <td className="comment-cell">{prescription.comment || "-"}</td>
                  <td className="actions-cell">
                    {onEdit && (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => onEdit(prescription)}
                      >
                        Modifier
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(prescription.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="btn btn-light"
          >
            Précédent
          </button>
          <span> Page {currentPage} sur {totalPages} </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="btn btn-light"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
