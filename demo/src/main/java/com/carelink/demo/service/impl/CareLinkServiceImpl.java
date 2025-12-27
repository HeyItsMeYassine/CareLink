package com.carelink.demo.service.impl;

import com.carelink.demo.model.*;
import com.carelink.demo.model.strategy.DoctorSearchContext;
import com.carelink.demo.model.strategy.SearchByAvailability;
import com.carelink.demo.model.strategy.SearchByLocation;
import com.carelink.demo.model.strategy.SearchBySpecialty;
import com.carelink.demo.repository.CsvDataRepository;
import com.carelink.demo.service.CareLinkService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implémentation du service principal CareLink.
 * Elle centralise la logique métier : utilisateurs, recherches, rendez-vous et
 * statistiques.
 */
@Service
public class CareLinkServiceImpl implements CareLinkService {

    /** Repository CSV (source principale des données). */
    private final CsvDataRepository csvDataRepository = CsvDataRepository.getInstance();

    /**
     * Données créées à l'exécution (inscriptions depuis l'application).
     * Elles complètent les données CSV.
     */
    private final List<Patient> registeredPatients = new ArrayList<>();
    private final List<Doctor> registeredDoctors = new ArrayList<>();

    // -------------------- Médecins --------------------

    @Override
    public List<Doctor> getAllDoctors() {
        List<Doctor> allDoctors = new ArrayList<>(csvDataRepository.getAllDoctors());
        allDoctors.addAll(registeredDoctors);
        return allDoctors;
    }

    @Override
    public Doctor getDoctorById(String id) {
        return registeredDoctors.stream()
                .filter(d -> d.getId().equals(id))
                .findFirst()
                .orElse(csvDataRepository.getDoctorById(id));
    }

    @Override
    public Doctor getDoctorByEmail(String email) {
        return registeredDoctors.stream()
                .filter(d -> d.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(csvDataRepository.getDoctorByEmail(email));
    }

    /**
     * Recherche simple par wilaya/ville (filtres optionnels).
     */
    @Override
    public List<Doctor> findDoctorsByLocation(String wilaya, String city) {
        List<Doctor> allDoctors = getAllDoctors();
        return allDoctors.stream()
                .filter(d -> (wilaya == null || d.getWilaya().equalsIgnoreCase(wilaya)) &&
                        (city == null || d.getCity().equalsIgnoreCase(city)))
                .collect(Collectors.toList());
    }

    /**
     * Recherche simple par spécialité.
     */
    @Override
    public List<Doctor> findDoctorsBySpecialty(String specialty) {
        List<Doctor> allDoctors = getAllDoctors();
        return allDoctors.stream()
                .filter(d -> d.getSpeciality().equalsIgnoreCase(specialty))
                .collect(Collectors.toList());
    }

    /**
     * Recherche multi-critères (wilaya, ville, spécialité).
     */
    @Override
    public List<Doctor> searchDoctors(String wilaya, String city, String specialty) {
        List<Doctor> filteredDoctors = getAllDoctors();

        if (wilaya != null && !wilaya.isEmpty()) {
            filteredDoctors = filteredDoctors.stream()
                    .filter(d -> d.getWilaya().equalsIgnoreCase(wilaya))
                    .collect(Collectors.toList());
        }

        if (city != null && !city.isEmpty()) {
            filteredDoctors = filteredDoctors.stream()
                    .filter(d -> d.getCity().equalsIgnoreCase(city))
                    .collect(Collectors.toList());
        }

        if (specialty != null && !specialty.isEmpty()) {
            filteredDoctors = filteredDoctors.stream()
                    .filter(d -> d.getSpeciality().equalsIgnoreCase(specialty))
                    .collect(Collectors.toList());
        }

        return filteredDoctors;
    }

    // -------------------- Patients --------------------

    @Override
    public List<Patient> getAllPatients() {
        List<Patient> allPatients = new ArrayList<>(csvDataRepository.getAllPatients());
        allPatients.addAll(registeredPatients);
        return allPatients;
    }

    @Override
    public Patient getPatientById(String id) {
        return registeredPatients.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(csvDataRepository.getPatientById(id));
    }

    @Override
    public Patient getPatientByEmail(String email) {
        return registeredPatients.stream()
                .filter(p -> p.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(csvDataRepository.getPatientByEmail(email));
    }

    // -------------------- Géographie / Spécialités --------------------

    @Override
    public List<String> getAllWilayas() {
        return csvDataRepository.getAllWilayas();
    }

    @Override
    public List<String> getCitiesByWilaya(String wilaya) {
        return csvDataRepository.getCitiesByWilaya(wilaya);
    }

    @Override
    public boolean validateLocation(String wilaya, String city) {
        return csvDataRepository.isValidCityForWilaya(wilaya, city);
    }

    @Override
    public List<String> getAllSpecialties() {
        return csvDataRepository.getAllSpecialties();
    }

    @Override
    public boolean isValidSpecialty(String specialtyName) {
        return csvDataRepository.isValidSpecialty(specialtyName);
    }

    // -------------------- Rendez-vous --------------------

    @Override
    public List<Appointment> getAllAppointments() {
        return csvDataRepository.getAllAppointments();
    }

    @Override
    public Appointment getAppointmentById(String id) {
        return csvDataRepository.getAppointmentById(id);
    }

    @Override
    public List<Appointment> getPatientAppointments(String patientId) {
        return csvDataRepository.getAppointmentsByPatientId(patientId);
    }

    @Override
    public List<Appointment> getDoctorAppointments(String doctorId) {
        return csvDataRepository.getAppointmentsByDoctorId(doctorId);
    }

    /**
     * Crée un rendez-vous au statut PENDING (en attente de validation du médecin).
     */
    @Override
    public Appointment bookAppointment(String patientId, String doctorId, String date, String time) {
        if (patientId == null || doctorId == null || date == null || time == null) {
            throw new IllegalArgumentException("Missing required appointment details");
        }

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalDate appointmentDate = LocalDate.parse(date, dateFormatter);
        LocalTime appointmentTime = LocalTime.parse(time, timeFormatter);
        LocalDateTime dateTime = LocalDateTime.of(appointmentDate, appointmentTime);

        if (!isTimeSlotAvailable(doctorId, date, time)) {
            throw new IllegalStateException("Selected time slot is not available");
        }

        Patient patient = getPatientById(patientId);
        if (patient == null)
            throw new IllegalArgumentException("Patient not found");

        Doctor doctor = getDoctorById(doctorId);
        if (doctor == null)
            throw new IllegalArgumentException("Doctor not found");

        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(doctorId);
        appointment.setDateTime(dateTime);
        appointment.setStatus(Appointment.Status.PENDING);
        appointment.setNotes("Waiting for doctor response");

        // Réserve le créneau dans la disponibilité du médecin
        doctor.bookSlot(time);

        return csvDataRepository.createAppointment(appointment);
    }

    /**
     * Reprogramme un rendez-vous si le nouveau créneau est disponible.
     */
    @Override
    public boolean rescheduleAppointment(String appointmentId, String newDate, String newTime) {
        try {
            Appointment appointment = csvDataRepository.getAppointmentById(appointmentId);
            if (appointment == null)
                return false;

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            LocalDate appointmentDate = LocalDate.parse(newDate, dateFormatter);
            LocalTime appointmentTime = LocalTime.parse(newTime, timeFormatter);
            LocalDateTime newDateTime = LocalDateTime.of(appointmentDate, appointmentTime);

            if (!isTimeSlotAvailable(appointment.getDoctorId(), newDate, newTime))
                return false;

            return csvDataRepository.rescheduleAppointment(appointmentId, newDateTime);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean cancelAppointment(String appointmentId) {
        return csvDataRepository.cancelAppointment(appointmentId);
    }

    @Override
    public boolean confirmAppointment(String appointmentId) {
        return csvDataRepository.confirmAppointment(appointmentId);
    }

    @Override
    public boolean completeAppointment(String appointmentId) {
        return csvDataRepository.completeAppointment(appointmentId);
    }

    // -------------------- Authentification / Inscription --------------------

    @Override
    public Doctor authenticateDoctor(String email, String password) {
        Optional<Doctor> registeredDoctor = registeredDoctors.stream()
                .filter(d -> d.getEmail().equalsIgnoreCase(email) && d.getPasswordHash().equals(password))
                .findFirst();
        if (registeredDoctor.isPresent())
            return registeredDoctor.get();

        return csvDataRepository.validateDoctorCredentials(email, password)
                ? csvDataRepository.getDoctorByEmail(email)
                : null;
    }

    @Override
    public Patient authenticatePatient(String email, String password) {
        Optional<Patient> registeredPatient = registeredPatients.stream()
                .filter(p -> p.getEmail().equalsIgnoreCase(email) && p.getPasswordHash().equals(password))
                .findFirst();
        if (registeredPatient.isPresent())
            return registeredPatient.get();

        return csvDataRepository.validatePatientCredentials(email, password)
                ? csvDataRepository.getPatientByEmail(email)
                : null;
    }

    /**
     * Inscrit un médecin en vérifiant l'unicité de l'email.
     */
    @Override
    public Doctor registerDoctor(Doctor doctor) {
        boolean emailExists = registeredDoctors.stream()
                .anyMatch(d -> d.getEmail().equalsIgnoreCase(doctor.getEmail()));
        if (!emailExists)
            emailExists = csvDataRepository.getDoctorByEmail(doctor.getEmail()) != null;
        if (emailExists)
            throw new IllegalArgumentException("Email already registered");

        int nextId = csvDataRepository.getAllDoctors().size() + registeredDoctors.size() + 1;
        String newId = "D" + String.format("%03d", nextId);
        doctor.setId(newId);

        registeredDoctors.add(doctor);
        return doctor;
    }

    /**
     * Inscrit un patient en vérifiant l'unicité de l'email.
     */
    @Override
    public Patient registerPatient(Patient patient) {
        boolean emailExists = registeredPatients.stream()
                .anyMatch(p -> p.getEmail().equalsIgnoreCase(patient.getEmail()));
        if (!emailExists)
            emailExists = csvDataRepository.getPatientByEmail(patient.getEmail()) != null;
        if (emailExists)
            throw new IllegalArgumentException("Email already registered");

        int nextId = csvDataRepository.getAllPatients().size() + registeredPatients.size() + 1;
        String newId = "P" + String.format("%03d", nextId);
        patient.setId(newId);

        registeredPatients.add(patient);
        return patient;
    }

    // -------------------- Mise à jour de profil --------------------

    @Override
    public boolean updateDoctorProfile(Doctor doctor) {
        Optional<Doctor> existingRegisteredDoctor = registeredDoctors.stream()
                .filter(d -> d.getId().equals(doctor.getId()))
                .findFirst();

        if (existingRegisteredDoctor.isPresent()) {
            Doctor foundDoctor = existingRegisteredDoctor.get();
            foundDoctor.setFirstName(doctor.getFirstName());
            foundDoctor.setLastName(doctor.getLastName());
            foundDoctor.setEmail(doctor.getEmail());
            foundDoctor.setPhone(doctor.getPhone());
            foundDoctor.setSexe(doctor.getSexe());
            foundDoctor.setWilaya(doctor.getWilaya());
            foundDoctor.setCity(doctor.getCity());
            foundDoctor.setSpeciality(doctor.getSpeciality());
            foundDoctor.setLocationLink(doctor.getLocationLink());

            if (doctor.getPasswordHash() != null && !doctor.getPasswordHash().isEmpty()) {
                foundDoctor.setPasswordHash(doctor.getPasswordHash());
            }
            return true;
        }

        Doctor existingCsvDoctor = csvDataRepository.getDoctorById(doctor.getId());
        if (existingCsvDoctor != null) {
            registeredDoctors.add(doctor);
            return true;
        }
        return false;
    }

    @Override
    public boolean updatePatientProfile(Patient patient) {
        Optional<Patient> existingRegisteredPatient = registeredPatients.stream()
                .filter(p -> p.getId().equals(patient.getId()))
                .findFirst();

        if (existingRegisteredPatient.isPresent()) {
            Patient foundPatient = existingRegisteredPatient.get();
            foundPatient.setFirstName(patient.getFirstName());
            foundPatient.setLastName(patient.getLastName());
            foundPatient.setEmail(patient.getEmail());
            foundPatient.setPhone(patient.getPhone());
            foundPatient.setSexe(patient.getSexe());
            foundPatient.setWilaya(patient.getWilaya());
            foundPatient.setCity(patient.getCity());

            if (patient.getPasswordHash() != null && !patient.getPasswordHash().isEmpty()) {
                foundPatient.setPasswordHash(patient.getPasswordHash());
            }
            return true;
        }

        Patient existingCsvPatient = csvDataRepository.getPatientById(patient.getId());
        if (existingCsvPatient != null) {
            registeredPatients.add(patient);
            return true;
        }
        return false;
    }

    // -------------------- Disponibilités --------------------

    @Override
    public boolean validateDoctorCredentials(String email, String password) {
        boolean inRegistered = registeredDoctors.stream()
                .anyMatch(d -> d.getEmail().equalsIgnoreCase(email) && d.getPasswordHash().equals(password));
        if (inRegistered)
            return true;
        return csvDataRepository.validateDoctorCredentials(email, password);
    }

    @Override
    public boolean validatePatientCredentials(String email, String password) {
        boolean inRegistered = registeredPatients.stream()
                .anyMatch(p -> p.getEmail().equalsIgnoreCase(email) && p.getPasswordHash().equals(password));
        if (inRegistered)
            return true;
        return csvDataRepository.validatePatientCredentials(email, password);
    }

    /**
     * Vérifie la disponibilité d'un créneau pour un médecin.
     */
    @Override
    public boolean isTimeSlotAvailable(String doctorId, String date, String time) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            LocalDate appointmentDate = LocalDate.parse(date, dateFormatter);
            LocalTime appointmentTime = LocalTime.parse(time, timeFormatter);
            LocalDateTime dateTime = LocalDateTime.of(appointmentDate, appointmentTime);

            return csvDataRepository.isDoctorAvailable(doctorId, dateTime);
        } catch (Exception e) {
            return false;
        }
    }

    // -------------------- Statistiques (dashboards) --------------------

    @Override
    public Map<String, Integer> getDoctorDashboardStats(String doctorId) {
        Map<String, Integer> stats = new HashMap<>();
        List<Appointment> allAppointments = getDoctorAppointments(doctorId);

        LocalDate today = LocalDate.now();

        long todayCount = allAppointments.stream()
                .filter(a -> a.getDateTime().toLocalDate().equals(today))
                .filter(a -> a.getStatus() == Appointment.Status.CONFIRMED
                        || a.getStatus() == Appointment.Status.RESCHEDULED
                        || a.getStatus() == Appointment.Status.PENDING)
                .count();

        long pendingCount = allAppointments.stream()
                .filter(a -> a.getStatus() == Appointment.Status.PENDING)
                .count();

        long uniquePatients = allAppointments.stream()
                .map(Appointment::getPatientId)
                .distinct()
                .count();

        stats.put("todayAppointments", (int) todayCount);
        stats.put("pendingAppointments", (int) pendingCount);
        stats.put("totalPatients", (int) uniquePatients);

        return stats;
    }

    @Override
    public Map<String, Integer> getPatientDashboardStats(String patientId) {
        Map<String, Integer> stats = new HashMap<>();
        List<Appointment> allAppointments = getPatientAppointments(patientId);

        LocalDateTime now = LocalDateTime.now();

        long upcomingCount = allAppointments.stream()
                .filter(a -> a.getDateTime().isAfter(now))
                .filter(a -> a.getStatus() == Appointment.Status.PENDING
                        || a.getStatus() == Appointment.Status.CONFIRMED
                        || a.getStatus() == Appointment.Status.RESCHEDULED)
                .count();

        long completedCount = allAppointments.stream()
                .filter(a -> a.getStatus() == Appointment.Status.COMPLETED)
                .count();

        stats.put("upcomingAppointments", (int) upcomingCount);
        stats.put("totalAppointments", allAppointments.size());
        stats.put("completedAppointments", (int) completedCount);

        return stats;
    }

    @Override
    public List<Appointment> getTodayAppointmentsForDoctor(String doctorId) {
        LocalDate today = LocalDate.now();
        return getDoctorAppointments(doctorId).stream()
                .filter(a -> a.getDateTime().toLocalDate().equals(today))
                .filter(a -> a.getStatus() == Appointment.Status.CONFIRMED
                        || a.getStatus() == Appointment.Status.RESCHEDULED
                        || a.getStatus() == Appointment.Status.PENDING)
                .sorted(Comparator.comparing(Appointment::getDateTime))
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> getUpcomingAppointmentsForPatient(String patientId) {
        LocalDateTime now = LocalDateTime.now();
        return getPatientAppointments(patientId).stream()
                .filter(a -> a.getDateTime().isAfter(now))
                .filter(a -> a.getStatus() == Appointment.Status.PENDING
                        || a.getStatus() == Appointment.Status.CONFIRMED
                        || a.getStatus() == Appointment.Status.RESCHEDULED)
                .sorted(Comparator.comparing(Appointment::getDateTime))
                .collect(Collectors.toList());
    }

    // -------------------- Recherche (Strategy) --------------------

    /**
     * Recherche de médecins selon une stratégie (spécialité, localisation,
     * disponibilité).
     */
    @Override
    public List<Doctor> searchDoctorsByStrategy(String searchType, String criteria) {
        if (criteria == null || criteria.trim().isEmpty()) {
            return getAllDoctors();
        }

        if (searchType == null) {
            throw new IllegalArgumentException("Search type is required");
        }

        DoctorSearchContext context = new DoctorSearchContext();

        switch (searchType.toLowerCase()) {
            case "specialty":
                context.setSearchStrategy(new SearchBySpecialty());
                break;
            case "location":
                context.setSearchStrategy(new SearchByLocation());
                break;
            case "availability":
                context.setSearchStrategy(new SearchByAvailability());
                break;
            default:
                throw new IllegalArgumentException("Unknown search type: " + searchType);
        }

        return context.executeSearch(getAllDoctors(), criteria);
    }
}
