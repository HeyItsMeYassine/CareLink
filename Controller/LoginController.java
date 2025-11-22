
import javafx.fxml.FXML;
import javafx.event.ActionEvent;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.control.PasswordField; 

public class LoginController {

    
    @FXML
    private Label emailLabel; 
    
    @FXML
    private TextField emailField; 
    
    @FXML
    private Button connectButton; 
    
    @FXML
    private Button patientButton;
    
    @FXML
    private Button praticienButton;


    @FXML
    private void handlePatientClick(ActionEvent event) {
        emailLabel.setText("Email");
        emailField.setPromptText("nom@exemple.com"); 
        connectButton.setText("Se connecter"); 

        patientButton.getStyleClass().add("selected-toggle");
        praticienButton.getStyleClass().remove("selected-toggle"); 
     // Remarque : "selected-toggle" est une classe CSS que vous devez définir séparément.
    }

    @FXML
    private void handlePraticienClick(ActionEvent event) {
        emailLabel.setText("Email professionnel");
        emailField.setPromptText("dr.nom@hopital.com");
        connectButton.setText("Accéder à mon agenda");

        praticienButton.getStyleClass().add("selected-toggle");
        patientButton.getStyleClass().remove("selected-toggle");
    }
 
}
