
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TimeSlotDTO {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String displayDate;  // Ex: "Today", "Tomorrow", "Fri 24"
    private String displayTime;  // Ex: "15:00"
    private boolean available;
}
