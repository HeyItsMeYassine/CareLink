package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;
import java.util.stream.Collectors;

public class SearchByLocation implements SearchStrategy {
    @Override
    public List<Doctor> search(List<Doctor> doctors, String location) {
        if (location == null || location.trim().isEmpty())
            return doctors;

        String loc = location.trim();
        return doctors.stream()
                .filter(d -> (d.getWilaya() != null && d.getWilaya().equalsIgnoreCase(loc)) ||
                        (d.getCity() != null && d.getCity().equalsIgnoreCase(loc)))
                .collect(Collectors.toList());
    }
}
