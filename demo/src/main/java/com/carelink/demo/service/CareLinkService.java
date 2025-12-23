package com.carelink.demo.service;

import com.carelink.demo.model.Appointment;
import com.carelink.demo.model.Doctor;
import com.carelink.demo.model.Patient;

import java.util.List;
import java.util.Map;

public interface CareLinkService {

    // ========== DOCTOR OPERATIONS ==========
    List<Doctor> getAllDoctors();

    Doctor getDoctorById(String id);

    Doctor getDoctorByEmail(String email);

    List<Doctor> findDoctorsByLocation(String wilaya, String city);

    List<Doctor> findDoctorsBySpecialty(String specialty);

    List<Doctor> searchDoctors(String wilaya, String city, String specialty);

    // ✅ STRATEGY SEARCH
    List<Doctor> searchDoctorsByStrategy(String searchType, String criteria);

    // ========== PATIENT OPERATIONS ==========
    List<Patient> getAllPatients();

    Patient getPatientById(String id);

    Patient getPatientByEmail(String email);

    // ========== LOCATION OPERATIONS ==========
    List<String> getAllWilayas();

    List<String> getCitiesByWilaya(String wilaya);

    boolean validateLocation(String wilaya, String city);

    // ========== SPECIALTY OPERATIONS ==========
    List<String> getAllSpecialties();

    boolean isValidSpecialty(String specialtyName);

    // ========== APPOINTMENT OPERATIONS ==========
    List<Appointment> getAllAppointments();

    Appointment getAppointmentById(String id);

    List<Appointment> getPatientAppointments(String patientId);

    List<Appointment> getDoctorAppointments(String doctorId);

    Appointment bookAppointment(String patientId, String doctorId, String date, String time);

    boolean rescheduleAppointment(String appointmentId, String newDate, String newTime);

    boolean cancelAppointment(String appointmentId);

    boolean confirmAppointment(String appointmentId);

    boolean completeAppointment(String appointmentId);

    // ========== AUTHENTICATION & REGISTRATION ==========
    Doctor authenticateDoctor(String email, String password);

    Patient authenticatePatient(String email, String password);

    Doctor registerDoctor(Doctor doctor);

    Patient registerPatient(Patient patient);

    boolean updateDoctorProfile(Doctor doctor);

    boolean updatePatientProfile(Patient patient);

    // ========== VALIDATION ==========
    boolean validateDoctorCredentials(String email, String password);

    boolean validatePatientCredentials(String email, String password);

    boolean isTimeSlotAvailable(String doctorId, String date, String time);

    // ========== DASHBOARD STATISTICS ==========
    Map<String, Integer> getDoctorDashboardStats(String doctorId);

    Map<String, Integer> getPatientDashboardStats(String patientId);

    List<Appointment> getTodayAppointmentsForDoctor(String doctorId);

    List<Appointment> getUpcomingAppointmentsForPatient(String patientId);
}
