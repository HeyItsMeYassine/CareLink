package com.carelink.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class HomeController {

    // ================= NAVIGATION =================

    @FXML
    private void goToLogin(ActionEvent event) {
        loadPage(event, "/com/carelink/Login.fxml", "Login - CareLink");
    }

    @FXML
    private void goToRegister(ActionEvent event) {
        loadPage(event, "/com/carelink/Register.fxml", "Register - CareLink");
    }

    // ================= UTIL =================

    private void loadPage(ActionEvent event, String fxmlPath, String title) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));

            if (loader.getLocation() == null) {
                System.err.println("FXML introuvable : " + fxmlPath);
                return;
            }

            Scene scene = new Scene(loader.load(), 900, 700);
            Stage stage = (Stage) ((Node) event.getSource())
                    .getScene()
                    .getWindow();

            stage.setTitle(title);
            stage.setScene(scene);
            stage.centerOnScreen();
            stage.show();

        } catch (IOException e) {
            System.err.println("Erreur de chargement : " + fxmlPath);
            e.printStackTrace();
        }
    }
}
