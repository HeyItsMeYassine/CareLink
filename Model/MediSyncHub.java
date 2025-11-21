import java.util.ArrayList;
import java.util.List;

public class MediSyncHub {
    
    private static ClinicManager instance;
    
    private List<Doctor> doctors;

    private MediSyncHub() {
        doctors = new ArrayList<>();
    }

    public static MediSyncHub getInstance() {
        if (instance == null) {
            instance = new ClinicManager();
        }
        return instance;
    }

    public void initFakeData() {
        doctors.clear(); 
        
        doctors.add(new Doctor("D01", "Benali", "Amine", "Cardiology", "Algiers"));
        doctors.add(new Doctor("D02", "Saidi", "Yasmine", "General Practitioner", "Oran"));
        doctors.add(new Doctor("D03", "Slimani", "Karim", "Dentist", "Oran"));
        doctors.add(new Doctor("D04", "Mansouri", "Nadia", "Pediatrician", "Algiers"));
        doctors.add(new Doctor("D05", "Toumi", "Khaled", "Ophthalmologist", "Algiers"));
        
        System.out.println(">> Database loaded: 5 doctors available.");
    }

    public List<Doctor> getAllDoctors() {
        return doctors;
    }

    public void addDoctor(Doctor doc) {
        doctors.add(doc);
    }
    
    
    public Doctor findDoctorByLastName(String name) { 
        for (Doctor doc : doctors) {
            if (doc.getLastName().equalsIgnoreCase(name)) {
                return doc;
            }
        }
        return null;
    }
}
