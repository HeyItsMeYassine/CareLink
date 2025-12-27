package com.carelink.demo.model;

/**
 * Composant de base d'une structure géographique (pattern Composite).
 * Permet de manipuler de la même manière un élément simple (ville)
 * ou un élément composé (ex: wilaya contenant plusieurs villes).
 */
public interface GeographicComponent {

    /**
     * Retourne le nom de l'élément géographique.
     */
    String getName();

    /**
     * Affiche l'élément avec une indentation représentant son niveau.
     *
     * @param depth niveau d'indentation
     */
    void displayHierarchy(int depth);
}
