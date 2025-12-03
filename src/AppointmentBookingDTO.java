import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentBookingDTO {
    private Long doctorId;
    private Long patientId;
    private Long timeSlotId;
    private LocalDateTime appointmentDateTime;
    private String notes;
}
