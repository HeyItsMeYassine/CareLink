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
 * Contrôleur chargé de la gestion de l'authentification
 * des patients et des médecins.
 */
@Controller
public class LoginController {

    /**
     * Service principal de l'application, utilisé pour
     * l'authentification des utilisateurs.
     */
    @Autowired
    private CareLinkService careLinkService;

    /**
     * Affiche la page de connexion.
     *
     * @return vue "login"
     */
    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    /**
     * Authentifie un patient à partir de ses identifiants.
     *
     * @param credentials email et mot de passe
     * @return réponse JSON indiquant le résultat de la connexion
     */
    @PostMapping("/login/patient")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> loginPatient(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();

        String email = credentials.get("email");
        String password = credentials.get("password");

        Patient patient = careLinkService.authenticatePatient(email, password);

        if (patient != null) {
            response.put("success", true);
            response.put("patientId", patient.getId());
            response.put("patientName", patient.getFirstName() + " " + patient.getLastName());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Authentifie un médecin à partir de ses identifiants.
     *
     * @param credentials email et mot de passe
     * @return réponse JSON indiquant le résultat de la connexion
     */
    @PostMapping("/login/doctor")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> loginDoctor(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();

        String email = credentials.get("email");
        String password = credentials.get("password");

        Doctor doctor = careLinkService.authenticateDoctor(email, password);

        if (doctor != null) {
            response.put("success", true);
            response.put("doctorId", doctor.getId());
            response.put("doctorName", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Déconnecte l'utilisateur et le redirige
     * vers la page de connexion.
     *
     * @return redirection vers /login
     */
    @GetMapping("/logout")
    public String logout() {
        return "redirect:/login";
    }
}
