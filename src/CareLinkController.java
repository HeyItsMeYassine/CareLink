
import com.carelink.dto.DoctorDTO;
import com.carelink.dto.DoctorFilterDTO;
import com.carelink.dto.AppointmentBookingDTO;
import com.carelink.service.DoctorService;
import com.carelink.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/carelink")
public class CareLinkController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/doctors")
    public String showDoctorsPage(Model model) {
        // Initialiser avec tous les médecins
        List<DoctorDTO> doctors = doctorService.findAllDoctors();
        model.addAttribute("doctors", doctors);
        model.addAttribute("filter", new DoctorFilterDTO());
        return "doctors"; // Retourne la vue doctors.html
    }

    @PostMapping("/doctors/search")
    @ResponseBody
    public ResponseEntity<List<DoctorDTO>> searchDoctors(@RequestBody DoctorFilterDTO filter) {
        List<DoctorDTO> doctors = doctorService.searchDoctors(filter);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors/search")
    @ResponseBody
    public ResponseEntity<List<DoctorDTO>> searchByKeyword(@RequestParam String query) {
        List<DoctorDTO> doctors = doctorService.searchByKeyword(query);
        return ResponseEntity.ok(doctors);
    }
  
    @GetMapping("/doctors/{doctorId}/timeslots")
    @ResponseBody
    public ResponseEntity<?> getAvailableTimeSlots(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        var timeSlots = appointmentService.getAvailableTimeSlots(doctorId, startDate, endDate);
        return ResponseEntity.ok(timeSlots);
    }

    @PostMapping("/appointments/book")
    @ResponseBody
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentBookingDTO booking) {
        try {
            var appointment = appointmentService.bookAppointment(booking);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la réservation: " + e.getMessage());
        }
    }

    @GetMapping("/doctors/{id}")
    @ResponseBody
    public ResponseEntity<DoctorDTO> getDoctorDetails(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.findDoctorById(id);
        if (doctor != null) {
            return ResponseEntity.ok(doctor);
        }
        return ResponseEntity.notFound().build();
    }
  
    @PostMapping("/logout")
    public String logout() {
        return "redirect:/login?logout";
    }

    @GetMapping("/specialties")
    @ResponseBody
    public ResponseEntity<List<String>> getSpecialties() {
        List<String> specialties = doctorService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
    }

    @GetMapping("/cities")
    @ResponseBody
    public ResponseEntity<List<String>> getCities() {
        List<String> cities = doctorService.getAllCities();
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/states")
    @ResponseBody
    public ResponseEntity<List<String>> getStates() {
        List<String> states = doctorService.getAllStates();
        return ResponseEntity.ok(states);
    }
}
