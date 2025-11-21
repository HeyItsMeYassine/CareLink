import java.util.ArrayList;
import java.util.List;
import java.time.LocalTime;


public class Doctor {
    private String id;
    private String nom;
    private String prenom;
    private String specialite;
    private String ville; 
    private List<LocalTime> disponibilites; 

    
    public Doctor(String id, String nom, String prenom, String specialite, String ville) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.specialite = specialite;
        this.ville = ville;
        this.disponibilites = new ArrayList<>();
        initDefaultSlots();
    }

    private void initDefaultSlots() {
        disponibilites.add(LocalTime.of(9, 0));
        disponibilites.add(LocalTime.of(10, 0));
        disponibilites.add(LocalTime.of(14, 0));
    }

    public String getNom() { return nom; }
    public String getSpecialite() { return specialite; }
    public List<LocalTime> getDisponibilites() { return disponibilites; }

    public boolean reserverCreneau(LocalTime heure) {
        if (disponibilites.contains(heure)) {
            disponibilites.remove(heure);
            System.out.println("Créneau de " + heure + " réservé pour Dr. " + nom);
            // Ici, on pourrait notifier les Observateurs plus tard
            return true;
        }
        return false;
    }

    @Override
    public String toString() {
        return "Dr. " + nom + " " + prenom + " [" + specialite + "] - " + ville;
    }
}
