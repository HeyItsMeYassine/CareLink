import com.carelink.dto.AppointmentBookingDTO;
import com.carelink.dto.TimeSlotDTO;
import com.carelink.entity.Appointment;
import com.carelink.entity.TimeSlot;
import com.carelink.repository.AppointmentRepository;
import com.carelink.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    public List<TimeSlotDTO> getAvailableTimeSlots(Long doctorId, String startDate, String endDate) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now();
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : start.plusDays(7);

        List<TimeSlot> slots = timeSlotRepository.findByDoctorIdAndDateBetweenAndAvailable(
                doctorId, start.atStartOfDay(), end.atTime(23, 59));

        return slots.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Appointment bookAppointment(AppointmentBookingDTO booking) {
        // Vérifier que le créneau est disponible
        TimeSlot slot = timeSlotRepository.findById(booking.getTimeSlotId())
                .orElseThrow(() -> new RuntimeException("Créneau non trouvé"));

        if (!slot.isAvailable()) {
            throw new RuntimeException("Ce créneau n'est plus disponible");
        }

        // Créer le rendez-vous
        Appointment appointment = new Appointment();
        appointment.setDoctorId(booking.getDoctorId());
        appointment.setPatientId(booking.getPatientId());
        appointment.setTimeSlot(slot);
        appointment.setAppointmentDateTime(booking.getAppointmentDateTime());
        appointment.setNotes(booking.getNotes());
        appointment.setStatus("CONFIRMED");

        // Marquer le créneau comme indisponible
        slot.setAvailable(false);
        timeSlotRepository.save(slot);

        return appointmentRepository.save(appointment);
    }

    private TimeSlotDTO convertToDTO(TimeSlot slot) {
        TimeSlotDTO dto = new TimeSlotDTO();
        dto.setId(slot.getId());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        dto.setDisplayTime(slot.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")));
        dto.setAvailable(slot.isAvailable());
        
        // Formater la date d'affichage
        LocalDate slotDate = slot.getStartTime().toLocalDate();
        LocalDate today = LocalDate.now();
        if (slotDate.equals(today)) {
            dto.setDisplayDate("Today");
        } else if (slotDate.equals(today.plusDays(1))) {
            dto.setDisplayDate("Tomorrow");
        } else {
            dto.setDisplayDate(slotDate.format(DateTimeFormatter.ofPattern("EEE dd")));
        }
        
        return dto;
    }
}
