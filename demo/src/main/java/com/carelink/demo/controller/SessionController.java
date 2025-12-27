package com.carelink.demo.controller;

import com.carelink.demo.model.Doctor;
import com.carelink.demo.model.Patient;
import com.carelink.demo.service.CareLinkService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur dédié à la session utilisateur.
 * Il gère l'ouverture de session (patient/médecin), la récupération de
 * l'utilisateur courant et la déconnexion.
 */
@Controller
public class SessionController {

    @Autowired
    private CareLinkService careLinkService;

    /**
     * Authentifie un patient et enregistre ses informations en session.
     *
     * @param credentials email et mot de passe
     * @param session     session HTTP
     * @return réponse JSON indiquant le résultat
     */
    @PostMapping("/api/session/patient")
    @ResponseBody
    public Map<String, Object> setPatientSession(@RequestBody Map<String, String> credentials,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String email = credentials.get("email");
        String password = credentials.get("password");

        Patient patient = careLinkService.authenticatePatient(email, password);

        if (patient != null) {
            // Identifiants conservés en session pour les appels suivants
            session.setAttribute("patientId", patient.getId());
            session.setAttribute("userId", patient.getId()); // clé commune utilisée ailleurs
            session.setAttribute("userType", "patient");

            response.put("success", true);
            response.put("userType", "patient");
            response.put("patientId", patient.getId());
            response.put("userId", patient.getId());
            response.put("name", patient.getFirstName() + " " + patient.getLastName());
            response.put("message", "Login successful");
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
        }

        return response;
    }

    /**
     * Authentifie un médecin et enregistre ses informations en session.
     *
     * @param credentials email et mot de passe
     * @param session     session HTTP
     * @return réponse JSON indiquant le résultat
     */
    @PostMapping("/api/session/doctor")
    @ResponseBody
    public Map<String, Object> setDoctorSession(@RequestBody Map<String, String> credentials,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String email = credentials.get("email");
        String password = credentials.get("password");

        Doctor doctor = careLinkService.authenticateDoctor(email, password);

        if (doctor != null) {
            // Identifiants conservés en session pour les appels suivants
            session.setAttribute("doctorId", doctor.getId());
            session.setAttribute("userId", doctor.getId()); // clé commune utilisée ailleurs
            session.setAttribute("userType", "doctor");

            response.put("success", true);
            response.put("userType", "doctor");
            response.put("doctorId", doctor.getId());
            response.put("userId", doctor.getId());
            response.put("name", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
            response.put("message", "Login successful");
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
        }

        return response;
    }

    /**
     * Retourne l'utilisateur actuellement connecté, selon les informations de
     * session.
     *
     * @param session session HTTP
     * @return informations JSON (type, id, nom, email, etc.)
     */
    @GetMapping("/api/session/current")
    @ResponseBody
    public Map<String, Object> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String userType = (String) session.getAttribute("userType");

        if ("patient".equals(userType)) {
            String patientId = (String) session.getAttribute("patientId");
            if (patientId == null)
                patientId = (String) session.getAttribute("userId");

            Patient patient = (patientId != null) ? careLinkService.getPatientById(patientId) : null;

            if (patient != null) {
                response.put("success", true);
                response.put("userType", "patient");
                response.put("id", patient.getId());
                response.put("patientId", patient.getId());
                response.put("userId", patient.getId());
                response.put("name", patient.getFirstName() + " " + patient.getLastName());
                response.put("email", patient.getEmail());
            } else {
                response.put("success", false);
                response.put("error", "Patient not found");
            }

        } else if ("doctor".equals(userType)) {
            String doctorId = (String) session.getAttribute("doctorId");
            if (doctorId == null)
                doctorId = (String) session.getAttribute("userId");

            Doctor doctor = (doctorId != null) ? careLinkService.getDoctorById(doctorId) : null;

            if (doctor != null) {
                response.put("success", true);
                response.put("userType", "doctor");
                response.put("id", doctor.getId());
                response.put("doctorId", doctor.getId());
                response.put("userId", doctor.getId());
                response.put("name", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
                response.put("email", doctor.getEmail());
                response.put("specialty", doctor.getSpeciality());
            } else {
                response.put("success", false);
                response.put("error", "Doctor not found");
            }

        } else {
            response.put("success", false);
            response.put("message", "No user logged in");
        }

        return response;
    }

    /**
     * Déconnecte l'utilisateur en invalidant la session.
     *
     * @param session session HTTP
     * @return confirmation JSON
     */
    @GetMapping("/api/session/logout")
    @ResponseBody
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return response;
    }
}
