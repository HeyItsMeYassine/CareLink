package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Modèle représentant un médecin.
 * Contient ses informations personnelles, sa disponibilité, et la logique de
 * notification (Observer).
 */
public class Doctor {

    private String id;
    private String firstName;
    private String lastName;
    private String wilaya;
    private String city;
    private String email;
    private String passwordHash;
    private String phone;
    private String sexe;
    private String speciality;
    private String locationLink;

    /** Observateurs à notifier lors d'un événement (pattern Observer). */
    private final List<Observer> observers = new ArrayList<>();

    /** Créneaux horaires disponibles du médecin. */
    private final List<String> availableSlots = new ArrayList<>();

    /** Constructeur par défaut : initialise les créneaux standards. */
    public Doctor() {
        initDefaultSlots();
    }

    /**
     * Constructeur complet.
     */
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

    /**
     * Définit les créneaux par défaut : de 08:00 à 15:00 (pas de 30 minutes).
     */
    private void initDefaultSlots() {
        availableSlots.clear();
        for (int hour = 8; hour <= 15; hour++) {
            availableSlots.add(String.format("%02d:00", hour));
            availableSlots.add(String.format("%02d:30", hour));
        }
    }

    // -------------------- Observer --------------------

    /** Ajoute un observateur s'il n'est pas déjà présent. */
    public void addObserver(Observer observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    /** Retire un observateur. */
    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }

    /** Notifie tous les observateurs avec un message. */
    public void notifyObservers(String message) {
        for (Observer observer : observers) {
            observer.update(message);
        }
    }

    // -------------------- Disponibilités --------------------

    /**
     * Réserve un créneau si celui-ci est encore disponible.
     *
     * @param timeSlot créneau à réserver (ex: "10:30")
     * @return true si la réservation a réussi, sinon false
     */
    public boolean bookSlot(String timeSlot) {
        if (availableSlots.contains(timeSlot)) {
            availableSlots.remove(timeSlot);
            notifyObservers("Slot at " + timeSlot + " has been booked with Dr. " + lastName);
            return true;
        }
        return false;
    }

    /**
     * Retourne une copie de la liste des créneaux afin de préserver
     * l'encapsulation.
     */
    public List<String> getAvailableSlots() {
        return new ArrayList<>(availableSlots);
    }

    /**
     * Remplace la liste des créneaux en copiant les données fournies.
     */
    public void setAvailableSlots(List<String> slots) {
        availableSlots.clear();
        if (slots != null) {
            availableSlots.addAll(slots);
        }
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

    // -------------------- Helpers --------------------

    /** Retourne le nom complet du médecin. */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /** Description lisible du médecin (utile pour l'affichage). */
    @Override
    public String toString() {
        return "Dr. " + firstName + " " + lastName +
                " (" + speciality + ") - " + city + ", " + wilaya;
    }
}

