
import lombok.Data;
import java.util.List;

@Data
public class DoctorFilterDTO {
    private List<String> states;      // Ex: ["Alger", "Oran"]
    private List<String> specialties; // Ex: ["Cardiology", "Dentist"]
    private List<String> cities;      // Ex: ["Alger Centre", "Ain Benian"]
    private String searchQuery;        // Recherche textuelle
}
