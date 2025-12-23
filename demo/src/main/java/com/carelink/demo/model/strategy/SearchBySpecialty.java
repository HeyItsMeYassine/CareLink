package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;
import java.util.stream.Collectors;

public class SearchBySpecialty implements SearchStrategy {
    @Override
    public List<Doctor> search(List<Doctor> doctors, String specialty) {
        if (specialty == null || specialty.trim().isEmpty())
            return doctors;

        String s = specialty.trim();
        return doctors.stream()
                .filter(d -> d.getSpeciality() != null && d.getSpeciality().equalsIgnoreCase(s))
                .collect(Collectors.toList());
    }
}
