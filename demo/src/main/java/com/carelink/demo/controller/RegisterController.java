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

@Controller
public class RegisterController {

    @Autowired
    private CareLinkService careLinkService;

    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
    }

    // Debug endpoint to test registration
    @GetMapping("/api/debug/register")
    @ResponseBody
    public Map<String, Object> debugRegister() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration endpoints are available");
        response.put("patientEndpoint", "POST /register/patient");
        response.put("doctorEndpoint", "POST /register/doctor");

        // Test data examples
        Map<String, String> testPatient = new HashMap<>();
        testPatient.put("firstName", "Test");
        testPatient.put("lastName", "Patient");
        testPatient.put("email", "test.patient@example.com");
        testPatient.put("password", "password123");
        testPatient.put("phone", "555-0100");
        testPatient.put("sex", "Male");
        testPatient.put("wilaya", "Alger");
        testPatient.put("city", "Alger Centre");

        Map<String, String> testDoctor = new HashMap<>();
        testDoctor.put("firstName", "Test");
        testDoctor.put("lastName", "Doctor");
        testDoctor.put("email", "test.doctor@example.com");
        testDoctor.put("password", "password123");
        testDoctor.put("phone", "555-0200");
        testDoctor.put("sex", "Male");
        testDoctor.put("wilaya", "Alger");
        testDoctor.put("city", "Alger Centre");
        testDoctor.put("specialty", "General Medicine");
        testDoctor.put("locationLink", "https://maps.google.com");

        response.put("testPatient", testPatient);
        response.put("testDoctor", testDoctor);

        return response;
    }

    // API endpoint for patient registration
    @PostMapping("/register/patient")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> registerPatient(@RequestBody Map<String, String> patientData) {
        Map<String, Object> response = new HashMap<>();

        System.out.println("=== PATIENT REGISTRATION ATTEMPT ===");
        System.out.println("Received patient data: " + patientData);

        try {
            // Validate required fields
            if (!validatePatientData(patientData)) {
                response.put("success", false);
                response.put("message", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            Patient patient = new Patient();
            patient.setFirstName(patientData.get("firstName"));
            patient.setLastName(patientData.get("lastName"));
            patient.setEmail(patientData.get("email"));

            // Use setPassword() instead of setPasswordHash() if that's your method name
            // Check your Patient model class for the correct method name
            String password = patientData.get("password");
            patient.setPasswordHash(password); // This might be setPassword() in your model
            patient.setPhone(patientData.get("phone"));
            patient.setSexe(patientData.get("sex")); // Note: form sends "sex" but model expects "sexe"
            patient.setWilaya(patientData.get("wilaya"));
            patient.setCity(patientData.get("city"));

            System.out.println("Creating patient object: " + patient);

            Patient registeredPatient = careLinkService.registerPatient(patient);

            if (registeredPatient != null) {
                System.out.println("Patient registration successful: " + registeredPatient.getId());
                response.put("success", true);
                response.put("patientId", registeredPatient.getId());
                response.put("message", "Patient registered successfully");
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Patient registration failed - service returned null");
                response.put("success", false);
                response.put("message", "Registration failed - could not create patient");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("Error in patient registration: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // API endpoint for doctor registration
    @PostMapping("/register/doctor")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> registerDoctor(@RequestBody Map<String, String> doctorData) {
        Map<String, Object> response = new HashMap<>();

        System.out.println("=== DOCTOR REGISTRATION ATTEMPT ===");
        System.out.println("Received doctor data: " + doctorData);

        try {
            // Validate required fields
            if (!validateDoctorData(doctorData)) {
                response.put("success", false);
                response.put("message", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            Doctor doctor = new Doctor();
            doctor.setFirstName(doctorData.get("firstName"));
            doctor.setLastName(doctorData.get("lastName"));
            doctor.setEmail(doctorData.get("email"));

            // Use setPassword() instead of setPasswordHash() if that's your method name
            String password = doctorData.get("password");
            doctor.setPasswordHash(password); // This might be setPassword() in your model
            doctor.setPhone(doctorData.get("phone"));
            doctor.setSexe(doctorData.get("sex")); // Note: form sends "sex" but model expects "sexe"
            doctor.setWilaya(doctorData.get("wilaya"));
            doctor.setCity(doctorData.get("city"));
            doctor.setSpeciality(doctorData.get("specialty"));

            // Location link is optional
            String locationLink = doctorData.get("locationLink");
            if (locationLink != null && !locationLink.trim().isEmpty()) {
                doctor.setLocationLink(locationLink);
            }

            System.out.println("Creating doctor object: " + doctor);

            Doctor registeredDoctor = careLinkService.registerDoctor(doctor);

            if (registeredDoctor != null) {
                System.out.println("Doctor registration successful: " + registeredDoctor.getId());
                response.put("success", true);
                response.put("doctorId", registeredDoctor.getId());
                response.put("message", "Doctor registered successfully");
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Doctor registration failed - service returned null");
                response.put("success", false);
                response.put("message", "Registration failed - could not create doctor");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("Error in doctor registration: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private boolean validatePatientData(Map<String, String> data) {
        String[] requiredFields = { "firstName", "lastName", "email", "password", "phone", "sex", "wilaya", "city" };

        for (String field : requiredFields) {
            String value = data.get(field);
            if (value == null || value.trim().isEmpty()) {
                System.out.println("Missing required field: " + field);
                return false;
            }
        }

        // Validate email format
        String email = data.get("email");
        if (!isValidEmail(email)) {
            System.out.println("Invalid email format: " + email);
            return false;
        }

        return true;
    }

    private boolean validateDoctorData(Map<String, String> data) {
        String[] requiredFields = { "firstName", "lastName", "email", "password", "phone", "sex", "wilaya", "city",
                "specialty" };

        for (String field : requiredFields) {
            String value = data.get(field);
            if (value == null || value.trim().isEmpty()) {
                System.out.println("Missing required field: " + field);
                return false;
            }
        }

        // Validate email format
        String email = data.get("email");
        if (!isValidEmail(email)) {
            System.out.println("Invalid email format: " + email);
            return false;
        }

        return true;
    }

    private boolean isValidEmail(String email) {
        // Simple email validation
        return email != null && email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }
}