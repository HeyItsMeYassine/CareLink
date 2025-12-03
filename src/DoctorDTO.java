import lombok.Data;
import java.util.List;

@Data
public class DoctorDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String specialty;
    private String address;
    private String city;
    private String state;
    private Double rating;
    private Integer reviewCount;
    private String avatarUrl;
    private List<TimeSlotDTO> availableSlots;
}
