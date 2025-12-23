package com.carelink.demo.model.strategy;

import com.carelink.demo.model.Doctor;
import java.util.List;

public class DoctorSearchContext {
    private SearchStrategy strategy;

    public void setSearchStrategy(SearchStrategy strategy) {
        this.strategy = strategy;
    }

    public List<Doctor> executeSearch(List<Doctor> doctors, String criteria) {
        if (strategy == null) {
            throw new IllegalStateException("Search strategy not set");
        }
        return strategy.search(doctors, criteria);
    }
}
