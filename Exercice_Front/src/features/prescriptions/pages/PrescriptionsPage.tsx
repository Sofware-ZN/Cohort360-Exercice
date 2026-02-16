import { useState } from "react";
import type { Prescription } from "../../../types/prescription";
import { PrescriptionList } from "../componentes/PrescriptionList";
import { PrescriptionForm } from "../componentes/PrescriptionForm";
import "./PrescriptionsPage.css";

export function PrescriptionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  function handleAddPrescription() {
    setSelectedPrescription(undefined);
    setShowForm(true);
  }

  function handleEditPrescription(prescription: Prescription) {
    setSelectedPrescription(prescription);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setSelectedPrescription(undefined);
    setRefreshKey((prev) => prev + 1);
  }

  function handleFormCancel() {
    setShowForm(false);
    setSelectedPrescription(undefined);
  }

  return (
    <div className="prescriptions-page">
      <PrescriptionList
        key={refreshKey}
        onAdd={handleAddPrescription}
        onEdit={handleEditPrescription}
      />

      {showForm && (
        <PrescriptionForm
          prescription={selectedPrescription}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
