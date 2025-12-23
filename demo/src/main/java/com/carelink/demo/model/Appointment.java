package com.carelink.demo.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Appointment {
    private String id;
    private String patientId;
    private String doctorId;
    private LocalDateTime dateTime;
    private Status status;
    private String notes;

    public enum Status {
        PENDING,
        CONFIRMED,
        SCHEDULED, // kept for backward compatibility (old CSV / old logic)
        RESCHEDULED,
        CANCELLED,
        COMPLETED
    }

    public Appointment() {
    }

    public Appointment(String id, String patientId, String doctorId, LocalDateTime dateTime, Status status) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.dateTime = dateTime;
        this.status = status;
    }

    // Getters and Setters
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

    // Helper methods
    public String getFormattedDate() {
        if (dateTime == null)
            return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    public String getFormattedTime() {
        if (dateTime == null)
            return "";
        return dateTime.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    /**
     * ✅ IMPORTANT:
     * These getters are added so your JS can use apt.date and apt.time
     * (Jackson will serialize them as "date" and "time").
     */
    public String getDate() {
        return getFormattedDate();
    }

    public String getTime() {
        return getFormattedTime();
    }

    @Override
    public String toString() {
        return "Appointment[" + id + "] Patient: " + patientId + ", Doctor: " + doctorId +
                ", Time: " + getFormattedDate() + " " + getFormattedTime() + ", Status: " + status;
    }
}
