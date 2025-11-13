package m;

public class Medecin {

    private String id;
    private String nom;
    private String prenom;
    private String specialite;
    private String email;
    private String telephone;
    private String ville;  

    public Medecin() {
    	//javafx stuff
    }

    public Medecin(String id, String nom, String prenom, String specialite,
                   String email, String telephone, String wilaya, String ville) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.specialite = specialite;
        this.email = email;
        this.telephone = telephone;
        this.wilaya = wilaya;
        this.ville = ville;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getWilaya() { return wilaya; }
    public void setWilaya(String wilaya) { this.wilaya = wilaya; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    @Override
    public String toString() {
        return "Médecin : " + nom + " " + prenom +
               " | Spécialité : " + specialite +
               " | Wilaya : " + wilaya +
               " | Ville : " + ville;
    }
}
