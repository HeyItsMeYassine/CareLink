package com.medisync.controller;

import com.medisync.model.*;
import com.medisync.utils.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

public class MediSyncController {

    private final MediSyncHub hub = MediSyncHub.getInstance();
    private final CityManager cityManager = CityManager.getInstance();

    private Patient connectedPatient;
    private boolean loggedIn = false;

    // -------------------------------
    // AUTHENTIFICATION
    // -------------------------------
    public boolean login(String patientId, String name, String phone) {
        this.connectedPatient = new Patient(
                patientId,
                name,
                phone,
                36.75,
                3.05
        );

        loggedIn = true;
        return true;
    }

    public void logout() {
        loggedIn = false;
        connectedPatient = null;
    }

    public boolean isLoggedIn() {
        return loggedIn;
    }

    public Patient getConnectedPatient() {
        return connectedPatient;
    }

    // -------------------------------
    // DOCTEURS
    // -------------------------------
    public List<Doctor> getAllDoctors() {
        return hub.getAllDoctors();
    }

    public List<Doctor> searchDoctors(String keyword) {
        if (keyword == null || keyword.isEmpty()) return getAllDoctors();

        return hub.getAllDoctors().stream()
                .filter(d ->
                        d.getLastName().toLowerCase().contains(keyword.toLowerCase()) ||
                        d.getFirstName().toLowerCase().contains(keyword.toLowerCase()) ||
                        d.getSpecialty().toLowerCase().contains(keyword.toLowerCase()) ||
                        d.getCity().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }

    // 🔧 Correction wilaya / ville
    public List<Doctor> filterDoctors(String specialty, String wilaya, String city) {
        return hub.getAllDoctors().stream()
                .filter(d -> specialty == null || specialty.isEmpty() || d.getSpecialty().equalsIgnoreCase(specialty))
                .filter(d -> wilaya == null || wilaya.isEmpty() || d.getWilaya().equalsIgnoreCase(wilaya))
                .filter(d -> city == null || city.isEmpty() || d.getCity().equalsIgnoreCase(city))
                .collect(Collectors.toList());
    }

    // -------------------------------
    // WILAYA & VILLES
    // -------------------------------
    public List<String> getAllWilayas() {
        return cityManager.getAllWilayas();
    }

    public List<String> getCitiesOfWilaya(String wilaya) {
        return cityManager.getCitiesByWilaya(wilaya)
                .stream()
                .map(City::name)
                .collect(Collectors.toList());
    }

    // -------------------------------
    // DISPONIBILITÉS
    // -------------------------------
    public List<LocalTime> getDoctorAvailabilities(Doctor doctor) {
        if (doctor == null) return List.of();
        return doctor.getAvailabilities();
    }

    // -------------------------------
    // RÉSERVATION RDV
    // -------------------------------
    public Appointment bookAppointment(Doctor doctor, LocalDate date, LocalTime time) {

        if (connectedPatient == null) {
            throw new IllegalStateException("Aucun patient connecté !");
        }

        if (doctor == null || time == null || date == null) {
            throw new IllegalArgumentException("Paramètres invalides pour la réservation.");
        }

        // Vérifie le créneau
        boolean success = doctor.bookSlot(time);
        if (!success) return null;

        // Création du RDV
        Appointment app = new Appointment(
                UUID.randomUUID().toString(),
                connectedPatient,
                doctor,
                LocalDateTime.of(date, time)
        );

        // Ajouter au patient
        connectedPatient.addAppointment(app);

        // Ajouter au médecin (nécessaire)
        doctor.addAppointment(app);

        return app;
    }

    // -------------------------------
    // LISTE DES RENDEZ-VOUS PATIENT
    // -------------------------------
    public List<Appointment> getMyAppointments() {
        if (connectedPatient == null) return List.of();
        return connectedPatient.getAppointments();
    }

    // -------------------------------
    // LISTE DES RENDEZ-VOUS MÉDECIN
    // -------------------------------
    public List<Appointment> getDoctorAppointments(Doctor doctor) {
        if (doctor == null) return List.of();
        return doctor.getAppointments();
    }

    // -------------------------------
    // ANNULATION (OPTIONNEL)
    // -------------------------------
    public boolean cancelAppointment(Appointment app) {
        if (app == null || connectedPatient == null) return false;

        // Libérer le créneau côté médecin
        LocalTime time = app.getDateTime().toLocalTime();
        app.getDoctor().freeSlot(time);

        // Retirer côté patient
        connectedPatient.getAppointments().remove(app);

        // Retirer côté médecin
        app.getDoctor().getAppointments().remove(app);

        return true;
    }
}
