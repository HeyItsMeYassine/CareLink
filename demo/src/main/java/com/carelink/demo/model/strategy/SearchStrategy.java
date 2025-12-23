package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;

public interface SearchStrategy {
    List<Doctor> search(List<Doctor> doctors, String criteria);
}
