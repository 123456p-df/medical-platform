"""The deliberately small account surface used by this deployment."""

FIXED_ACCOUNT_USERNAMES = frozenset(
    {"admin", "demo_doctor", "demo_patient_full", "demo_patient_test"}
)
DEMO_PASSWORD = "123456"

ACCOUNT_PROFILES = {
    "admin": {
        "display_name": "Administrator",
        "title": "System administrator",
        "department": "Platform operations",
    },
    "demo_doctor": {
        "display_name": "Demo Doctor",
        "title": "Radiologist",
        "department": "Medical imaging",
    },
    "demo_patient_full": {
        "display_name": "Complete Demo Patient",
        "title": "Patient",
        "department": "",
    },
    "demo_patient_test": {
        "display_name": "Report Test Patient",
        "title": "Patient",
        "department": "",
    },
}
