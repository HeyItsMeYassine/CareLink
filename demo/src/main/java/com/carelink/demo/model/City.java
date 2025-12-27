package com.carelink.demo.model;

/**
 * Représente une ville dans la hiérarchie géographique.
 * Cette classe est une feuille du pattern Composite.
 *
 * @param nom    nom de la ville
 * @param wilaya wilaya à laquelle appartient la ville
 */
public record City(String nom, String wilaya) implements GeographicComponent {

    /**
     * Retourne le nom de la ville.
     */
    @Override
    public String getName() {
        return nom;
    }

    /**
     * Affiche la ville avec une indentation représentant
     * son niveau dans la hiérarchie géographique.
     *
     * @param depth niveau d'indentation
     */
    @Override
    public void displayHierarchy(int depth) {
        String indent = " ".repeat(depth);
        System.out.println(indent + "   ├─ Ville : " + nom + " (" + wilaya + ")");
    }
}
