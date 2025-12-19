package com.carelink.service;

import com.carelink.model.Doctor;
import com.carelink.model.Patient;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CSVService {
    private static final String DOCTORS_CSV_PATH = "backend/data/doctors.csv";
    private static final String PATIENTS_CSV_PATH = "backend/data/patients.csv";
    
    public List<Doctor> loadDoctors() throws IOException {
        List<Doctor> doctors = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new FileReader(DOCTORS_CSV_PATH))) {
            String line;
            boolean firstLine = true;
            
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }
                
                String[] values = line.split(",");
                if (values.length >= 11) {
                    Doctor doctor = new Doctor(
                        values[0].trim(), // ID
                        values[1].trim(), // First_Name
                        values[2].trim(), // Last_Name
                        values[3].trim(), // Wilaya
                        values[4].trim(), // City
                        values[5].trim(), // Email
                        values[6].trim(), // Password
                        values[7].trim(), // Phone Number
                        values[8].trim(), // Sexe
                        values[9].trim(), // Speciality
                        values[10].trim() // Location_Link
                    );
                    doctors.add(doctor);
                }
            }
        }
        return doctors;
    }
    
    public List<Patient> loadPatients() throws IOException {
        List<Patient> patients = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new FileReader(PATIENTS_CSV_PATH))) {
            String line;
            boolean firstLine = true;
            
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }
                
                String[] values = line.split(",");
                if (values.length >= 9) {
                    Patient patient = new Patient(
                        values[0].trim(), // ID
                        values[1].trim(), // First Name
                        values[2].trim(), // Last Name
                        values[3].trim(), // Wilaya
                        values[4].trim(), // City
                        values[5].trim(), // Email
                        values[6].trim(), // Password
                        values[7].trim(), // Phone Number
                        values[8].trim()  // Sexe
                    );
                    patients.add(patient);
                }
            }
        }
        return patients;
    }
    
    public Doctor findDoctorByEmail(String email) throws IOException {
        List<Doctor> doctors = loadDoctors();
        return doctors.stream()
                .filter(d -> d.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }
    
    public Patient findPatientByEmail(String email) throws IOException {
        List<Patient> patients = loadPatients();
        return patients.stream()
                .filter(p -> p.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }
}
