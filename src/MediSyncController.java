
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
                .filter(d -> wilaya == null || wilaya.isEmpty() || d.getCity().equalsIgnoreCase(wilaya))
                .filter(d -> city == null || city.isEmpty() || d.getCity().equalsIgnoreCase(city))
                .collect(Collectors.toList());
    }

   
  
    public List<String> getAllWilayas() {
        return cityManager.getAllWilayas();
    }

    
    public List<String> getCitiesOfWilaya(String wilaya) {
        return cityManager.getCitiesByWilaya(wilaya)
                .stream().map(City::name)
                .collect(Collectors.toList());
    }


  
    public List<LocalTime> getDoctorAvailabilities(Doctor doctor) {
        if (doctor == null) return List.of();
        return doctor.getAvailabilities();
    }

    
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

        // Ajouter dans la liste du patient
        connectedPatient.addAppointment(app);

        return app;
    }
}
