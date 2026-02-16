from django.db import models
from django.core.exceptions import ValidationError


class Patient(models.Model):
    """Représente un patient."""

    last_name = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["last_name", "first_name", "id"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.last_name} {self.first_name}"


class Medication(models.Model):
    """Représente un médicament."""

    STATUS_ACTIF = "actif"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_ACTIF, "actif"),
        (STATUS_SUPPR, "suppr"),
    )

    code = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=255)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIF)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.code} - {self.label} ({self.status})"


class Prescription(models.Model):
    """Représente une prescription médicamenteuse pour un patient."""

    STATUS_VALIDE = "valide"
    STATUS_EN_ATTENTE = "en_attente"
    STATUS_SUPPR = "suppr"

    STATUS_CHOICES = (
        (STATUS_VALIDE, "valide"),
        (STATUS_EN_ATTENTE, "en_attente"),
        (STATUS_SUPPR, "suppr"),
    )

    patient = models.ForeignKey("Patient",on_delete=models.CASCADE,related_name="prescriptions")
    medication = models.ForeignKey("Medication",on_delete=models.PROTECT,related_name="prescriptions")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20,choices=STATUS_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date", "patient"]

    def clean(self):
        """Validation métier."""
        if self.end_date < self.start_date:
            raise ValidationError(
                {"end_date": "La date de fin doit être postérieure ou égale à la date de début."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()  # empêche la sauvegarde si invalide
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient} - {self.medication} ({self.status})"
