package com.carelink.demo.repository;

import com.carelink.demo.model.*;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dépôt de données basé sur des fichiers CSV (chargés depuis le classpath).
 * Cette classe centralise l'accès aux médecins, patients, rendez-vous, wilayas
 * et spécialités.
 *
 * Elle est implémentée en Singleton afin de charger les fichiers une seule
 * fois.
 */
public class CsvDataRepository {

    /** Instance unique (thread-safe) du repository. */
    private static volatile CsvDataRepository instance;

    private final Map<String, Doctor> doctors = new HashMap<>();
    private final Map<String, Patient> patients = new HashMap<>();
    private final Map<String, Appointment> appointments = new HashMap<>();
    private final Map<String, Wilaya> wilayas = new HashMap<>();
    private final Map<String, Specialty> specialties = new HashMap<>();

    /** Indique si les données ont déjà été chargées. */
    private boolean dataLoaded = false;

    /**
     * Constructeur privé : force l'utilisation du Singleton.
     * Charge les données au premier accès.
     */
    private CsvDataRepository() {
        if (!dataLoaded) {
            loadAllData();
            dataLoaded = true;
        }
    }

    /**
     * Retourne l'instance unique du repository (double-check locking).
     */
    public static CsvDataRepository getInstance() {
        if (instance == null) {
            synchronized (CsvDataRepository.class) {
                if (instance == null) {
                    instance = new CsvDataRepository();
                }
            }
        }
        return instance;
    }

    /**
     * Charge l'ensemble des fichiers CSV nécessaires au fonctionnement.
     */
    private void loadAllData() {
        loadSpecialties();
        loadWilayasAndCities();
        loadDoctors();
        loadPatients();
        loadAppointments();
    }

    /**
     * Charge les spécialités depuis "data/specialties.csv".
     */
    private void loadSpecialties() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data/specialties.csv").getInputStream(), StandardCharsets.UTF_8))) {

            br.lines().skip(1).forEach(line -> {
                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    Specialty specialty = new Specialty(parts[0].trim(), parts[1].trim());
                    specialties.put(specialty.getId(), specialty);
                }
            });

        } catch (Exception ignored) {
            // En cas d'erreur, les données correspondantes resteront vides.
        }
    }

    /**
     * Charge les wilayas et leurs villes depuis "data/cities.csv".
     * Utilise le pattern Composite (Wilaya -> City).
     */
    private void loadWilayasAndCities() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data/cities.csv").getInputStream(), StandardCharsets.UTF_8))) {

            br.lines().skip(1).forEach(line -> {
                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    String wilayaName = parts[0].trim();
                    String cityName = parts[1].trim();

                    Wilaya wilaya = wilayas.computeIfAbsent(wilayaName, Wilaya::new);
                    wilaya.addCity(new City(cityName, wilayaName));
                }
            });

        } catch (Exception ignored) {
            // En cas d'erreur, les données correspondantes resteront vides.
        }
    }

    /**
     * Charge les médecins depuis "data/doctors.csv".
     */
    private void loadDoctors() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data/doctors.csv").getInputStream(), StandardCharsets.UTF_8))) {

            br.lines().skip(1).forEach(line -> {
                String[] p = line.split(",");
                if (p.length >= 11) {
                    Doctor doctor = new Doctor(
                            p[0].trim(), p[1].trim(), p[2].trim(), p[3].trim(),
                            p[4].trim(), p[5].trim(), p[6].trim(),
                            p[7].trim(), p[8].trim(), p[9].trim(), p[10].trim());
                    doctors.put(doctor.getId(), doctor);
                }
            });

        } catch (Exception ignored) {
            // En cas d'erreur, les données correspondantes resteront vides.
        }
    }

    /**
     * Charge les patients depuis "data/patients.csv".
     */
    private void loadPatients() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data/patients.csv").getInputStream(), StandardCharsets.UTF_8))) {

            br.lines().skip(1).forEach(line -> {
                String[] p = line.split(",");
                if (p.length >= 8) {
                    Patient patient = new Patient(
                            p[0].trim(), p[1].trim(), p[2].trim(), p[3].trim(),
                            p[4].trim(), p[5].trim(), p[6].trim(),
                            p[7].trim(), p.length > 8 ? p[8].trim() : "");
                    patients.put(patient.getId(), patient);
                }
            });

        } catch (Exception ignored) {
            // En cas d'erreur, les données correspondantes resteront vides.
        }
    }

    /**
     * Charge les rendez-vous depuis "data/appointments.csv" et les rattache aux
     * patients.
     * Le champ dateTime est parsé au format "yyyy-MM-dd'T'HH:mm".
     */
    private void loadAppointments() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data/appointments.csv").getInputStream(), StandardCharsets.UTF_8))) {

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

            br.lines().skip(1).forEach(line -> {
                String[] p = line.split(",");
                if (p.length >= 5) {
                    try {
                        String raw = p[4].trim().toUpperCase();
                        Appointment.Status status;

                        // Harmonisation d'un ancien état si présent dans les CSV
                        if ("SCHEDULED".equals(raw)) {
                            status = Appointment.Status.CONFIRMED;
                        } else {
                            status = Appointment.Status.valueOf(raw);
                        }

                        Appointment appointment = new Appointment(
                                p[0].trim(),
                                p[1].trim(),
                                p[2].trim(),
                                LocalDateTime.parse(p[3].trim(), formatter),
                                status);

                        appointments.put(appointment.getId(), appointment);

                        Patient patient = patients.get(appointment.getPatientId());
                        if (patient != null) {
                            patient.addAppointment(appointment);
                        }
                    } catch (Exception ignored) {
                        // Ligne invalide : rendez-vous ignoré.
                    }
                }
            });

        } catch (Exception ignored) {
            // En cas d'erreur, les données correspondantes resteront vides.
        }
    }

    // -------------------- Accès aux données --------------------

    public List<Doctor> getAllDoctors() {
        return new ArrayList<>(doctors.values());
    }

    public List<Patient> getAllPatients() {
        return new ArrayList<>(patients.values());
    }

    public List<Appointment> getAllAppointments() {
        return new ArrayList<>(appointments.values());
    }

    public Doctor getDoctorById(String id) {
        return doctors.get(id);
    }

    public Doctor getDoctorByEmail(String email) {
        if (email == null)
            return null;
        return doctors.values().stream()
                .filter(d -> d.getEmail() != null && d.getEmail().equalsIgnoreCase(email))
                .findFirst().orElse(null);
    }

    public Patient getPatientById(String id) {
        return patients.get(id);
    }

    public Patient getPatientByEmail(String email) {
        if (email == null)
            return null;
        return patients.values().stream()
                .filter(p -> p.getEmail() != null && p.getEmail().equalsIgnoreCase(email))
                .findFirst().orElse(null);
    }

    public Appointment getAppointmentById(String id) {
        return appointments.get(id);
    }

    // -------------------- Recherches --------------------

    public List<Doctor> findDoctorsByWilayaAndCity(String wilaya, String city) {
        return doctors.values().stream()
                .filter(d -> d.getWilaya() != null && d.getCity() != null)
                .filter(d -> d.getWilaya().equalsIgnoreCase(wilaya) && d.getCity().equalsIgnoreCase(city))
                .collect(Collectors.toList());
    }

    public List<Doctor> findDoctorsBySpecialty(String specialty) {
        return doctors.values().stream()
                .filter(d -> d.getSpeciality() != null)
                .filter(d -> d.getSpeciality().equalsIgnoreCase(specialty))
                .collect(Collectors.toList());
    }

    public List<String> getAllWilayas() {
        return wilayas.keySet().stream()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    public List<String> getCitiesByWilaya(String wilayaName) {
        Wilaya wilaya = wilayas.get(wilayaName);
        if (wilaya == null)
            return Collections.emptyList();

        return wilaya.getCities().stream()
                .map(GeographicComponent::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    public boolean isValidCityForWilaya(String wilaya, String city) {
        if (!wilayas.containsKey(wilaya))
            return false;

        return wilayas.get(wilaya).getCities().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(city));
    }

    public List<String> getAllSpecialties() {
        return specialties.values().stream()
                .map(Specialty::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    public boolean isValidSpecialty(String specialtyName) {
        return specialties.values().stream()
                .anyMatch(s -> s.getName() != null && s.getName().equalsIgnoreCase(specialtyName));
    }

    public List<Appointment> getAppointmentsByPatientId(String patientId) {
        return appointments.values().stream()
                .filter(a -> a.getPatientId().equals(patientId))
                .sorted((a1, a2) -> a2.getDateTime().compareTo(a1.getDateTime()))
                .collect(Collectors.toList());
    }

    public List<Appointment> getAppointmentsByDoctorId(String doctorId) {
        return appointments.values().stream()
                .filter(a -> a.getDoctorId().equals(doctorId))
                .sorted((a1, a2) -> a2.getDateTime().compareTo(a1.getDateTime()))
                .collect(Collectors.toList());
    }

    // -------------------- Création / mise à jour des rendez-vous
    // --------------------

    public Appointment createAppointment(Appointment appointment) {
        String newId = "APP" + (appointments.size() + 1);
        appointment.setId(newId);
        appointments.put(newId, appointment);

        Patient patient = patients.get(appointment.getPatientId());
        if (patient != null) {
            patient.addAppointment(appointment);
        }

        return appointment;
    }

    public boolean updateAppointmentStatus(String appointmentId, Appointment.Status newStatus) {
        Appointment appointment = appointments.get(appointmentId);
        if (appointment != null) {
            appointment.setStatus(newStatus);
            return true;
        }
        return false;
    }

    public boolean cancelAppointment(String appointmentId) {
        return updateAppointmentStatus(appointmentId, Appointment.Status.CANCELLED);
    }

    public boolean confirmAppointment(String appointmentId) {
        Appointment appointment = appointments.get(appointmentId);
        if (appointment == null)
            return false;

        if (appointment.getStatus() == Appointment.Status.CANCELLED ||
                appointment.getStatus() == Appointment.Status.COMPLETED) {
            return false;
        }

        if (appointment.getStatus() != Appointment.Status.PENDING)
            return false;

        appointment.setStatus(Appointment.Status.CONFIRMED);
        return true;
    }

    public boolean rescheduleAppointment(String appointmentId, LocalDateTime newDateTime) {
        Appointment appointment = appointments.get(appointmentId);
        if (appointment == null)
            return false;

        if (appointment.getStatus() == Appointment.Status.CANCELLED ||
                appointment.getStatus() == Appointment.Status.COMPLETED) {
            return false;
        }

        appointment.setDateTime(newDateTime);
        appointment.setStatus(Appointment.Status.RESCHEDULED);
        return true;
    }

    public boolean completeAppointment(String appointmentId) {
        Appointment appointment = appointments.get(appointmentId);
        if (appointment == null)
            return false;

        if (appointment.getStatus() == Appointment.Status.CANCELLED ||
                appointment.getStatus() == Appointment.Status.COMPLETED ||
                appointment.getStatus() == Appointment.Status.PENDING) {
            return false;
        }

        if (appointment.getStatus() != Appointment.Status.CONFIRMED &&
                appointment.getStatus() != Appointment.Status.RESCHEDULED &&
                appointment.getStatus() != Appointment.Status.SCHEDULED) {
            return false;
        }

        appointment.setStatus(Appointment.Status.COMPLETED);
        return true;
    }

    // -------------------- Authentification --------------------

    public boolean validateDoctorCredentials(String email, String password) {
        Doctor doctor = getDoctorByEmail(email);
        return doctor != null
                && doctor.getPasswordHash() != null
                && doctor.getPasswordHash().equals(password);
    }

    public boolean validatePatientCredentials(String email, String password) {
        Patient patient = getPatientByEmail(email);
        return patient != null
                && patient.getPasswordHash() != null
                && patient.getPasswordHash().equals(password);
    }

    // -------------------- Disponibilités --------------------

    public boolean isDoctorAvailable(String doctorId, LocalDateTime dateTime) {
        Doctor doctor = getDoctorById(doctorId);
        if (doctor == null)
            return false;

        String timeSlot = dateTime.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        return doctor.getAvailableSlots() != null && doctor.getAvailableSlots().contains(timeSlot);
    }
}
