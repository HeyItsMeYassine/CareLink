import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

/**
 * Classe de test pour la Vue Patient en JavaFX.
 * Cette classe implémente une fenêtre simple pour vérifier l'intégration MVC.
 * Peut être étendue avec Observateur pour notifier les changements du Modèle.
 */
public class PatientView extends Application {

    @Override
    public void start(Stage primaryStage) {
        // Création d'un layout simple (StackPane)
        StackPane root = new StackPane();
        Label label = new Label("Test Vue Patient - Intégration JavaFX réussie !");
        root.getChildren().add(label);

        // Configuration de la scène
        Scene scene = new Scene(root, 400, 300);  // Taille de la fenêtre
        primaryStage.setTitle("MediSync - Vue de Test");  // Titre de la fenêtre
        primaryStage.setScene(scene);
        primaryStage.show();  // Affichage de la fenêtre
    }

    public static void main(String[] args) {
        launch(args);  // Lancement de l'application JavaFX
    }
}