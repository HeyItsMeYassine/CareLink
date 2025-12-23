package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;

public class Doctor {
    private String id;
    private String firstName;
    private String lastName;
    private String wilaya;
    private String city;
    private String email;
    private String passwordHash; // Stored hashed
    private String phone;
    private String sexe; // M or F
    private String speciality;
    private String locationLink; // Google Maps link

    // Observer pattern
    private final List<Observer> observers = new ArrayList<>();

    // Availability
    private final List<String> availableSlots = new ArrayList<>();

    public Doctor() {
        initDefaultSlots();
    }

    public Doctor(String id, String firstName, String lastName, String wilaya, String city,
            String email, String passwordHash, String phone, String sexe,
            String speciality, String locationLink) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.wilaya = wilaya;
        this.city = city;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.sexe = sexe;
        this.speciality = speciality;
        this.locationLink = locationLink;
        initDefaultSlots();
    }

    private void initDefaultSlots() {
        // Default availability: 08:00 → 16:30 (30-min slots)
        availableSlots.clear();
        for (int hour = 8; hour <= 16; hour++) {
            availableSlots.add(String.format("%02d:00", hour));
            availableSlots.add(String.format("%02d:30", hour));
        }
    }

    // ================= Observer pattern =================

    public void addObserver(Observer observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }

    public void notifyObservers(String message) {
        for (Observer observer : observers) {
            observer.update(message);
        }
    }

    // ================= Availability =================

    public boolean bookSlot(String timeSlot) {
        if (availableSlots.contains(timeSlot)) {
            availableSlots.remove(timeSlot);
            notifyObservers("Slot at " + timeSlot + " has been booked with Dr. " + lastName);
            return true;
        }
        return false;
    }

    /**
     * ✅ FIX: return a defensive copy (removes VS Code warning)
     */
    public List<String> getAvailableSlots() {
        return new ArrayList<>(availableSlots);
    }

    /**
     * ✅ FIX: copy input instead of storing external reference
     */
    public void setAvailableSlots(List<String> slots) {
        availableSlots.clear();
        if (slots != null) {
            availableSlots.addAll(slots);
        }
    }

    // ================= Getters & Setters =================

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

    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    public String getLocationLink() {
        return locationLink;
    }

    public void setLocationLink(String locationLink) {
        this.locationLink = locationLink;
    }

    // ================= Helpers =================

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Override
    public String toString() {
        return "Dr. " + firstName + " " + lastName +
                " (" + speciality + ") - " + city + ", " + wilaya;
    }
}
