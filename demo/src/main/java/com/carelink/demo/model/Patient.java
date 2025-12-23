package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;

public class Patient implements Observer {
    private String id;
    private String firstName;
    private String lastName;
    private String wilaya;
    private String city;
    private String email;
    private String passwordHash; // Stored hashed
    private String phone;
    private String sexe; // M or F

    // Medical information (simplified)
    private String bloodType;
    private String allergies;

    // Appointments
    private List<Appointment> appointments = new ArrayList<>();

    public Patient() {
    }

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

    // Observer pattern implementation
    @Override
    public void update(String message) {
        System.out.println("Notification for " + getFullName() + ": " + message);
        // In real app, this would trigger email/SMS
    }

    // Appointment management
    public void addAppointment(Appointment appointment) {
        appointments.add(appointment);
    }

    public void removeAppointment(Appointment appointment) {
        appointments.remove(appointment);
    }

    public List<Appointment> getUpcomingAppointments() {
        List<Appointment> upcoming = new ArrayList<>();
        // Logic to filter upcoming appointments
        return upcoming;
    }

    // Getters and Setters
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

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Override
    public String toString() {
        return "Patient: " + firstName + " " + lastName + " - " + city + ", " + wilaya;
    }
}