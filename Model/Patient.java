import java.util.ArrayList;
import java.util.List;

public class Patient {

    // Fields
    private String id;
    private String name;
    private String phone;
    private double latitude;
    private double longitude;

    private MedicalRecord medicalRecord;

    private List<Observer> observers;

    // Constructor
    public Patient(String id, String name, String phone, double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.latitude = latitude;
        this.longitude = longitude;

        this.medicalRecord = new MedicalRecord(); 
        this.observers = new ArrayList<>();
    }

    // Methods
    // ----- Get Location -----
    public double[] getLocation() {
        return new double[] { latitude, longitude };
    }

    // ----- Add Observer -----
    public void addObserver(Observer o) {
        if (!observers.contains(o)) {
            observers.add(o);
        }
    }

    // OPTIONAL: Notify observers (if needed)
    public void notifyObservers(String message) {
        for (Observer o : observers) {
            o.update(message, this);
        }
    }

    // Getters & Setters
    public String getId() { return id; }

    public String getName() { return name; }

    public String getPhone() { return phone; }

    public void setPhone(String phone) { this.phone = phone; }

    public double getLatitude() { return latitude; }

    public double getLongitude() { return longitude; }

    public MedicalRecord getMedicalRecord() { return medicalRecord; }

    public void setMedicalRecord(MedicalRecord medicalRecord) {
        this.medicalRecord = medicalRecord;
    }
}
