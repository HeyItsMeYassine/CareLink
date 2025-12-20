package com.carelink.demo.model;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class MediSyncHub {

    private static final MediSyncHub INSTANCE = new MediSyncHub();

    private final List<Doctor> doctors = new ArrayList<>();

    private MediSyncHub() {
        loadFromCSV();
    }

    public static MediSyncHub getInstance() {
        return INSTANCE;
    }

    private void loadFromCSV() {
        try (var stream = getClass().getResourceAsStream("/doctors.csv");
                var reader = new BufferedReader(new InputStreamReader(
                        Objects.requireNonNull(stream, "doctors.csv introuvable !"),
                        StandardCharsets.UTF_8))) {

            reader.lines()
                    .skip(1)
                    .map(line -> line.split(";", -1))
                    .filter(parts -> parts.length >= 5)
                    .forEach(parts -> {
                        Doctor doc = new Doctor(
                                parts[0].trim(),
                                parts[1].trim(),
                                parts[2].trim(),
                                parts[3].trim(),
                                parts[4].trim());
                        doctors.add(doc);
                    });

            System.out.println(">> Base de données chargée : " + doctors.size() + " médecins trouvés dans le CSV.");

        } catch (Exception e) {
            System.err.println("ERREUR : Impossible de charger les médecins depuis doctors.csv.");
        }
    }

    public List<Doctor> getAllDoctors() {
        return doctors;
    }

    public void addDoctor(Doctor doc) {
        doctors.add(doc);
    }

    public Doctor findDoctorByLastName(String name) {
        for (Doctor doc : doctors) {
            if (doc.getLastName().equalsIgnoreCase(name)) {
                return doc;
            }
        }
        return null;
    }
}