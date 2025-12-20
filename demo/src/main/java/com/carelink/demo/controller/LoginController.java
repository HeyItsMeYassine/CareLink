package com.carelink.demo.controller;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.io.IOException;

public class LoginController {

    // ================= UI =================
    @FXML
    private VBox doctorForm;

    @FXML
    private VBox patientForm;

    @FXML
    private Button btnDoctor;

    @FXML
    private Button btnPatient;

    // ================= NAVIGATION =================

    @FXML
    private void handleBackToHome(ActionEvent event) {
        loadPage(event, "/com/carelink/Home.fxml", "CareLink - Home");
    }

    @FXML
    private void handleGoToRegister(ActionEvent event) {
        loadPage(event, "/com/carelink/Register.fxml", "Register - CareLink");
    }

    // ================= TABS =================

    @FXML
    private void handleDoctorClick(ActionEvent event) {
        doctorForm.setVisible(true);
        doctorForm.setManaged(true);

        patientForm.setVisible(false);
        patientForm.setManaged(false);

        btnDoctor.setStyle(activeTabStyle());
        btnPatient.setStyle(inactiveTabStyle());
    }

    @FXML
    private void handlePatientClick(ActionEvent event) {
        patientForm.setVisible(true);
        patientForm.setManaged(true);

        doctorForm.setVisible(false);
        doctorForm.setManaged(false);

        btnPatient.setStyle(activeTabStyle());
        btnDoctor.setStyle(inactiveTabStyle());
    }

    // ================= LOGIN ACTIONS =================

    @FXML
    private void handleDoctorLogin(ActionEvent event) {
        System.out.println("Doctor login clicked");
        // TODO : authentification doctor
    }

    @FXML
    private void handlePatientLogin(ActionEvent event) {
        System.out.println("Patient login clicked");
        // TODO : authentification patient
    }

    // ================= UTIL =================

    private void loadPage(ActionEvent event, String fxmlPath, String title) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));

            Scene scene = new Scene(loader.load(), 900, 700);
            Stage stage = (Stage) ((Node) event.getSource())
                    .getScene()
                    .getWindow();

            stage.setTitle(title);
            stage.setScene(scene);
            stage.centerOnScreen();
            stage.show();

        } catch (IOException e) {
            System.err.println("Erreur chargement : " + fxmlPath);
            e.printStackTrace();
        }
    }

    private String activeTabStyle() {
        return "-fx-background-color: #ffffff;"
                + "-fx-border-color: #0066cc;"
                + "-fx-border-width: 0 0 4 0;"
                + "-fx-font-weight: bold;"
                + "-fx-text-fill: #0066cc;"
                + "-fx-padding: 12 32;";
    }

    private String inactiveTabStyle() {
        return "-fx-background-color: #e0e7f1;"
                + "-fx-padding: 12 32;";
    }
}