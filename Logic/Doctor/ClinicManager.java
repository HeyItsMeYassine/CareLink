import java.util.ArrayList;
import java.util.List;

public class ClinicManager {
    
    private static ClinicManager instance;
    
    private List<Doctor> doctors;

    private ClinicManager() {
        doctors = new ArrayList<>();
    }

    public static ClinicManager getInstance() {
        if (instance == null) {
            instance = new ClinicManager();
        }
        return instance;
    }

    // --- Chargement des 5 médecins (Données de test) ---
    public void initFakeData() {
        doctors.clear(); 
        
        // 5 Médecins fictifs variés pour tester l'application
        doctors.add(new Doctor("D01", "Benali", "Amine", "Cardiologue", "Alger"));
        doctors.add(new Doctor("D02", "Saidi", "Yasmine", "Généraliste", "Oran"));
        doctors.add(new Doctor("D03", "Slimani", "Karim", "Dentiste", "Oran"));
        doctors.add(new Doctor("D04", "Mansouri", "Nadia", "Pédiatre", "Alger"));
        doctors.add(new Doctor("D05", "Toumi", "Khaled", "Ophtalmologue", "Alger"));
        
        System.out.println(">> Base de données chargée : 5 médecins disponibles.");
    }

    public List<Doctor> getAllDoctors() {
        return doctors;
    }

    public void addDoctor(Doctor doc) {
        doctors.add(doc);
    }
    
    public Doctor findDoctorByName(String name) {
        for (Doctor doc : doctors) {
            if (doc.getNom().equalsIgnoreCase(name)) {
                return doc;
            }
        }
        return null;
    }
}
