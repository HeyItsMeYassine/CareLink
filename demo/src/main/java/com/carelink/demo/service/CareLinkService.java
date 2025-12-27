package com.carelink.demo.service;

import com.carelink.demo.model.Appointment;
import com.carelink.demo.model.Doctor;
import com.carelink.demo.model.Patient;

import java.util.List;
import java.util.Map;

/**
 * Interface du service principal de l'application CareLink.
 * Elle définit les opérations métier : utilisateurs, recherche, rendez-vous et
 * statistiques.
 */
public interface CareLinkService {

    // -------------------- Médecins --------------------

    /** Retourne la liste complète des médecins. */
    List<Doctor> getAllDoctors();

    /** Retourne un médecin par son identifiant. */
    Doctor getDoctorById(String id);

    /** Retourne un médecin via son email. */
    Doctor getDoctorByEmail(String email);

    /** Recherche de médecins par localisation (wilaya/ville). */
    List<Doctor> findDoctorsByLocation(String wilaya, String city);

    /** Recherche de médecins par spécialité. */
    List<Doctor> findDoctorsBySpecialty(String specialty);

    /** Recherche multi-critères (wilaya, ville, spécialité). */
    List<Doctor> searchDoctors(String wilaya, String city, String specialty);

    /**
     * Recherche via le pattern Strategy (ex: "specialty", "location",
     * "availability").
     */
    List<Doctor> searchDoctorsByStrategy(String searchType, String criteria);

    // -------------------- Patients --------------------

    /** Retourne la liste complète des patients. */
    List<Patient> getAllPatients();

    /** Retourne un patient par son identifiant. */
    Patient getPatientById(String id);

    /** Retourne un patient via son email. */
    Patient getPatientByEmail(String email);

    // -------------------- Localisation --------------------

    /** Retourne la liste des wilayas disponibles. */
    List<String> getAllWilayas();

    /** Retourne les villes d'une wilaya. */
    List<String> getCitiesByWilaya(String wilaya);

    /** Vérifie qu'une ville appartient bien à une wilaya. */
    boolean validateLocation(String wilaya, String city);

    // -------------------- Spécialités --------------------

    /** Retourne la liste des spécialités disponibles. */
    List<String> getAllSpecialties();

    /** Vérifie qu'une spécialité existe dans les données. */
    boolean isValidSpecialty(String specialtyName);

    // -------------------- Rendez-vous --------------------

    /** Retourne tous les rendez-vous. */
    List<Appointment> getAllAppointments();

    /** Retourne un rendez-vous par identifiant. */
    Appointment getAppointmentById(String id);

    /** Retourne les rendez-vous d'un patient. */
    List<Appointment> getPatientAppointments(String patientId);

    /** Retourne les rendez-vous d'un médecin. */
    List<Appointment> getDoctorAppointments(String doctorId);

    /** Crée un rendez-vous (statut initial généralement PENDING). */
    Appointment bookAppointment(String patientId, String doctorId, String date, String time);

    /** Reprogramme un rendez-vous existant. */
    boolean rescheduleAppointment(String appointmentId, String newDate, String newTime);

    /** Annule un rendez-vous. */
    boolean cancelAppointment(String appointmentId);

    /** Confirme un rendez-vous (côté médecin). */
    boolean confirmAppointment(String appointmentId);

    /** Marque un rendez-vous comme terminé. */
    boolean completeAppointment(String appointmentId);

    // -------------------- Authentification / Inscription --------------------

    /** Authentifie un médecin avec email et mot de passe. */
    Doctor authenticateDoctor(String email, String password);

    /** Authentifie un patient avec email et mot de passe. */
    Patient authenticatePatient(String email, String password);

    /** Inscrit un nouveau médecin. */
    Doctor registerDoctor(Doctor doctor);

    /** Inscrit un nouveau patient. */
    Patient registerPatient(Patient patient);

    /** Met à jour le profil d'un médecin. */
    boolean updateDoctorProfile(Doctor doctor);

    /** Met à jour le profil d'un patient. */
    boolean updatePatientProfile(Patient patient);

    // -------------------- Validation --------------------

    /** Vérifie les identifiants d'un médecin. */
    boolean validateDoctorCredentials(String email, String password);

    /** Vérifie les identifiants d'un patient. */
    boolean validatePatientCredentials(String email, String password);

    /** Vérifie si un créneau est disponible pour un médecin. */
    boolean isTimeSlotAvailable(String doctorId, String date, String time);

    // -------------------- Statistiques (dashboards) --------------------

    /** Statistiques affichées sur le tableau de bord médecin. */
    Map<String, Integer> getDoctorDashboardStats(String doctorId);

    /** Statistiques affichées sur le tableau de bord patient. */
    Map<String, Integer> getPatientDashboardStats(String patientId);

    /** Liste des rendez-vous du jour pour un médecin. */
    List<Appointment> getTodayAppointmentsForDoctor(String doctorId);

    /** Liste des rendez-vous à venir pour un patient. */
    List<Appointment> getUpcomingAppointmentsForPatient(String patientId);
}
