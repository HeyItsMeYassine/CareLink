package com.carelink.demo.controller;

import com.carelink.demo.model.Appointment;
import com.carelink.demo.model.Doctor;
import com.carelink.demo.model.Patient;
import com.carelink.demo.service.CareLinkService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur central : pages (views) et API REST.
 * Il orchestre les actions côté médecin, côté patient, et la gestion des
 * rendez-vous.
 */
@Controller
public class MediSyncController {

    @Autowired
    private CareLinkService careLinkService;

    // -------------------- VUES (PAGES) --------------------

    /** Affiche le tableau de bord médecin. */
    @GetMapping("/doctor/dashboard")
    public String doctorDashboard(Model model, HttpSession session) {
        model.addAttribute("wilayas", careLinkService.getAllWilayas());
        return "doctordashboard";
    }

    /** Affiche le profil médecin (avec listes de wilayas et spécialités). */
    @GetMapping("/doctor/profile")
    public String doctorProfile(Model model, HttpSession session) {
        model.addAttribute("wilayas", careLinkService.getAllWilayas());
        model.addAttribute("specialties", careLinkService.getAllSpecialties());
        return "doctorprofile";
    }

    /** Affiche le tableau de bord patient. */
    @GetMapping("/patient/dashboard")
    public String patientDashboard(Model model, HttpSession session) {
        model.addAttribute("wilayas", careLinkService.getAllWilayas());
        return "patientdashboard";
    }

    /** Affiche le profil patient. */
    @GetMapping("/patient/profile")
    public String patientProfile(Model model, HttpSession session) {
        model.addAttribute("wilayas", careLinkService.getAllWilayas());
        return "patientprofile";
    }

    /** Affiche la page de prise de rendez-vous. */
    @GetMapping("/appointment")
    public String appointmentPage(Model model, HttpSession session) {
        model.addAttribute("wilayas", careLinkService.getAllWilayas());
        return "appointment";
    }

    // -------------------- DONNÉES (API) --------------------

    /** Retourne la liste des wilayas. */
    @GetMapping("/api/wilayas")
    @ResponseBody
    public List<String> getAllWilayas() {
        return careLinkService.getAllWilayas();
    }

    /** Retourne les villes d’une wilaya donnée. */
    @GetMapping("/api/cities")
    @ResponseBody
    public List<String> getCitiesByWilaya(@RequestParam String wilaya) {
        return careLinkService.getCitiesByWilaya(wilaya);
    }

    /** Retourne la liste des spécialités médicales. */
    @GetMapping("/api/specialties")
    @ResponseBody
    public List<String> getAllSpecialties() {
        return careLinkService.getAllSpecialties();
    }

    /**
     * Recherche des médecins avec des filtres optionnels
     * (wilaya, ville, spécialité).
     */
    @GetMapping("/api/doctors")
    @ResponseBody
    public List<Doctor> getDoctors(
            @RequestParam(required = false) String wilaya,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialty) {

        return careLinkService.searchDoctors(wilaya, city, specialty);
    }

    /**
     * Recherche de médecins via une stratégie (pattern Strategy),
     * selon un type et un critère.
     */
    @GetMapping("/api/doctors/search-strategy")
    @ResponseBody
    public ResponseEntity<?> searchDoctorsByStrategy(
            @RequestParam String type,
            @RequestParam String criteria) {
        try {
            return ResponseEntity.ok(careLinkService.searchDoctorsByStrategy(type, criteria));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }

    /** Retourne un médecin par son identifiant. */
    @GetMapping("/api/doctor/{id}")
    @ResponseBody
    public ResponseEntity<Doctor> getDoctor(@PathVariable String id) {
        Doctor doctor = careLinkService.getDoctorById(id);
        if (doctor != null)
            return ResponseEntity.ok(doctor);
        return ResponseEntity.notFound().build();
    }

    /**
     * Retourne le médecin connecté (stocké en session).
     * Accepte doctorId ou userId selon le flux de connexion.
     */
    @GetMapping("/api/doctor/profile")
    @ResponseBody
    public ResponseEntity<Doctor> getCurrentDoctor(HttpSession session) {
        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");
        if (doctorId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);

        Doctor doctor = careLinkService.getDoctorById(doctorId);
        if (doctor != null)
            return ResponseEntity.ok(doctor);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    /**
     * Met à jour uniquement les champs autorisés du profil médecin
     * (mise à jour “restreinte”).
     */
    @PostMapping("/api/doctor/profile/update-restricted")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateRestrictedDoctorProfile(
            @RequestBody Map<String, Object> updates, HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");

        if (doctorId == null) {
            response.put("success", false);
            response.put("message", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            Doctor doctor = careLinkService.getDoctorById(doctorId);
            if (doctor == null) {
                response.put("success", false);
                response.put("message", "Doctor not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Champs simples (nettoyage avec trim)
            if (updates.containsKey("email")) {
                String email = (String) updates.get("email");
                if (email != null)
                    doctor.setEmail(email.trim());
            }

            if (updates.containsKey("phone")) {
                String phone = (String) updates.get("phone");
                if (phone != null)
                    doctor.setPhone(phone.trim());
            }

            if (updates.containsKey("wilaya")) {
                String wilaya = (String) updates.get("wilaya");
                if (wilaya != null)
                    doctor.setWilaya(wilaya.trim());
            }

            if (updates.containsKey("city")) {
                String city = (String) updates.get("city");
                if (city != null)
                    doctor.setCity(city.trim());
            }

            // Lien de localisation (peut être vide)
            if (updates.containsKey("locationLink")) {
                String link = (String) updates.get("locationLink");
                doctor.setLocationLink(link != null ? link.trim() : "");
            }

            // Mot de passe : seulement si non vide
            if (updates.containsKey("password")) {
                String password = (String) updates.get("password");
                if (password != null && !password.trim().isEmpty()) {
                    doctor.setPasswordHash(password.trim());
                }
            }

            boolean success = careLinkService.updateDoctorProfile(doctor);

            response.put("success", success);
            response.put("message", success ? "Profile updated successfully" : "Failed to update profile");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // -------------------- TABLEAU DE BORD MÉDECIN --------------------

    /** Statistiques du tableau de bord médecin. */
    @GetMapping("/api/doctor/stats")
    @ResponseBody
    public Map<String, Integer> getDoctorStats(HttpSession session) {
        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");
        return careLinkService.getDoctorDashboardStats(doctorId);
    }

    /** Liste des rendez-vous du médecin connecté. */
    @GetMapping("/api/doctor/appointments")
    @ResponseBody
    public List<Appointment> getDoctorAppointments(HttpSession session) {
        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");
        return careLinkService.getDoctorAppointments(doctorId);
    }

    // -------------------- PATIENT --------------------

    /** Retourne un patient par identifiant. */
    @GetMapping("/api/patient/{id}")
    @ResponseBody
    public ResponseEntity<Patient> getPatient(@PathVariable String id) {
        Patient patient = careLinkService.getPatientById(id);
        if (patient != null)
            return ResponseEntity.ok(patient);
        return ResponseEntity.notFound().build();
    }

    /**
     * Retourne le patient connecté (stocké en session).
     * Accepte patientId ou userId selon le flux de connexion.
     */
    @GetMapping("/api/patient/profile")
    @ResponseBody
    public ResponseEntity<Patient> getCurrentPatient(HttpSession session) {
        String patientId = (String) session.getAttribute("patientId");
        if (patientId == null)
            patientId = (String) session.getAttribute("userId");

        if (patientId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);

        Patient patient = careLinkService.getPatientById(patientId);
        if (patient != null)
            return ResponseEntity.ok(patient);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    /**
     * Met à jour uniquement les champs autorisés du profil patient
     * (mise à jour “restreinte”).
     */
    @PostMapping("/api/patient/profile/update-restricted")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateRestrictedPatientProfile(
            @RequestBody Map<String, Object> updates, HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        String patientId = (String) session.getAttribute("patientId");
        if (patientId == null)
            patientId = (String) session.getAttribute("userId");

        if (patientId == null) {
            response.put("success", false);
            response.put("message", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            Patient patient = careLinkService.getPatientById(patientId);
            if (patient == null) {
                response.put("success", false);
                response.put("message", "Patient not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Mise à jour simple des champs (trim pour éviter les espaces)
            if (updates.containsKey("email"))
                patient.setEmail(((String) updates.get("email")).trim());
            if (updates.containsKey("wilaya"))
                patient.setWilaya(((String) updates.get("wilaya")).trim());
            if (updates.containsKey("city"))
                patient.setCity(((String) updates.get("city")).trim());
            if (updates.containsKey("password"))
                patient.setPasswordHash(((String) updates.get("password")).trim());

            boolean success = careLinkService.updatePatientProfile(patient);

            response.put("success", success);
            response.put("message", success ? "Profile updated successfully" : "Failed to update profile");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /** Statistiques du tableau de bord patient. */
    @GetMapping("/api/patient/stats")
    @ResponseBody
    public Map<String, Integer> getPatientStats(HttpSession session) {
        String patientId = (String) session.getAttribute("patientId");
        if (patientId == null)
            patientId = (String) session.getAttribute("userId");
        return careLinkService.getPatientDashboardStats(patientId);
    }

    /**
     * Retourne les rendez-vous du patient avec des informations enrichies
     * sur le médecin (nom, spécialité, téléphone).
     */
    @GetMapping("/api/patient/appointments")
    @ResponseBody
    public List<AppointmentView> getPatientAppointments(HttpSession session) {
        String patientId = (String) session.getAttribute("patientId");
        if (patientId == null)
            patientId = (String) session.getAttribute("userId");

        List<Appointment> appointments = careLinkService.getPatientAppointments(patientId);

        return appointments.stream().map(a -> {
            AppointmentView v = new AppointmentView();
            v.id = a.getId();
            v.doctorId = a.getDoctorId();
            v.dateTime = a.getDateTime();
            v.status = a.getStatus();

            Doctor d = careLinkService.getDoctorById(a.getDoctorId());
            if (d != null) {
                String fn = d.getFirstName() != null ? d.getFirstName() : "";
                String ln = d.getLastName() != null ? d.getLastName() : "";
                v.doctorName = ("Dr. " + fn + " " + ln).trim();
                v.doctorSpeciality = d.getSpeciality() != null ? d.getSpeciality() : "";
                v.doctorPhone = d.getPhone() != null ? d.getPhone() : "";
            } else {
                v.doctorName = "Unknown Doctor";
                v.doctorSpeciality = "";
                v.doctorPhone = "";
            }

            return v;
        }).collect(Collectors.toList());
    }

    // -------------------- RENDEZ-VOUS --------------------

    /**
     * Crée un rendez-vous pour le patient connecté.
     * Par défaut, le rendez-vous est en attente de validation du médecin.
     */
    @PostMapping("/api/appointments/book")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> bookAppointment(
            @RequestBody Map<String, String> appointmentData,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            String patientId = (String) session.getAttribute("patientId");
            if (patientId == null)
                patientId = (String) session.getAttribute("userId");

            if (patientId == null) {
                response.put("success", false);
                response.put("message", "Not logged in");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String doctorId = appointmentData.get("doctorId");
            String date = appointmentData.get("date");
            String time = appointmentData.get("time");

            Appointment appointment = careLinkService.bookAppointment(patientId, doctorId, date, time);

            response.put("success", true);
            response.put("appointmentId", appointment.getId());
            response.put("status", appointment.getStatus());
            response.put("message", "Appointment created. Waiting for doctor response.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Annule un rendez-vous (patient ou médecin).
     * Des règles empêchent l'annulation tant que la demande est "PENDING".
     */
    @PostMapping("/api/appointments/{id}/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelAppointment(@PathVariable String id, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        Appointment apt = careLinkService.getAppointmentById(id);
        if (apt == null) {
            response.put("success", false);
            response.put("message", "Appointment not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String patientId = (String) session.getAttribute("patientId");
        if (patientId == null)
            patientId = (String) session.getAttribute("userId");

        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");

        boolean isPatientOwner = patientId != null && patientId.equals(apt.getPatientId());
        boolean isDoctorOwner = doctorId != null && doctorId.equals(apt.getDoctorId());

        if (!isPatientOwner && !isDoctorOwner) {
            response.put("success", false);
            response.put("message", "Forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (isPatientOwner && apt.getStatus() == Appointment.Status.PENDING) {
            response.put("success", false);
            response.put("message", "You must wait for the doctor response before cancelling.");
            return ResponseEntity.badRequest().body(response);
        }

        boolean success = careLinkService.cancelAppointment(id);
        response.put("success", success);
        response.put("message", success ? "Appointment cancelled" : "Failed to cancel appointment");
        return ResponseEntity.ok(response);
    }

    /**
     * Reprogramme un rendez-vous (patient ou médecin).
     * Si l'état est "PENDING", le patient doit attendre la réponse du médecin.
     */
    @PostMapping("/api/appointments/{id}/reschedule")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> rescheduleAppointment(
            @PathVariable String id,
            @RequestBody Map<String, String> rescheduleData,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        Appointment apt = careLinkService.getAppointmentById(id);
        if (apt == null) {
            response.put("success", false);
            response.put("message", "Appointment not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String patientId = (String) session.getAttribute("patientId");
        if (patientId == null)
            patientId = (String) session.getAttribute("userId");

        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");

        boolean isPatientOwner = patientId != null && patientId.equals(apt.getPatientId());
        boolean isDoctorOwner = doctorId != null && doctorId.equals(apt.getDoctorId());

        if (!isPatientOwner && !isDoctorOwner) {
            response.put("success", false);
            response.put("message", "Forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (isPatientOwner && apt.getStatus() == Appointment.Status.PENDING) {
            response.put("success", false);
            response.put("message", "You must wait for the doctor response before rescheduling.");
            return ResponseEntity.badRequest().body(response);
        }

        boolean success = careLinkService.rescheduleAppointment(
                id,
                rescheduleData.get("newDate"),
                rescheduleData.get("newTime"));

        response.put("success", success);
        response.put("message", success ? "Appointment rescheduled" : "Failed to reschedule appointment");
        return ResponseEntity.ok(response);
    }

    /** Confirme un rendez-vous (action réservée au médecin propriétaire). */
    @PostMapping("/api/appointments/{id}/confirm")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmAppointment(@PathVariable String id, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");

        if (doctorId == null) {
            response.put("success", false);
            response.put("message", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Appointment apt = careLinkService.getAppointmentById(id);
        if (apt == null) {
            response.put("success", false);
            response.put("message", "Appointment not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (!doctorId.equals(apt.getDoctorId())) {
            response.put("success", false);
            response.put("message", "Forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        boolean success = careLinkService.confirmAppointment(id);
        response.put("success", success);
        response.put("message", success ? "Appointment confirmed" : "Failed to confirm appointment");
        return ResponseEntity.ok(response);
    }

    /**
     * Marque un rendez-vous comme terminé (action réservée au médecin
     * propriétaire).
     */
    @PostMapping("/api/appointments/{id}/complete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> completeAppointment(@PathVariable String id, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String doctorId = (String) session.getAttribute("doctorId");
        if (doctorId == null)
            doctorId = (String) session.getAttribute("userId");

        if (doctorId == null) {
            response.put("success", false);
            response.put("message", "Not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Appointment apt = careLinkService.getAppointmentById(id);
        if (apt == null) {
            response.put("success", false);
            response.put("message", "Appointment not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (!doctorId.equals(apt.getDoctorId())) {
            response.put("success", false);
            response.put("message", "Forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        boolean success = careLinkService.completeAppointment(id);
        response.put("success", success);
        response.put("message", success ? "Appointment completed" : "Failed to complete appointment");
        return ResponseEntity.ok(response);
    }

    /** Vérifie si un créneau (date/heure) est disponible pour un médecin. */
    @GetMapping("/api/appointments/available-slots")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkAvailableSlots(
            @RequestParam String doctorId,
            @RequestParam String date,
            @RequestParam String time) {

        Map<String, Object> response = new HashMap<>();
        response.put("available", careLinkService.isTimeSlotAvailable(doctorId, date, time));
        return ResponseEntity.ok(response);
    }

    /**
     * Vue simplifiée côté patient : rendez-vous + infos du médecin.
     * (Classe interne utilisée pour sérialiser proprement la réponse JSON.)
     */
    static class AppointmentView {
        public String id;
        public String doctorId;

        public String doctorName;
        public String doctorSpeciality;
        public String doctorPhone;

        public LocalDateTime dateTime;
        public Appointment.Status status;
    }
}
