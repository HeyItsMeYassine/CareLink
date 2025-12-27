package com.carelink.demo.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Représente une wilaya dans la hiérarchie géographique.
 * Cette classe joue le rôle de composant composite du pattern Composite.
 */
public class Wilaya implements GeographicComponent {

    private String name;
    private final List<GeographicComponent> cities = new ArrayList<>();

    /** Constructeur par défaut. */
    public Wilaya() {
    }

    /**
     * Constructeur principal.
     *
     * @param name nom de la wilaya
     */
    public Wilaya(String name) {
        this.name = name;
    }

    /**
     * Ajoute une ville à la wilaya si elle n'existe pas déjà.
     *
     * @param city composant géographique représentant une ville
     */
    public void addCity(GeographicComponent city) {
        if (city == null) {
            return;
        }

        boolean exists = cities.stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(city.getName()));

        if (!exists) {
            cities.add(city);
        }
    }

    /**
     * Retourne le nom de la wilaya.
     */
    @Override
    public String getName() {
        return name;
    }

    /**
     * Affiche la wilaya et ses villes avec une indentation hiérarchique.
     *
     * @param depth niveau d'indentation
     */
    @Override
    public void displayHierarchy(int depth) {
        String indent = " ".repeat(depth);
        System.out.println(indent + "Wilaya : " + name);

        for (GeographicComponent city : cities) {
            city.displayHierarchy(depth + 2);
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * Retourne la liste des villes associées à la wilaya.
     */
    public List<GeographicComponent> getCities() {
        return cities;
    }

    /**
     * Représentation textuelle de la wilaya.
     */
    @Override
    public String toString() {
        return name;
    }
}
