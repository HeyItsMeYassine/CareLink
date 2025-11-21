
import java.util.ArrayList;
import java.util.List;

public class Wilaya implements GeographicComponent {
    private final String nom;
    private final List<GeographicComponent> composants = new ArrayList<>();

    public Wilaya(String nom) {
        this.nom = nom;
    }

    public void addComponent(GeographicComponent component) {
        composants.add(component);
    }

    @Override
    public void displayHierarchy(int depth) { 
        String indent = new String(new char[depth]).replace('\0', ' ');
        System.out.println(indent + "Wilaya : " + nom);
        
        for (GeographicComponent c : composants) {
            c.displayHierarchy(depth + 4); 
        }
    }

    public List<GeographicComponent> getVilles() {
        return new ArrayList<>(composants);
    }

    @Override
    public String toString() {
        return nom;
    }
}
