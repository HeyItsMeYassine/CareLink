package com.medisync.model;


import com.medisync.observer.Observer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class Patient implements Observer { 
    
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String wilaya;
    private String city;
    private double latitude;
    private double longitude;
    
    private MedicalRecord medicalRecord;
    
    // Pattern Composition : Patient contient plusieurs Appointments
    private List<Appointment> appointments;
    
    // Constructeurs existants...
    public Patient(String id, String name, String phone, double latitude, double longitude) {
        this.id = id;
        this.firstName = name.split(" ")[0];
        this.lastName = name.split(" ").length > 1 ? name.split(" ")[1] : "";
        this.phone = phone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.medicalRecord = new MedicalRecord();
        this.appointments = new ArrayList<>();
    }
    
    // ========== GESTION DES RENDEZ-VOUS ==========
    
    /**
     * Ajoute un rendez-vous au patient
     * Cette méthode est appelée automatiquement lors de la réservation
     */
    public void addAppointment(Appointment appointment) {
        if (appointment != null && !appointments.contains(appointment)) {
            appointments.add(appointment);
            System.out.println("✅ RDV ajouté pour " + getName() + 
                " avec Dr. " + appointment.getDoctor().getLastName());
        }
    }
    
    /**
     * Retire un rendez-vous (lors d'une annulation)
     */
    public void removeAppointment(Appointment appointment) {
        if (appointments.remove(appointment)) {
            System.out.println("🗑️ RDV supprimé pour " + getName());
        }
    }
    
    /**
     * Retourne TOUS les rendez-vous du patient (copie défensive)
     */
    public List<Appointment> getAppointments() { 
        return new ArrayList<>(appointments); 
    }
    
    /**
     * Retourne les rendez-vous à venir uniquement
     */
    public List<Appointment> getUpcomingAppointments() {
        LocalDateTime now = LocalDateTime.now();
        return appointments.stream()
            .filter(app -> app.getDateTime().isAfter(now))
            .filter(app -> app.getStatus() == Appointment.Status.SCHEDULED || 
                          app.getStatus() == Appointment.Status.RESCHEDULED)
            .sorted((a1, a2) -> a1.getDateTime().compareTo(a2.getDateTime()))
            .collect(Collectors.toList());
    }
    
    /**
     * Retourne les rendez-vous passés
     */
    public List<Appointment> getPastAppointments() {
        LocalDateTime now = LocalDateTime.now();
        return appointments.stream()
            .filter(app -> app.getDateTime().isBefore(now) || 
                          app.getStatus() == Appointment.Status.COMPLETED)
            .sorted((a1, a2) -> a2.getDateTime().compareTo(a1.getDateTime())) // Plus récent en premier
            .collect(Collectors.toList());
    }
    
    /**
     * Retourne les rendez-vous annulés
     */
    public List<Appointment> getCancelledAppointments() {
        return appointments.stream()
            .filter(app -> app.getStatus() == Appointment.Status.CANCELLED)
            .sorted((a1, a2) -> a2.getDateTime().compareTo(a1.getDateTime()))
            .collect(Collectors.toList());
    }
    
    /**
     * Retourne les rendez-vous avec un médecin spécifique
     */
    public List<Appointment> getAppointmentsWithDoctor(Doctor doctor) {
        return appointments.stream()
            .filter(app -> app.getDoctor().equals(doctor))
            .sorted((a1, a2) -> a1.getDateTime().compareTo(a2.getDateTime()))
            .collect(Collectors.toList());
    }
    
    /**
     * Compte le nombre total de rendez-vous
     */
    public int getAppointmentCount() {
        return appointments.size();
    }
    
    /**
     * Compte le nombre de rendez-vous à venir
     */
    public int getUpcomingAppointmentCount() {
        return (int) appointments.stream()
            .filter(app -> app.getDateTime().isAfter(LocalDateTime.now()))
            .filter(app -> app.getStatus() != Appointment.Status.CANCELLED)
            .count();
    }
    
    /**
     * Vérifie si le patient a déjà un RDV avec ce médecin à cette date
     */
    public boolean hasAppointmentWithDoctorOnDate(Doctor doctor, LocalDateTime dateTime) {
        return appointments.stream()
            .anyMatch(app -> 
                app.getDoctor().equals(doctor) && 
                app.getDateTime().toLocalDate().equals(dateTime.toLocalDate()) &&
                app.getStatus() != Appointment.Status.CANCELLED
            );
    }
    
    /**
     * Affiche tous les rendez-vous du patient
     */
    public void displayAllAppointments() {
        System.out.println("\n╔════════════════════════════════════════════════════╗");
        System.out.println("║  📅 RENDEZ-VOUS DE " + getName().toUpperCase() + "");
        System.out.println("╠════════════════════════════════════════════════════╣");
        
        if (appointments.isEmpty()) {
            System.out.println("║  Aucun rendez-vous                                 ║");
        } else {
            System.out.println("║  Total : " + appointments.size() + " rendez-vous                              ║");
            System.out.println("╠════════════════════════════════════════════════════╣");
            
            // Rendez-vous à venir
            List<Appointment> upcoming = getUpcomingAppointments();
            if (!upcoming.isEmpty()) {
                System.out.println("║  🔜 À VENIR (" + upcoming.size() + ")                                     ║");
                for (Appointment app : upcoming) {
                    System.out.println("║  " + app.toShortString());
                }
            }
            
            // Rendez-vous passés
            List<Appointment> past = getPastAppointments();
            if (!past.isEmpty()) {
                System.out.println("║  ✅ TERMINÉS (" + past.size() + ")                                   ║");
                for (Appointment app : past.stream().limit(3).collect(Collectors.toList())) {
                    System.out.println("║  " + app.toShortString());
                }
                if (past.size() > 3) {
                    System.out.println("║  ... et " + (past.size() - 3) + " autres");
                }
            }
        }
        
        System.out.println("╚════════════════════════════════════════════════════╝\n");
    }
    
    // Pattern Observateur
    @Override
    public void update(String message) {
        System.out.println("\n╔══════════════════════════════════════════════╗");
        System.out.println("║  🔔 NOTIFICATION MEDISYNC                    ║");
        System.out.println("╚══════════════════════════════════════════════╝");
        System.out.println("👤 Patient : " + getName());
        System.out.println("📱 Téléphone : " + phone);
        System.out.println("💬 Message : " + message);
        System.out.println("──────────────────────────────────────────────\n");
    }
    
    // Getters existants...
    public String getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getName() { return firstName + " " + lastName; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public MedicalRecord getMedicalRecord() { return medicalRecord; }
    
    @Override
    public String toString() {
        return String.format("Patient[%s] %s - 📱 %s - 📅 %d RDV",
            id, getName(), phone, appointments.size());
    }
}
