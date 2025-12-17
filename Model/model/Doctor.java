package com.carelink.model;

import java.util.ArrayList;
import java.util.List;

public class Doctor {
    private String id;
    private String email;
    private String password;
    private String lastName;
    private String firstName;
    private String specialty;
    private String wilaya;
    private String city;
    private String phone;

    // NOUVEAUX CHAMPS pour les documents
    private String idCardPath;              // Chemin vers la pièce d'identité
    private String professionalCardPath;    // Chemin vers la carte professionnelle (CNOA)
    private String openingApprovalPath;     // Chemin vers l'agrément d'ouverture
    private DoctorStatus status;            // Statut du docteur

    public Doctor() {
        this.status = DoctorStatus.PENDING; // Par défaut : EN ATTENTE
    }

    public Doctor(String id, String email, String password, String lastName, String firstName,
                  String specialty, String wilaya, String city, String phone) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.lastName = lastName;
        this.firstName = firstName;
        this.specialty = specialty;
        this.wilaya = wilaya;
        this.city = city;
        this.phone = phone;
        this.status = DoctorStatus.PENDING; // Par défaut : EN ATTENTE
    }

    // Constructeur complet avec documents
    public Doctor(String id, String email, String password, String lastName, String firstName,
                  String specialty, String wilaya, String city, String phone,
                  String idCardPath, String professionalCardPath, String openingApprovalPath) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.lastName = lastName;
        this.firstName = firstName;
        this.specialty = specialty;
        this.wilaya = wilaya;
        this.city = city;
        this.phone = phone;
        this.idCardPath = idCardPath;
        this.professionalCardPath = professionalCardPath;
        this.openingApprovalPath = openingApprovalPath;
        this.status = DoctorStatus.PENDING;
    }

    // Getters existants
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getLastName() { return lastName; }
    public String getFirstName() { return firstName; }
    public String getSpecialty() { return specialty; }
    public String getWilaya() { return wilaya; }
    public String getCity() { return city; }
    public String getPhone() { return phone; }

    // NOUVEAUX Getters pour les documents
    public String getIdCardPath() { return idCardPath; }
    public String getProfessionalCardPath() { return professionalCardPath; }
    public String getOpeningApprovalPath() { return openingApprovalPath; }
    public DoctorStatus getStatus() { return status; }

    // Setters existants
    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public void setWilaya(String wilaya) { this.wilaya = wilaya; }
    public void setCity(String city) { this.city = city; }
    public void setPhone(String phone) { this.phone = phone; }

    // NOUVEAUX Setters pour les documents
    public void setIdCardPath(String idCardPath) { this.idCardPath = idCardPath; }
    public void setProfessionalCardPath(String professionalCardPath) {
        this.professionalCardPath = professionalCardPath;
    }
    public void setOpeningApprovalPath(String openingApprovalPath) {
        this.openingApprovalPath = openingApprovalPath;
    }
    public void setStatus(DoctorStatus status) { this.status = status; }

    // Méthode pour CSV (MODIFIÉE)
    public String toCSV() {
        return id + "," + email + "," + password + "," + lastName + "," + firstName + "," +
                specialty + "," + wilaya + "," + city + "," + phone + "," +
                (idCardPath != null ? idCardPath : "") + "," +
                (professionalCardPath != null ? professionalCardPath : "") + "," +
                (openingApprovalPath != null ? openingApprovalPath : "") + "," +
                status.name();
    }

    // Méthode pour créer depuis CSV (MODIFIÉE)
    public static Doctor fromCSV(String csvLine) {
        String[] parts = csvLine.split(",", -1); // -1 pour garder les champs vides

        if (parts.length < 9) {
            throw new IllegalArgumentException("Invalid CSV line");
        }

        Doctor doctor = new Doctor(
                parts[0], parts[1], parts[2], parts[3], parts[4],
                parts[5], parts[6], parts[7], parts[8]
        );

        // Charger les documents si présents
        if (parts.length > 9 && !parts[9].isEmpty()) {
            doctor.setIdCardPath(parts[9]);
        }
        if (parts.length > 10 && !parts[10].isEmpty()) {
            doctor.setProfessionalCardPath(parts[10]);
        }
        if (parts.length > 11 && !parts[11].isEmpty()) {
            doctor.setOpeningApprovalPath(parts[11]);
        }
        if (parts.length > 12 && !parts[12].isEmpty()) {
            try {
                doctor.setStatus(DoctorStatus.valueOf(parts[12]));
            } catch (IllegalArgumentException e) {
                doctor.setStatus(DoctorStatus.PENDING);
            }
        }

        return doctor;
    }

    @Override
    public String toString() {
        return "Dr. " + firstName + " " + lastName + " (" + specialty + ") - Status: " + status;
    }
}