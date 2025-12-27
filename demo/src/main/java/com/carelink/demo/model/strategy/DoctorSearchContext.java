package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;

/**
 * Contexte du pattern Strategy pour la recherche de médecins.
 * Il permet de changer dynamiquement l'algorithme de recherche utilisé.
 */
public class DoctorSearchContext {

    /** Stratégie de recherche actuellement utilisée. */
    private SearchStrategy strategy;

    /**
     * Définit la stratégie de recherche à appliquer.
     *
     * @param strategy implémentation du critère de recherche
     */
    public void setSearchStrategy(SearchStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * Exécute la recherche des médecins selon la stratégie choisie.
     *
     * @param doctors  liste complète des médecins
     * @param criteria critère de recherche
     * @return liste des médecins correspondants
     */
    public List<Doctor> executeSearch(List<Doctor> doctors, String criteria) {
        if (strategy == null) {
            throw new IllegalStateException("Search strategy not set");
        }
        return strategy.search(doctors, criteria);
    }
}
