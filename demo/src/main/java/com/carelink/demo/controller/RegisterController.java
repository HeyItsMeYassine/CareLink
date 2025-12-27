package com.carelink.demo.controller;

import com.carelink.demo.model.Doctor;
import com.carelink.demo.model.Patient;
import com.carelink.demo.service.CareLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur responsable de l'inscription (patient et médecin).
 * Fournit la page d'inscription et les endpoints REST associés.
 */
@Controller
public class RegisterController {

    @Autowired
    private CareLinkService careLinkService;

    /** Affiche la page d'inscription. */
    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
    }

    /**
     * Inscription d'un patient via une requête JSON.
     *
     * @param patientData données du formulaire (JSON)
     * @return réponse JSON indiquant succès/échec
     */
    @PostMapping("/register/patient")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> registerPatient(@RequestBody Map<String, String> patientData) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Vérifie la présence et la validité des champs obligatoires
            if (!validatePatientData(patientData)) {
                response.put("success", false);
                response.put("message", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            // Construction de l'objet Patient à partir des données reçues
            Patient patient = new Patient();
            patient.setFirstName(patientData.get("firstName"));
            patient.setLastName(patientData.get("lastName"));
            patient.setEmail(patientData.get("email"));
            patient.setPasswordHash(patientData.get("password"));
            patient.setPhone(patientData.get("phone"));

            // Le formulaire envoie "sex" tandis que le modèle utilise "sexe"
            patient.setSexe(patientData.get("sex"));

            patient.setWilaya(patientData.get("wilaya"));
            patient.setCity(patientData.get("city"));

            // Appel du service pour enregistrer le patient
            Patient registeredPatient = careLinkService.registerPatient(patient);

            if (registeredPatient != null) {
                response.put("success", true);
                response.put("patientId", registeredPatient.getId());
                response.put("message", "Patient registered successfully");
                return ResponseEntity.ok(response);
            }

            response.put("success", false);
            response.put("message", "Registration failed - could not create patient");
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Inscription d'un médecin via une requête JSON.
     *
     * @param doctorData données du formulaire (JSON)
     * @return réponse JSON indiquant succès/échec
     */
    @PostMapping("/register/doctor")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> registerDoctor(@RequestBody Map<String, String> doctorData) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Vérifie la présence et la validité des champs obligatoires
            if (!validateDoctorData(doctorData)) {
                response.put("success", false);
                response.put("message", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            // Construction de l'objet Doctor à partir des données reçues
            Doctor doctor = new Doctor();
            doctor.setFirstName(doctorData.get("firstName"));
            doctor.setLastName(doctorData.get("lastName"));
            doctor.setEmail(doctorData.get("email"));
            doctor.setPasswordHash(doctorData.get("password"));
            doctor.setPhone(doctorData.get("phone"));

            // Le formulaire envoie "sex" tandis que le modèle utilise "sexe"
            doctor.setSexe(doctorData.get("sex"));

            doctor.setWilaya(doctorData.get("wilaya"));
            doctor.setCity(doctorData.get("city"));
            doctor.setSpeciality(doctorData.get("specialty"));

            // Lien de localisation : optionnel
            String locationLink = doctorData.get("locationLink");
            if (locationLink != null && !locationLink.trim().isEmpty()) {
                doctor.setLocationLink(locationLink.trim());
            }

            // Appel du service pour enregistrer le médecin
            Doctor registeredDoctor = careLinkService.registerDoctor(doctor);

            if (registeredDoctor != null) {
                response.put("success", true);
                response.put("doctorId", registeredDoctor.getId());
                response.put("message", "Doctor registered successfully");
                return ResponseEntity.ok(response);
            }

            response.put("success", false);
            response.put("message", "Registration failed - could not create doctor");
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Vérifie les champs obligatoires d'un patient et le format de l'email.
     */
    private boolean validatePatientData(Map<String, String> data) {
        String[] requiredFields = { "firstName", "lastName", "email", "password", "phone", "sex", "wilaya", "city" };

        for (String field : requiredFields) {
            String value = data.get(field);
            if (value == null || value.trim().isEmpty()) {
                return false;
            }
        }

        return isValidEmail(data.get("email"));
    }

    /**
     * Vérifie les champs obligatoires d'un médecin et le format de l'email.
     */
    private boolean validateDoctorData(Map<String, String> data) {
        String[] requiredFields = { "firstName", "lastName", "email", "password", "phone", "sex", "wilaya", "city",
                "specialty" };

        for (String field : requiredFields) {
            String value = data.get(field);
            if (value == null || value.trim().isEmpty()) {
                return false;
            }
        }

        return isValidEmail(data.get("email"));
    }

    /**
     * Validation simple d'un email (format général).
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }
}
