package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Stratégie de recherche basée sur la spécialité médicale.
 * Elle filtre les médecins selon leur domaine de compétence.
 */
public class SearchBySpecialty implements SearchStrategy {

    /**
     * Recherche les médecins correspondant à une spécialité donnée.
     *
     * @param doctors   liste complète des médecins
     * @param specialty spécialité recherchée
     * @return liste des médecins correspondant à la spécialité
     */
    @Override
    public List<Doctor> search(List<Doctor> doctors, String specialty) {
        if (specialty == null || specialty.trim().isEmpty()) {
            return doctors;
        }

        String s = specialty.trim();

        return doctors.stream()
                .filter(d -> d.getSpeciality() != null
                        && d.getSpeciality().equalsIgnoreCase(s))
                .collect(Collectors.toList());
    }
}
