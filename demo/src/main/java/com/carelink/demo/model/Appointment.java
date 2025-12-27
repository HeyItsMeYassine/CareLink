package com.carelink.demo.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Modèle représentant un rendez-vous médical.
 * Il relie un patient, un médecin, une date/heure et un état.
 */
public class Appointment {

    private String id;
    private String patientId;
    private String doctorId;
    private LocalDateTime dateTime;
    private Status status;
    private String notes;

    /**
     * États possibles d'un rendez-vous.
     */
    public enum Status {
        PENDING,
        CONFIRMED,
        SCHEDULED,
        RESCHEDULED,
        CANCELLED,
        COMPLETED
    }

    /** Constructeur par défaut. */
    public Appointment() {
    }

    /**
     * Constructeur principal.
     *
     * @param id        identifiant du rendez-vous
     * @param patientId identifiant du patient
     * @param doctorId  identifiant du médecin
     * @param dateTime  date et heure du rendez-vous
     * @param status    état du rendez-vous
     */
    public Appointment(String id, String patientId, String doctorId,
            LocalDateTime dateTime, Status status) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.dateTime = dateTime;
        this.status = status;
    }

    // ---------- Getters et Setters ----------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // ---------- Méthodes utilitaires ----------

    /**
     * Retourne la date du rendez-vous au format lisible.
     */
    public String getFormattedDate() {
        if (dateTime == null)
            return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    /**
     * Retourne l'heure du rendez-vous au format lisible.
     */
    public String getFormattedTime() {
        if (dateTime == null)
            return "";
        return dateTime.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    /**
     * Expose la date pour la sérialisation JSON.
     */
    public String getDate() {
        return getFormattedDate();
    }

    /**
     * Expose l'heure pour la sérialisation JSON.
     */
    public String getTime() {
        return getFormattedTime();
    }

    /**
     * Représentation textuelle du rendez-vous.
     */
    @Override
    public String toString() {
        return "Appointment[" + id + "] Patient: " + patientId +
                ", Doctor: " + doctorId +
                ", Time: " + getFormattedDate() + " " + getFormattedTime() +
                ", Status: " + status;
    }
}
