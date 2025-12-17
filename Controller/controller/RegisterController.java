package com.carelink.controller;

import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.util.HashMap;
import java.util.Map;

public class RegisterController {

    // ================= CONFIGURATION DU CHEMIN =================
    private static final String CSV_DIRECTORY = "/Users/sofia/Downloads/";

    // ================= DATA =================
    private static final Map<String, String[]> WILAYA_CITY_MAP = new HashMap<>();

    static {
        WILAYA_CITY_MAP.put("Algiers", new String[]{
                "Alger Centre","Aïn Benian","Aïn Taya","Bab Azzouar","Bab El Oued",
                "Baraki","Ben Aknoun","Bir Mourad Raïs","Birkhadem","Bordj El Kiffan",
                "Bouzareah","Casbah","Chéraga","Dar El Beïda","Dely Ibrahim",
                "El Biar","El Harrach","Hydra","Hussein Dey","Kouba","Reghaïa","Zéralda"
        });

        WILAYA_CITY_MAP.put("Oran", new String[]{
                "Oran","Bir El Djir","Es Sénia","Aïn El Turk","Arzew","Bethioua"
        });

        WILAYA_CITY_MAP.put("Boumerdès", new String[]{
                "Boumerdès","Bordj Menaïel","Dellys","Isser","Zemmouri"
        });
    }

    // ================= UI =================
    @FXML private VBox doctorForm;
    @FXML private VBox patientForm;

    @FXML private Button btnDoctor;
    @FXML private Button btnPatient;

    // Doctor
    @FXML private TextField doctorFirstName;
    @FXML private TextField doctorLastName;
    @FXML private ComboBox<String> doctorWilaya;
    @FXML private ComboBox<String> doctorCity;
    @FXML private TextField doctorEmail;
    @FXML private PasswordField doctorPassword;
    @FXML private TextField doctorPhone;
    @FXML private ComboBox<String> doctorSex;
    @FXML private ComboBox<String> doctorSpecialty;

    // Patient
    @FXML private TextField patientFirstName;
    @FXML private TextField patientLastName;
    @FXML private ComboBox<String> patientWilaya;
    @FXML private ComboBox<String> patientCity;
    @FXML private TextField patientEmail;
    @FXML private PasswordField patientPassword;
    @FXML private TextField patientPhone;
    @FXML private ComboBox<String> patientSex;

    // Files
    @FXML private Label idCardLabel;
    @FXML private Label professionalCardLabel;
    @FXML private Label openingApprovalLabel;

    private File idCardFile;
    private File professionalCardFile;
    private File openingApprovalFile;

    // ================= INIT =================
    @FXML
    private void initialize() {
        // Initialiser seulement les champs qui existent dans le FXML
        if (doctorSex != null) {
            doctorSex.setItems(FXCollections.observableArrayList("M", "F"));
        }

        if (patientSex != null) {
            patientSex.setItems(FXCollections.observableArrayList("M", "F"));
        }

        if (doctorWilaya != null) {
            doctorWilaya.setItems(FXCollections.observableArrayList(WILAYA_CITY_MAP.keySet()));
        }

        if (patientWilaya != null) {
            patientWilaya.setItems(FXCollections.observableArrayList(WILAYA_CITY_MAP.keySet()));
        }

        if (doctorSpecialty != null) {
            doctorSpecialty.setItems(FXCollections.observableArrayList(
                    "Cardiology",
                    "Dermatology",
                    "Endocrinology",
                    "Gastroenterology",
                    "General Medicine",
                    "Gynecology-Obstetrics",
                    "Medical Imaging (Radiology)",
                    "Neurology",
                    "Oncology",
                    "Ophthalmology",
                    "Orthopedic Surgery",
                    "Pediatrics",
                    "Dentist",
                    "General Practitioner",
                    "Orthopedist",
                    "Dermatologist",
                    "Neurologist",
                    "Gastroenterology",
                    "Ophthalmologist",
                    "Pediatrician",
                    "Gynecologist"
            ));
        }
    }

    // ================= COMBOS =================
    @FXML
    private void handleDoctorWilayaChange(ActionEvent event) {
        String w = doctorWilaya.getValue();
        if (w != null) {
            doctorCity.setItems(FXCollections.observableArrayList(WILAYA_CITY_MAP.get(w)));
        }
    }

    @FXML
    private void handlePatientWilayaChange(ActionEvent event) {
        String w = patientWilaya.getValue();
        if (w != null) {
            patientCity.setItems(FXCollections.observableArrayList(WILAYA_CITY_MAP.get(w)));
        }
    }

    // ================= FILE UPLOAD =================
    @FXML
    private void handleIdCardUpload(ActionEvent e) {
        idCardFile = chooseFile("ID Card");
        if (idCardFile != null) idCardLabel.setText(idCardFile.getName());
    }

    @FXML
    private void handleProfessionalCardUpload(ActionEvent e) {
        professionalCardFile = chooseFile("Professional License");
        if (professionalCardFile != null) professionalCardLabel.setText(professionalCardFile.getName());
    }

    @FXML
    private void handleOpeningApprovalUpload(ActionEvent e) {
        openingApprovalFile = chooseFile("Practice Authorization");
        if (openingApprovalFile != null) openingApprovalLabel.setText(openingApprovalFile.getName());
    }

    // ================= DELETE ❌ =================
    @FXML
    private void handleIdCardDelete(ActionEvent e) {
        idCardFile = null;
        idCardLabel.setText("No file");
    }

    @FXML
    private void handleProfessionalCardDelete(ActionEvent e) {
        professionalCardFile = null;
        professionalCardLabel.setText("No file");
    }

    @FXML
    private void handleOpeningApprovalDelete(ActionEvent e) {
        openingApprovalFile = null;
        openingApprovalLabel.setText("No file");
    }

    // ================= NAVIGATION =================
    @FXML
    private void handleBackToHome(ActionEvent event) {
        loadPage(event, "/com/carelink/Home.fxml", "Home - CareLink");
    }

    @FXML
    private void handleGoToLogin(ActionEvent event) {
        loadPage(event, "/com/carelink/Login.fxml", "Login - CareLink");
    }

    // ================= SWITCH FORMS =================
    @FXML
    private void handleDoctorClick(ActionEvent event) {
        doctorForm.setVisible(true);
        doctorForm.setManaged(true);

        patientForm.setVisible(false);
        patientForm.setManaged(false);

        btnDoctor.setStyle("-fx-background-color: #ffffff; -fx-border-color: #0066cc; -fx-border-width: 0 0 4 0;");
        btnPatient.setStyle("-fx-background-color: #e0e7f1;");
    }

    @FXML
    private void handlePatientClick(ActionEvent event) {
        patientForm.setVisible(true);
        patientForm.setManaged(true);

        doctorForm.setVisible(false);
        doctorForm.setManaged(false);

        btnPatient.setStyle("-fx-background-color: #ffffff; -fx-border-color: #0066cc; -fx-border-width: 0 0 4 0;");
        btnDoctor.setStyle("-fx-background-color: #e0e7f1;");
    }

    // ================= REGISTER ACTIONS =================
    @FXML
    private void handleDoctorRegister(ActionEvent event) {
        // Ordre des colonnes dans DoctorsInfo.csv:
        // ID | First Name | Last Name | Wilaya | City | Email | Password | Phone Number | Sexe | Specialty

        String firstName = doctorFirstName.getText().trim();
        String lastName = doctorLastName.getText().trim();
        String wilaya = doctorWilaya.getValue();
        String city = doctorCity.getValue();
        String email = doctorEmail.getText().trim();
        String password = doctorPassword.getText().trim();
        String phone = doctorPhone.getText().trim();
        String sex = doctorSex.getValue();
        String specialty = doctorSpecialty.getValue();

        // Validation basique
        if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() ||
                password.isEmpty() || phone.isEmpty() || wilaya == null ||
                city == null || sex == null || specialty == null) {
            showAlert(Alert.AlertType.WARNING, "Champs manquants",
                    "Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Générer un ID automatique (exemple: ID067, ID068, etc.)
        String id = generateNextDoctorId();

        String line = String.join(",",
                id,
                firstName,
                lastName,
                wilaya,
                city,
                email,
                password,
                phone,
                sex,
                specialty
        );

        boolean success = appendToCsv("DoctorsInfo.csv", line);
        if (success) {
            System.out.println("Doctor registered successfully with ID: " + id);
            showAlert(Alert.AlertType.INFORMATION, "Succès",
                    "Inscription réussie! Votre ID est: " + id);
            clearDoctorForm();
        } else {
            System.out.println("Failed to register doctor");
            showAlert(Alert.AlertType.ERROR, "Erreur",
                    "Échec de l'inscription. Vérifiez le chemin du fichier.");
        }
    }

    @FXML
    private void handlePatientRegister(ActionEvent event) {
        // Ordre des colonnes dans PatientsInfo.csv:
        // ID | First Name | Last Name | Wilaya | City | Email | Password | Phone Number | Sexe

        String firstName = patientFirstName.getText().trim();
        String lastName = patientLastName.getText().trim();
        String wilaya = patientWilaya.getValue();
        String city = patientCity.getValue();
        String email = patientEmail.getText().trim();
        String password = patientPassword.getText().trim();
        String phone = patientPhone.getText().trim();
        String sex = patientSex.getValue();

        // Validation basique
        if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() ||
                password.isEmpty() || phone.isEmpty() || wilaya == null ||
                city == null || sex == null) {
            showAlert(Alert.AlertType.WARNING, "Champs manquants",
                    "Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Générer un ID automatique (exemple: ID01, ID02, etc.)
        String id = generateNextPatientId();

        String line = String.join(",",
                id,
                firstName,
                lastName,
                wilaya,
                city,
                email,
                password,
                phone,
                sex
        );

        boolean success = appendToCsv("PatientsInfo.csv", line);
        if (success) {
            System.out.println("Patient registered successfully with ID: " + id);
            showAlert(Alert.AlertType.INFORMATION, "Succès",
                    "Inscription réussie! Votre ID est: " + id);
            clearPatientForm();
        } else {
            System.out.println("Failed to register patient");
            showAlert(Alert.AlertType.ERROR, "Erreur",
                    "Échec de l'inscription. Vérifiez le chemin du fichier.");
        }
    }

    // ================= CSV UTIL =================
    private boolean appendToCsv(String fileName, String line) {
        String fullPath = CSV_DIRECTORY + fileName;
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(fullPath, true))) {
            bw.write(line);
            bw.newLine();
            System.out.println("Data written to: " + fullPath);
            return true;
        } catch (IOException e) {
            System.err.println("Error writing to CSV: " + fullPath);
            e.printStackTrace();
            return false;
        }
    }

    // ================= UTIL =================
    private File chooseFile(String title) {
        FileChooser fc = new FileChooser();
        fc.setTitle(title);
        fc.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("PDF / Images", "*.pdf", "*.png", "*.jpg")
        );
        return fc.showOpenDialog(null);
    }

    private void loadPage(ActionEvent event, String fxml, String title) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxml));
            Scene scene = new Scene(loader.load(), 900, 700);
            Stage stage = (Stage) ((Node) event.getSource()).getScene().getWindow();
            stage.setScene(scene);
            stage.setTitle(title);
            stage.show();
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    private void showAlert(Alert.AlertType type, String title, String message) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    // ================= ID GENERATION =================
    private String generateNextDoctorId() {
        // Lire le fichier pour trouver le dernier ID
        File file = new File(CSV_DIRECTORY + "DoctorsInfo.csv");
        int maxId = 0;

        if (file.exists()) {
            try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(file))) {
                String line;
                while ((line = br.readLine()) != null) {
                    String[] parts = line.split(",");
                    if (parts.length > 0 && parts[0].startsWith("ID")) {
                        try {
                            int id = Integer.parseInt(parts[0].substring(2));
                            if (id > maxId) maxId = id;
                        } catch (NumberFormatException e) {
                            // Ignorer les lignes invalides
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return String.format("ID%03d", maxId + 1);
    }

    private String generateNextPatientId() {
        // Lire le fichier pour trouver le dernier ID
        File file = new File(CSV_DIRECTORY + "PatientsInfo.csv");
        int maxId = 0;

        if (file.exists()) {
            try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(file))) {
                String line;
                while ((line = br.readLine()) != null) {
                    String[] parts = line.split(",");
                    if (parts.length > 0 && parts[0].startsWith("ID")) {
                        try {
                            int id = Integer.parseInt(parts[0].substring(2));
                            if (id > maxId) maxId = id;
                        } catch (NumberFormatException e) {
                            // Ignorer les lignes invalides
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return String.format("ID%02d", maxId + 1);
    }

    // ================= CLEAR FORMS =================
    private void clearDoctorForm() {
        if (doctorFirstName != null) doctorFirstName.clear();
        if (doctorLastName != null) doctorLastName.clear();
        if (doctorEmail != null) doctorEmail.clear();
        if (doctorPassword != null) doctorPassword.clear();
        if (doctorPhone != null) doctorPhone.clear();
        if (doctorWilaya != null) doctorWilaya.setValue(null);
        if (doctorCity != null) doctorCity.setValue(null);
        if (doctorSex != null) doctorSex.setValue(null);
        if (doctorSpecialty != null) doctorSpecialty.setValue(null);
    }

    private void clearPatientForm() {
        if (patientFirstName != null) patientFirstName.clear();
        if (patientLastName != null) patientLastName.clear();
        if (patientEmail != null) patientEmail.clear();
        if (patientPassword != null) patientPassword.clear();
        if (patientPhone != null) patientPhone.clear();
        if (patientWilaya != null) patientWilaya.setValue(null);
        if (patientCity != null) patientCity.setValue(null);
        if (patientSex != null) patientSex.setValue(null);
    }
}