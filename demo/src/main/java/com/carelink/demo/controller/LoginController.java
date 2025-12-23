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
public class LoginController {
    
    @Autowired
    private CareLinkService careLinkService;
    
    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }
    
    // API endpoints for login (called by login.js)
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
    
    @GetMapping("/logout")
    public String logout() {
        return "redirect:/login";
    }
}