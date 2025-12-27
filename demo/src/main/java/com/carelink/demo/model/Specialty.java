package com.carelink.demo.model;

/**
 * Modèle représentant une spécialité médicale.
 */
public class Specialty {

    private String id;
    private String name;

    /** Constructeur par défaut. */
    public Specialty() {
    }

    /**
     * Constructeur principal.
     *
     * @param id   identifiant de la spécialité
     * @param name nom de la spécialité
     */
    public Specialty(String id, String name) {
        this.id = id;
        this.name = name;
    }

    // -------------------- Getters & Setters --------------------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * Représentation textuelle de la spécialité.
     */
    @Override
    public String toString() {
        return name;
    }
}
