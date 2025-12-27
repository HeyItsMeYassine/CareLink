package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Modèle représentant un patient.
 * Il contient ses informations personnelles, médicales
 * et implémente le pattern Observer pour recevoir des notifications.
 */
public class Patient implements Observer {

    private String id;
    private String firstName;
    private String lastName;
    private String wilaya;
    private String city;
    private String email;
    private String passwordHash;
    private String phone;
    private String sexe;

    /** Informations médicales simplifiées. */
    private String bloodType;
    private String allergies;

    /** Liste des rendez-vous du patient. */
    private List<Appointment> appointments = new ArrayList<>();

    /** Constructeur par défaut. */
    public Patient() {
    }

    /**
     * Constructeur principal.
     */
    public Patient(String id, String firstName, String lastName, String wilaya, String city,
            String email, String passwordHash, String phone, String sexe) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.wilaya = wilaya;
        this.city = city;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.sexe = sexe;
    }

    // -------------------- Observer --------------------

    /**
     * Reçoit une notification lors d'un événement lié au médecin
     * ou à un rendez-vous.
     */
    @Override
    public void update(String message) {
        System.out.println("Notification for " + getFullName() + ": " + message);
    }

    // -------------------- Gestion des rendez-vous --------------------

    /** Ajoute un rendez-vous à la liste du patient. */
    public void addAppointment(Appointment appointment) {
        appointments.add(appointment);
    }

    /** Supprime un rendez-vous de la liste du patient. */
    public void removeAppointment(Appointment appointment) {
        appointments.remove(appointment);
    }

    /**
     * Retourne la liste des rendez-vous à venir.
     * (Logique simplifiée dans ce projet.)
     */
    public List<Appointment> getUpcomingAppointments() {
        return new ArrayList<>();
    }

    // -------------------- Getters & Setters --------------------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getWilaya() {
        return wilaya;
    }

    public void setWilaya(String wilaya) {
        this.wilaya = wilaya;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSexe() {
        return sexe;
    }

    public void setSexe(String sexe) {
        this.sexe = sexe;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    // -------------------- Helpers --------------------

    /** Retourne le nom complet du patient. */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /** Description lisible du patient. */
    @Override
    public String toString() {
        return "Patient: " + firstName + " " + lastName +
                " - " + city + ", " + wilaya;
    }
}
