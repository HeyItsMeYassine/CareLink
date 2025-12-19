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

    // ========== GESTION DES RENDEZ-VOUS PATIENT ==========
    
    /**
     * Réserve un rendez-vous pour le patient connecté
     */
    public Appointment bookAppointment(Doctor doctor, LocalDate date, LocalTime time) {
        if (connectedPatient == null) {
            throw new IllegalStateException("Aucun patient connecté !");
        }

        if (doctor == null || time == null || date == null) {
            throw new IllegalArgumentException("Paramètres invalides pour la réservation.");
        }

        LocalDateTime dateTime = LocalDateTime.of(date, time);
        
        // Vérifier si le patient a déjà un RDV ce jour-là avec ce médecin
        if (connectedPatient.hasAppointmentWithDoctorOnDate(doctor, dateTime)) {
            System.out.println("⚠️ Vous avez déjà un rendez-vous avec ce médecin ce jour-là");
            return null;
        }

        // Vérifier et réserver le créneau
        boolean success = doctor.bookSlot(time);
        if (!success) {
            System.out.println("❌ Créneau non disponible");
            return null;
        }

        // Créer le rendez-vous
        String appointmentId = "RDV" + System.currentTimeMillis();
        Appointment app = new Appointment(
            appointmentId,
            connectedPatient,
            doctor,
            dateTime
        );

        // Ajouter au patient (Pattern Composition)
        connectedPatient.addAppointment(app);

        // Ajouter au médecin
        doctor.addAppointment(app);
        
        // Ajouter au hub central
        hub.addAppointment(app);

        System.out.println("✅ Rendez-vous réservé avec succès : " + appointmentId);
        return app;
    }
    
    /**
     * Retourne TOUS les rendez-vous du patient connecté
     */
    public List<Appointment> getMyAppointments() {
        if (connectedPatient == null) {
            return List.of();
        }
        return connectedPatient.getAppointments();
    }
    
    /**
     * Retourne les rendez-vous à venir du patient
     */
    public List<Appointment> getMyUpcomingAppointments() {
        if (connectedPatient == null) {
            return List.of();
        }
        return connectedPatient.getUpcomingAppointments();
    }
    
    /**
     * Retourne les rendez-vous passés du patient
     */
    public List<Appointment> getMyPastAppointments() {
        if (connectedPatient == null) {
            return List.of();
        }
        return connectedPatient.getPastAppointments();
    }
    
    /**
     * Retourne les rendez-vous avec un médecin spécifique
     */
    public List<Appointment> getMyAppointmentsWithDoctor(Doctor doctor) {
        if (connectedPatient == null) {
            return List.of();
        }
        return connectedPatient.getAppointmentsWithDoctor(doctor);
    }
    
    /**
     * Annule un rendez-vous
     */
    public boolean cancelAppointment(Appointment app) {
        if (app == null || connectedPatient == null) {
            return false;
        }

        // Vérifier que le RDV appartient bien au patient connecté
        if (!app.getPatient().equals(connectedPatient)) {
            System.out.println("❌ Ce rendez-vous ne vous appartient pas");
            return false;
        }
        
        // Vérifier si le RDV peut être annulé
        if (!app.canBeCancelled()) {
            System.out.println("❌ Ce rendez-vous ne peut pas être annulé");
            return false;
        }

        // Annuler le RDV (notifie automatiquement via Observer)
        app.cancel();

        // Retirer de la liste du patient
        connectedPatient.removeAppointment(app);

        // Retirer de la liste du médecin
        app.getDoctor().getAppointments().remove(app);

        System.out.println("✅ Rendez-vous annulé avec succès");
        return true;
    }
    
    /**
     * Reprogramme un rendez-vous
     */
    public boolean rescheduleAppointment(Appointment app, LocalDate newDate, LocalTime newTime) {
        if (app == null || connectedPatient == null) {
            return false;
        }

        if (!app.getPatient().equals(connectedPatient)) {
            System.out.println("❌ Ce rendez-vous ne vous appartient pas");
            return false;
        }
        
        if (!app.canBeRescheduled()) {
            System.out.println("❌ Ce rendez-vous ne peut pas être reprogrammé");
            return false;
        }

        LocalDateTime newDateTime = LocalDateTime.of(newDate, newTime);
        
        // Vérifier la disponibilité du nouveau créneau
        Doctor doctor = app.getDoctor();
        if (!doctor.getAvailabilities().contains(newTime)) {
            System.out.println("❌ Le nouveau créneau n'est pas disponible");
            return false;
        }

        // Libérer l'ancien créneau
        doctor.freeSlot(app.getDateTime().toLocalTime());
        
        // Réserver le nouveau créneau
        boolean success = doctor.bookSlot(newTime);
        if (!success) {
            // Remettre l'ancien créneau en cas d'échec
            doctor.bookSlot(app.getDateTime().toLocalTime());
            return false;
        }

        // Reprogrammer (notifie via Observer)
        app.reschedule(newDateTime);

        System.out.println("✅ Rendez-vous reprogrammé avec succès");
        return true;
    }
    
    /**
     * Affiche tous les rendez-vous du patient connecté
     */
    public void displayMyAppointments() {
        if (connectedPatient != null) {
            connectedPatient.displayAllAppointments();
        }
    }
    
    // Autres méthodes existantes...
    public boolean login(String patientId, String name, String phone) {
        this.connectedPatient = new Patient(patientId, name, phone, 36.75, 3.05);
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

    public List<Doctor> filterDoctors(String specialty, String wilaya, String city) {
        return hub.getAllDoctors().stream()
                .filter(d -> specialty == null || specialty.isEmpty() || d.getSpecialty().equalsIgnoreCase(specialty))
                .filter(d -> wilaya == null || wilaya.isEmpty() || d.getWilaya().equalsIgnoreCase(wilaya))
                .filter(d -> city == null || city.isEmpty() || d.getCity().equalsIgnoreCase(city))
                .collect(Collectors.toList());
    }

    public List<String> getAllWilayas() {
        return cityManager.getAllWilayas();
    }

    public List<String> getCitiesOfWilaya(String wilaya) {
        return cityManager.getCitiesByWilaya(wilaya)
                .stream()
                .map(Ville::nom)
                .collect(Collectors.toList());
    }

    public List<LocalTime> getDoctorAvailabilities(Doctor doctor) {
        if (doctor == null) return List.of();
        return doctor.getAvailabilities();
    }
}
