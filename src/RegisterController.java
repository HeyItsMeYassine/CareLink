import javafx.fxml.FXML; 
import javafx.fxml.Initializable; // Nécessaire pour la méthode initialize
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.control.ComboBox;
import javafx.scene.control.PasswordField;
import javafx.scene.layout.VBox;
import javafx.event.ActionEvent;

import java.net.URL;
import java.util.ResourceBundle;

public class RegisterController implements Initializable {

    // --- 1. Les Conteneurs (VBox) ---
    @FXML
    private VBox formPatientContainer; // La VBox qui contient le téléphone (Patient)
    
    @FXML
    private VBox formMedecinContainer; // La VBox qui contient Spécialité + Ville (Médecin)

    // --- 2. Les Boutons du haut ---
    @FXML
    private Button btnPatient; // Bouton "Je suis Patient"
    
    @FXML
    private Button btnMedecin; // Bouton "Je suis Médecin"

    // --- 3. Les Champs Communs qui changent ---
    @FXML
    private Label emailLabel; // Pour changer "Email" <-> "Email professionnel"
    
    @FXML
    private Button actionButton; // Le bouton "S'inscrire gratuitement"

    // --- 4. Variable pour savoir qui s'inscrit ---
    private boolean isMedecin = false; // Par défaut, c'est un patient

    /**
     * Cette méthode se lance automatiquement au démarrage de la page.
     * C'est ici qu'on force les éléments à être cachés proprement 
     * puisque vous n'avez pas trouvé la case "Managed" dans Scene Builder.
     */
    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Initialisation : On se met en mode Patient par défaut
        showPatientForm();
    }

    // --- 5. Les Actions (Clics) ---

    @FXML
    private void handlePatientClick(ActionEvent event) {
        showPatientForm();
    }

    @FXML
    private void handleMedecinClick(ActionEvent event) {
        showMedecinForm();
    }

    @FXML
    private void handleRegisterAction(ActionEvent event) {
        // Clic sur "S'inscrire gratuitement"
        if (isMedecin) {
            System.out.println("Logique d'inscription pour un MÉDECIN...");
            // Récupérer les champs médecin ici
        } else {
            System.out.println("Logique d'inscription pour un PATIENT...");
            // Récupérer les champs patient ici
        }
    }
    
    @FXML
    private void handleLoginLink(ActionEvent event) {
        System.out.println("Retour vers la page de connexion...");
        // Ici vous mettrez le code pour changer de scène vers Login.fxml
    }

    // --- 6. Méthodes privées pour éviter de répéter le code ---

    private void showPatientForm() {
        isMedecin = false;
        
        // Mise à jour visuelle des boutons du haut (Optionnel : changer couleur)
        // btnPatient.setStyle("-fx-background-color: #4169E1; -fx-text-fill: white;");
        // btnMedecin.setStyle("-fx-background-color: #f0f0f0; -fx-text-fill: black;");

        // GESTION DES VBOX (Visible + Managed)
        // 1. On cache le formulaire médecin
        formMedecinContainer.setVisible(false);
        formMedecinContainer.setManaged(false); // Libère l'espace vide !

        // 2. On affiche le formulaire patient
        formPatientContainer.setVisible(true);
        formPatientContainer.setManaged(true); // Prend l'espace nécessaire

        // Mise à jour des textes
        emailLabel.setText("Email");
        // actionButton.setText("S'inscrire gratuitement"); // Pas besoin si le texte ne change pas
    }

    private void showMedecinForm() {
        isMedecin = true;

        // Mise à jour visuelle des boutons du haut
        // btnMedecin.setStyle("-fx-background-color: #1a202c; -fx-text-fill: white;");
        // btnPatient.setStyle("-fx-background-color: #f0f0f0; -fx-text-fill: black;");

        // GESTION DES VBOX
        // 1. On cache le formulaire patient
        formPatientContainer.setVisible(false);
        formPatientContainer.setManaged(false);

        // 2. On affiche le formulaire médecin
        formMedecinContainer.setVisible(true);
        formMedecinContainer.setManaged(true);

        // Mise à jour des textes
        emailLabel.setText("Email professionnel");
    }
}