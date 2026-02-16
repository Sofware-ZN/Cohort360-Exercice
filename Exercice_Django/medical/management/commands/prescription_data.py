import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from medical.models import Patient, Medication, Prescription


class Command(BaseCommand):
    Prescription.objects.all().delete()
    help = "Crée des prescriptions de démonstration"

    def add_arguments(self, parser):
        parser.add_argument("--prescription", type=int, default=30)

    def handle(self, *args, **options):
        n_prescription = options["prescription"]

        patients = list(Patient.objects.all())
        medications = list(Medication.objects.filter(status=Medication.STATUS_ACTIF))

        statuses = [
            Prescription.STATUS_VALIDE,
            Prescription.STATUS_EN_ATTENTE,
            Prescription.STATUS_SUPPR,
        ]

        for _ in range(n_prescription):
            patient = random.choice(patients)
            medication = random.choice(medications)

            start = date.today() - timedelta(days=random.randint(0, 365))
            end = start + timedelta(days=random.randint(5, 90))

            Prescription.objects.create(
                patient=patient,
                medication=medication,
                start_date=start,
                end_date=end,
                status=random.choice(statuses),
                comment="Prescription de démonstration",
            )

        self.stdout.write(self.style.SUCCESS(
            f"{n_prescription} prescriptions créées."
        ))
