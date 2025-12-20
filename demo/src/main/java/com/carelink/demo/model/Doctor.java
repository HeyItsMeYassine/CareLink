package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalTime;

public class Doctor {

    private String id;
    private String lastName;
    private String firstName;
    private String specialty;
    private String city;

    private List<LocalTime> availabilities;

    private List<Observer> observers;

    public Doctor(String id, String lastName, String firstName, String specialty, String city) {
        this.id = id;
        this.lastName = lastName;
        this.firstName = firstName;
        this.specialty = specialty;
        this.city = city;

        this.availabilities = new ArrayList<>();
        this.observers = new ArrayList<>();

        initDefaultSlots();
    }

    private void initDefaultSlots() {
        availabilities.add(LocalTime.of(9, 0));
        availabilities.add(LocalTime.of(10, 0));
        availabilities.add(LocalTime.of(11, 0));
        availabilities.add(LocalTime.of(14, 0));
        availabilities.add(LocalTime.of(15, 0));
    }

    public String getId() {
        return id;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getSpecialty() {
        return specialty;
    }

    public String getCity() {
        return city;
    }

    public List<LocalTime> getAvailabilities() {
        return availabilities;
    }

    public boolean bookSlot(LocalTime time) {
        if (availabilities.contains(time)) {
            availabilities.remove(time);
            System.out.println(">>> Success: Slot at " + time + " booked for Dr. " + lastName);

            notifyObservers("ALERT: The slot at " + time + " with Dr " + lastName + " has just been booked!");

            return true;
        } else {
            System.out.println(">>> Error: Slot at " + time + " is not available.");
            return false;
        }
    }

    public void addObserver(Observer o) {
        observers.add(o);
    }

    public void removeObserver(Observer o) {
        observers.remove(o);
    }

    private void notifyObservers(String message) {
        for (Observer o : observers) {
            o.update(message);
        }
    }

    @Override
    public String toString() {
        return String.format("Dr. %-10s %-10s | Specialty: %-15s | City: %-10s | Free Slots: %d",
                lastName, firstName, specialty, city, availabilities.size());
    }
}