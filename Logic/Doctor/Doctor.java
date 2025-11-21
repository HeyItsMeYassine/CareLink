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

    private List<Observer> observers; 

    public Doctor(String id, String nom, String prenom, String specialite, String ville) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.specialite = specialite;
        this.ville = ville;
        
        this.disponibilites = new ArrayList<>();
        this.observers = new ArrayList<>();
        
        initDefaultSlots();
    }

    private void initDefaultSlots() {
        disponibilites.add(LocalTime.of(9, 0));
        disponibilites.add(LocalTime.of(10, 0));
        disponibilites.add(LocalTime.of(11, 0));
        disponibilites.add(LocalTime.of(14, 0));
        disponibilites.add(LocalTime.of(15, 0));
    }

    public String getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getSpecialite() { return specialite; }
    public String getVille() { return ville; }
    public List<LocalTime> getDisponibilites() { return disponibilites; }


    public boolean reserverCreneau(LocalTime heure) {
        if (disponibilites.contains(heure)) {
            disponibilites.remove(heure);
            System.out.println(">>> Succès : Créneau de " + heure + " réservé pour Dr. " + nom);
            
            notifyObservers("ALERTE : Le créneau de " + heure + " chez Dr " + nom + " vient d'être réservé !");
            
            return true;
        } else {
            System.out.println(">>> Erreur : Le créneau " + heure + " n'est pas disponible.");
            return false;
        }
    }

    public void addObserver(Observer o) {
        observers.add(o);
    }

    public void removeObserver(Observer o) {
        observers.remove(o);
    }

    private void notifyObservers(String message) {
        for (Observer o : observers) {
            o.update(message);
        }
    }
    
    @Override
    public String toString() {
        return String.format("Dr. %-10s %-10s | Spécialité: %-15s | Ville: %-10s | Créneaux libres: %d", 
                nom, prenom, specialite, ville, disponibilites.size());
    }
}
