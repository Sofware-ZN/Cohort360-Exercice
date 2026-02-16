from rest_framework import serializers
from .models import Patient, Medication,Prescription


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "last_name", "first_name", "birth_date"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "code", "label", "status"]


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = "__all__"
    
    def get_patient_full_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
    def validate(self, data):
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                "La date de fin doit être postérieure ou égale à la date de début."
            )

        return data
