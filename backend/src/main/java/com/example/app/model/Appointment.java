import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Appointment {

    public enum Status {
        SCHEDULED, 
        RESCHEDULED,
        CANCELLED,
        COMPLETED
    }

   
    private String id;
    private Patient patient;
    private Doctor doctor;  
    private LocalDateTime dateTime;
    private Status status;   

    public Appointment(String id, Patient patient, Doctor doctor, LocalDateTime dateTime) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.dateTime = dateTime;
        this.status = Status.SCHEDULED;
        
        this.doctor.addObserver(this.patient);
    }

    public void reschedule(LocalDateTime newTime) {
        this.dateTime = newTime;
        this.status = Status.RESCHEDULED;
        String msg = "Appointment " + id + " has been rescheduled to " + newTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + " by Dr. " + doctor.getLastName() + ".";
        this.doctor.notifyObservers(msg);
    }

    public void cancel() {
        this.status = Status.CANCELLED;
        String msg = "Appointment " + id + " with Dr. " + doctor.getLastName() + " on " + this.dateTime.toLocalDate() + " has been CANCELLED.";
        this.doctor.notifyObservers(msg);
        
    }

    public String getId() { return id; }
    public Patient getPatient() { return patient; } 
    public Doctor getDoctor() { return doctor; }  
    public LocalDateTime getDateTime() { return dateTime; }
    public Status getStatus() { return status; }

    public void setStatus(Status newStatus) {
        this.status = newStatus;
    }

    @Override
    public String toString() {
        return String.format("RDV ID: %s | Dr. %s | Patient: %s | Time: %s | Status: %s",
                id, doctor.getLastName(), patient.getLastName(), dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), status);
    }
}
