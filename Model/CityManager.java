import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.Comparator;

public class CityManager {
    private static final CityManager INSTANCE = new CityManager();
    private final Map<String, Wilaya> wilayaMap = new HashMap<>();

    private CityManager() {
        loadFromCSV();
    }

    public static CityManager getInstance() {
        return INSTANCE;
    }

    private void loadFromCSV() {
        try (var reader = new BufferedReader(new InputStreamReader(
                Objects.requireNonNull(
                        CityManager.class.getClassLoader().getResourceAsStream("cities_algeria.csv"),
                        "CSV not found! Put it in src/main/resources"
                )
        ))) {

            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",", -1);
                if (parts.length < 2) continue;

                String commune = parts[0].trim();
                String wilaya = parts[1].trim();

                wilayaMap.computeIfAbsent(wilaya, Wilaya::new)
                        .addComponent(new City(commune, wilaya));
            }

            System.out.println("CSV loaded successfully: " + wilayaMap.size() + " wilayas");

        } catch (Exception e) {
            System.err.println("CSV LOADING ERROR: ");
            e.printStackTrace();
        }
    }
    public List<String> getAllWilayas() {
        return new ArrayList<>(wilayaMap.keySet().stream().sorted().toList());
    }

    public List<City> getCitiesByWilaya(String wilaya) {
        Wilaya w = wilayaMap.get(wilaya);
        if (w == null) return List.of();

        return w.getCities().stream()
                .map(v -> (City) v)
                .sorted(Comparator.comparing(City::name))
                .toList();
    }

    public Map<String, Wilaya> getWilayaMap() {
        return Map.copyOf(wilayaMap);
    }

    public void displayFullHierarchy() {
        System.out.println("=== Algeria Geographical Hierarchy ===");
        wilayaMap.values().stream()
                .sorted(Comparator.comparing(Wilaya::toString))
                .forEach(Wilaya::displayHierarchy);
    }
}