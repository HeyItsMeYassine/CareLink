import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class Test extends Application {

    @Override
    public void start(Stage primaryStage) {
        Label label = new Label("Hello JavaFX!");
        Button button = new Button("Click me");

        button.setOnAction(e -> label.setText("Button clicked!"));

        VBox root = new VBox(20, label, button);

        Scene scene = new Scene(root, 300, 200);

        primaryStage.setTitle("JavaFX Test");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
