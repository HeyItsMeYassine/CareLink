import java.util.ArrayList;
import java.util.List;

public class Patient implements Observer { 

    private String id;
    private String name;
    private String phone;
    private double latitude;
    private double longitude;

    private MedicalRecord medicalRecord;
    private List<Appointment> appointments; 

    public Patient(String id, String name, String phone, double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.latitude = latitude;
        this.longitude = longitude;

        this.medicalRecord = new MedicalRecord();
        this.appointments = new ArrayList<>(); 
    }

    @Override
    public void update(String message) {
        System.out.println("\n[ALERTE MEDISYNC - Cher Patient " + name + "]");
        System.out.println("MESSAGE REÇU : " + message);
    }
    
    public void addAppointment(Appointment app) {
        this.appointments.add(app);
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public double[] getLocation() { return new double[] { latitude, longitude }; }
    public MedicalRecord getMedicalRecord() { return medicalRecord; }
    public List<Appointment> getAppointments() { return appointments; }
    
    @Override
    public String toString() {
        return "Patient ID: " + id + " | Nom: " + name;
    }
}