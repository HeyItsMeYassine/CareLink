
import javafx.fxml.FXML;
import javafx.event.ActionEvent;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;

public class LoginController {

    @FXML
    private Label emailLabel; 
    
    @FXML
    private TextField emailField; 
    
    @FXML
    private Button patientButton;
    
    @FXML
    private Button medecinButton;

    @FXML
    private void handlePatientClick(ActionEvent event) {
        emailLabel.setText("Email");
        emailField.setPromptText("nom@exemple.com"); 
        patientButton.getStyleClass().add("selected-toggle");
        medecinButton.getStyleClass().remove("selected-toggle"); 
    }

    @FXML
    private void handleMedecinClick(ActionEvent event) {
        emailLabel.setText("Email professionnel");
        emailField.setPromptText("dr.nom@hopital.com");
        medecinButton.getStyleClass().add("selected-toggle");
        patientButton.getStyleClass().remove("selected-toggle");
    }
}
