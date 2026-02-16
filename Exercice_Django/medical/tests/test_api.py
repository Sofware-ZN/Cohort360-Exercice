from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient,APITestCase

from rest_framework import status
from datetime import date

from medical.models import Patient, Medication, Prescription


class ApiListTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Patients
        Patient.objects.create(last_name="Martin", first_name="Jeanne", birth_date="1992-03-10")
        Patient.objects.create(last_name="Durand", first_name="Jean", birth_date="1980-05-20")
        Patient.objects.create(last_name="Bernard", first_name="Paul")

        # Medications
        Medication.objects.create(code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF)
        Medication.objects.create(code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_SUPPR)

    def test_patient_list(self):
        url = reverse("patient-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 3)

    def test_patient_filter_nom(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"nom": "mart"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all("mart" in p["last_name"].lower() for p in data))

    def test_patient_filter_date(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"date_naissance": "1980-05-20"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(p["birth_date"] == "1980-05-20" for p in data))

    def test_medication_list(self):
        url = reverse("medication-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 2)

    def test_medication_filter_status(self):
        url = reverse("medication-list")
        r = self.client.get(url, {"status": "actif"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(m["status"] == "actif" for m in data))


class PrescriptionApiTests(APITestCase):
    def setUp(self):
        # Patients
        self.patient1 = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.patient2 = Patient.objects.create(
            last_name="Durand", first_name="Jean", birth_date="1980-05-20"
        )

        # Medications
        self.med1 = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg",
            status=Medication.STATUS_ACTIF
        )
        self.med2 = Medication.objects.create(
            code="IBU200", label="Ibuprofène 200mg",
            status=Medication.STATUS_ACTIF
        )

        # Prescription existante
        self.prescription = Prescription.objects.create(
            patient=self.patient1,
            medication=self.med1,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 10),
            status=Prescription.STATUS_VALIDE,
            comment="Test initial"
        )

    def test_create_prescription_valid(self):
        url = reverse("prescription-list")

        data = {
            "patient": self.patient1.id,
            "medication": self.med2.id,
            "start_date": "2025-02-01",
            "end_date": "2025-02-10",
            "status": "en_attente",
            "comment": "Nouvelle prescription"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Prescription.objects.count(), 2)
    
    def test_create_prescription_invalid_dates(self):
        url = reverse("prescription-list")

        data = {
            "patient": self.patient1.id,
            "medication": self.med2.id,
            "start_date": "2025-02-10",
            "end_date": "2025-02-01",  # invalide
            "status": "valide"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_prescription_invalid_patient(self):
        url = reverse("prescription-list")

        data = {
            "patient": 9999,
            "medication": self.med2.id,
            "start_date": "2025-02-01",
            "end_date": "2025-02-10",
            "status": "valide"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_prescriptions(self):
        url = reverse("prescription-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 1)

    def test_filter_by_patient(self):
        url = reverse("prescription-list")
        response = self.client.get(url, {"patient": self.patient1.id})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(
            p["patient"] == self.patient1.id
            for p in response.json()
        ))

    def test_filter_by_status(self):
        url = reverse("prescription-list")
        response = self.client.get(url, {"status": "valide"})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(all(
            p["status"] == "valide"
            for p in response.json()
        ))
    
    def test_filter_by_date_range(self):
        url = reverse("prescription-list")

        response = self.client.get(url, {
            "start_date_from": "2025-01-01",
            "start_date_to": "2025-12-31",
        })

        self.assertEqual(response.status_code, 200)
    
    def test_update_invalid_dates(self):
        url = reverse("prescription-detail", args=[self.prescription.id])

        response = self.client.patch(url, {
            "start_date": "2025-05-10",
            "end_date": "2025-01-01"
        })

        self.assertEqual(response.status_code, 400)