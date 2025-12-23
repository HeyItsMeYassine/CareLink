package com.carelink.demo.controller;

import com.carelink.demo.model.Doctor;
import com.carelink.demo.model.Patient;
import com.carelink.demo.service.CareLinkService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class SessionController {

    @Autowired
    private CareLinkService careLinkService;

    // Store logged-in patient in session
    @PostMapping("/api/session/patient")
    @ResponseBody
    public Map<String, Object> setPatientSession(@RequestBody Map<String, String> credentials,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String email = credentials.get("email");
        String password = credentials.get("password");

        System.out.println("=== PATIENT LOGIN ATTEMPT ===");
        System.out.println("Email: " + email);
        System.out.println("Password provided: " + password);

        Patient patient = careLinkService.authenticatePatient(email, password);

        if (patient != null) {
            System.out.println("Patient found: " + patient.getFirstName() + " " + patient.getLastName());
            System.out.println("Patient ID: " + patient.getId());

            // Keep consistent session keys
            session.setAttribute("patientId", patient.getId());
            session.setAttribute("userId", patient.getId()); // COMPATIBILITY: some code uses userId
            session.setAttribute("userType", "patient");

            response.put("success", true);
            response.put("userType", "patient");
            response.put("patientId", patient.getId());
            response.put("userId", patient.getId()); // COMPATIBILITY
            response.put("message", "Login successful");
            response.put("name", patient.getFirstName() + " " + patient.getLastName());
        } else {
            System.out.println("Patient authentication failed");
            response.put("success", false);
            response.put("message", "Invalid email or password");
        }

        return response;
    }

    // Store logged-in doctor in session
    @PostMapping("/api/session/doctor")
    @ResponseBody
    public Map<String, Object> setDoctorSession(@RequestBody Map<String, String> credentials,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String email = credentials.get("email");
        String password = credentials.get("password");

        System.out.println("=== DOCTOR LOGIN ATTEMPT ===");
        System.out.println("Email: " + email);
        System.out.println("Password provided: " + password);

        Doctor doctor = careLinkService.authenticateDoctor(email, password);

        if (doctor != null) {
            System.out.println("Doctor found: " + doctor.getFirstName() + " " + doctor.getLastName());
            System.out.println("Doctor ID: " + doctor.getId());

            // Keep consistent session keys
            session.setAttribute("doctorId", doctor.getId());
            session.setAttribute("userId", doctor.getId()); // COMPATIBILITY: some code uses userId
            session.setAttribute("userType", "doctor");

            response.put("success", true);
            response.put("userType", "doctor");
            response.put("doctorId", doctor.getId());
            response.put("userId", doctor.getId()); // COMPATIBILITY
            response.put("message", "Login successful");
            response.put("name", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
        } else {
            System.out.println("Doctor authentication failed");
            response.put("success", false);
            response.put("message", "Invalid email or password");
        }

        return response;
    }

    /**
     * SINGLE SOURCE OF TRUTH:
     * This endpoint must exist ONLY ONCE across controllers.
     */
    @GetMapping("/api/session/current")
    @ResponseBody
    public Map<String, Object> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String userType = (String) session.getAttribute("userType");

        if ("patient".equals(userType)) {
            String patientId = (String) session.getAttribute("patientId");
            if (patientId == null) {
                // fallback for older code paths
                patientId = (String) session.getAttribute("userId");
            }

            Patient patient = patientId != null ? careLinkService.getPatientById(patientId) : null;

            if (patient != null) {
                response.put("success", true);
                response.put("userType", "patient");
                response.put("id", patient.getId());
                response.put("patientId", patient.getId());
                response.put("userId", patient.getId()); // COMPATIBILITY
                response.put("name", patient.getFirstName() + " " + patient.getLastName());
                response.put("email", patient.getEmail());
            } else {
                response.put("success", false);
                response.put("error", "Patient not found");
            }

        } else if ("doctor".equals(userType)) {
            String doctorId = (String) session.getAttribute("doctorId");
            if (doctorId == null) {
                // fallback for older code paths
                doctorId = (String) session.getAttribute("userId");
            }

            Doctor doctor = doctorId != null ? careLinkService.getDoctorById(doctorId) : null;

            if (doctor != null) {
                response.put("success", true);
                response.put("userType", "doctor");
                response.put("id", doctor.getId());
                response.put("doctorId", doctor.getId());
                response.put("userId", doctor.getId()); // COMPATIBILITY
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

    @GetMapping("/api/session/logout")
    @ResponseBody
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return response;
    }

    // Debug endpoint to see what users exist
    @GetMapping("/api/debug/users")
    @ResponseBody
    public Map<String, Object> debugUsers() {
        Map<String, Object> response = new HashMap<>();

        try {
            Patient testPatient = careLinkService.authenticatePatient("test@test.com", "test123");
            Doctor testDoctor = careLinkService.authenticateDoctor("doctor@test.com", "test123");

            response.put("testPatient", testPatient != null ? "Found: " + testPatient.getEmail() : "Not found");
            response.put("testDoctor", testDoctor != null ? "Found: " + testDoctor.getEmail() : "Not found");

            response.put("totalPatients", careLinkService.getAllPatients().size());
            response.put("totalDoctors", careLinkService.getAllDoctors().size());

            List<Patient> patients = careLinkService.getAllPatients();
            List<Doctor> doctors = careLinkService.getAllDoctors();

            List<String> patientEmails = patients.stream()
                    .limit(3)
                    .map(Patient::getEmail)
                    .collect(Collectors.toList());

            List<String> doctorEmails = doctors.stream()
                    .limit(3)
                    .map(Doctor::getEmail)
                    .collect(Collectors.toList());

            response.put("samplePatientEmails", patientEmails);
            response.put("sampleDoctorEmails", doctorEmails);
            response.put("testCredentials", "Try: test@test.com / test123 or doctor@test.com / test123");

        } catch (Exception e) {
            response.put("error", e.getMessage());
            e.printStackTrace();
        }

        return response;
    }
}
