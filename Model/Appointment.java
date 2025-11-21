import java.time.LocalDateTime;

public class Appointment {

    // Fields
    private String id;
    private String patientId;
    private String doctorId;
    private LocalDateTime dateTime;
    private String status;   // "scheduled", "rescheduled" or "cancelled"

    // Constructor
    public Appointment(String id, String patientId, String doctorId, LocalDateTime dateTime) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.dateTime = dateTime;
        this.status = "scheduled";
    }

    // Methods
    // Reschedule appointment to a new time
    public void reschedule(LocalDateTime newTime) {
        this.dateTime = newTime;
        this.status = "rescheduled";
    }

    // Cancel the appointment
    public void cancel() {
        this.status = "cancelled";
    }

    // Getters & Setters
    public String getId() {
        return id;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public String getStatus() {
        return status;
    }
}
