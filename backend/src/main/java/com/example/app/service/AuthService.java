package com.carelink.service;

import com.carelink.model.Doctor;
import com.carelink.model.Patient;
import java.util.HashMap;
import java.util.Map;

public class AuthService {
    private final CSVService csvService;
    private Map<String, Object> sessions; // Simple in-memory session storage
    
    public AuthService() {
        this.csvService = new CSVService();
        this.sessions = new HashMap<>();
    }
    
    public Map<String, Object> loginDoctor(String email, String password) {
        try {
            Doctor doctor = csvService.findDoctorByEmail(email);
            if (doctor != null && doctor.getPassword().equals(password)) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", convertToDashboardId(doctor.getId(), "doctor"));
                userData.put("name", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
                userData.put("firstName", doctor.getFirstName());
                userData.put("email", doctor.getEmail());
                userData.put("type", "doctor");
                userData.put("wilaya", doctor.getWilaya());
                userData.put("city", doctor.getCity());
                userData.put("phone", doctor.getPhoneNumber());
                userData.put("sex", doctor.getSex());
                userData.put("specialty", doctor.getSpecialty());
                userData.put("locationLink", doctor.getLocationLink());
                
                // Create session
                String sessionId = "session_" + System.currentTimeMillis();
                sessions.put(sessionId, userData);
                userData.put("sessionId", sessionId);
                
                return userData;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public Map<String, Object> loginPatient(String email, String password) {
        try {
            Patient patient = csvService.findPatientByEmail(email);
            if (patient != null && patient.getPassword().equals(password)) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", convertToDashboardId(patient.getId(), "patient"));
                userData.put("name", patient.getFirstName() + " " + patient.getLastName());
                userData.put("firstName", patient.getFirstName());
                userData.put("email", patient.getEmail());
                userData.put("type", "patient");
                userData.put("wilaya", patient.getWilaya());
                userData.put("city", patient.getCity());
                userData.put("phone", patient.getPhoneNumber());
                userData.put("sex", patient.getSex());
                
                // Create session
                String sessionId = "session_" + System.currentTimeMillis();
                sessions.put(sessionId, userData);
                userData.put("sessionId", sessionId);
                
                return userData;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public boolean validateSession(String sessionId) {
        return sessions.containsKey(sessionId);
    }
    
    public Map<String, Object> getUserFromSession(String sessionId) {
        return sessions.get(sessionId);
    }
    
    public void logout(String sessionId) {
        sessions.remove(sessionId);
    }
    
    private String convertToDashboardId(String csvId, String type) {
        if (type.equals("patient")) {
            // ID01 → p1
            String number = csvId.replace("ID", "");
            return "p" + Integer.parseInt(number);
        } else if (type.equals("doctor")) {
            // ID001 → d1
            String number = csvId.replace("ID", "");
            return "d" + Integer.parseInt(number);
        }
        return csvId;
    }
}
