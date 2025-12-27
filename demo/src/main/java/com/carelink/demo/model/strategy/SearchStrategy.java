package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;

/**
 * Interface du pattern Strategy pour la recherche de médecins.
 * Chaque implémentation définit un critère de recherche spécifique.
 */
public interface SearchStrategy {

    /**
     * Filtre une liste de médecins selon un critère donné.
     *
     * @param doctors  liste complète des médecins
     * @param criteria critère de recherche
     * @return liste des médecins correspondant au critère
     */
    List<Doctor> search(List<Doctor> doctors, String criteria);
}
