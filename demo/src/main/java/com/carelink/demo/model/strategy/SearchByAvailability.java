package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Stratégie de recherche basée sur la disponibilité des médecins.
 * Elle filtre les médecins ayant un créneau horaire précis disponible.
 */
public class SearchByAvailability implements SearchStrategy {

    /**
     * Recherche les médecins disponibles pour un créneau donné.
     *
     * @param doctors  liste complète des médecins
     * @param timeSlot créneau horaire recherché
     * @return liste des médecins disponibles à ce créneau
     */
    @Override
    public List<Doctor> search(List<Doctor> doctors, String timeSlot) {
        if (timeSlot == null || timeSlot.trim().isEmpty()) {
            return doctors;
        }

        String slot = timeSlot.trim();

        return doctors.stream()
                .filter(d -> d.getAvailableSlots() != null
                        && d.getAvailableSlots().contains(slot))
                .collect(Collectors.toList());
    }
}
