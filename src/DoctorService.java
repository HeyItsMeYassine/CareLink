import com.carelink.dto.DoctorDTO;
import com.carelink.dto.DoctorFilterDTO;
import com.carelink.entity.Doctor;
import com.carelink.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public List<DoctorDTO> findAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> searchDoctors(DoctorFilterDTO filter) {
        // Logique de filtrage selon les critères
        List<Doctor> doctors = doctorRepository.findAll();

        if (filter.getStates() != null && !filter.getStates().isEmpty()) {
            doctors = doctors.stream()
                    .filter(d -> filter.getStates().contains(d.getState()))
                    .collect(Collectors.toList());
        }

        if (filter.getSpecialties() != null && !filter.getSpecialties().isEmpty()) {
            doctors = doctors.stream()
                    .filter(d -> filter.getSpecialties().contains(d.getSpecialty()))
                    .collect(Collectors.toList());
        }

        if (filter.getCities() != null && !filter.getCities().isEmpty()) {
            doctors = doctors.stream()
                    .filter(d -> filter.getCities().contains(d.getCity()))
                    .collect(Collectors.toList());
        }

        return doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> searchByKeyword(String query) {
        List<Doctor> doctors = doctorRepository.searchByKeyword(query);
        return doctors.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO findDoctorById(Long id) {
        return doctorRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<String> getAllSpecialties() {
        return doctorRepository.findDistinctSpecialties();
    }

    public List<String> getAllCities() {
        return doctorRepository.findDistinctCities();
    }

    public List<String> getAllStates() {
        return doctorRepository.findDistinctStates();
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setFirstName(doctor.getFirstName());
        dto.setLastName(doctor.getLastName());
        dto.setSpecialty(doctor.getSpecialty());
        dto.setAddress(doctor.getAddress());
        dto.setCity(doctor.getCity());
        dto.setState(doctor.getState());
        dto.setRating(doctor.getRating());
        dto.setReviewCount(doctor.getReviewCount());
        dto.setAvatarUrl(doctor.getAvatarUrl());
        return dto;
    }
}

