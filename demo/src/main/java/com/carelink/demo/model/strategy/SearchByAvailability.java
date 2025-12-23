package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;
import java.util.stream.Collectors;

public class SearchByAvailability implements SearchStrategy {
    @Override
    public List<Doctor> search(List<Doctor> doctors, String timeSlot) {
        if (timeSlot == null || timeSlot.trim().isEmpty())
            return doctors;

        String slot = timeSlot.trim();
        return doctors.stream()
                .filter(d -> d.getAvailableSlots() != null && d.getAvailableSlots().contains(slot))
                .collect(Collectors.toList());
    }
}
