package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Stratégie de recherche basée sur la localisation géographique.
 * Elle filtre les médecins selon leur wilaya ou leur ville.
 */
public class SearchByLocation implements SearchStrategy {

    /**
     * Recherche les médecins correspondant à une wilaya ou une ville donnée.
     *
     * @param doctors  liste complète des médecins
     * @param location localisation recherchée
     * @return liste des médecins correspondant au critère
     */
    @Override
    public List<Doctor> search(List<Doctor> doctors, String location) {
        if (location == null || location.trim().isEmpty()) {
            return doctors;
        }

        String loc = location.trim();

        return doctors.stream()
                .filter(d -> (d.getWilaya() != null && d.getWilaya().equalsIgnoreCase(loc)) ||
                        (d.getCity() != null && d.getCity().equalsIgnoreCase(loc)))
                .collect(Collectors.toList());
    }
}
