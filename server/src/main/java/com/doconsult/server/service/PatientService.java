package com.doconsult.server.service;

import com.doconsult.server.dto.request.PatientProfileRequest;
import com.doconsult.server.dto.response.PagedResponse;
import com.doconsult.server.dto.response.PatientResponse;
import com.doconsult.server.exception.ResourceNotFoundException;
import com.doconsult.server.model.Patient;
import com.doconsult.server.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

        private final PatientRepository patientRepository;

        public PagedResponse<PatientResponse> getAllPatients(int page, int size, String sortBy, String sortDir) {
                Sort sort = sortDir.equalsIgnoreCase("desc")
                                ? Sort.by(sortBy).descending()
                                : Sort.by(sortBy).ascending();
                Pageable pageable = PageRequest.of(page, size, sort);

                Page<Patient> patientsPage = patientRepository.findAll(pageable);

                List<PatientResponse> content = patientsPage.getContent().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());

                return PagedResponse.<PatientResponse>builder()
                                .content(content)
                                .page(patientsPage.getNumber())
                                .size(patientsPage.getSize())
                                .totalElements(patientsPage.getTotalElements())
                                .totalPages(patientsPage.getTotalPages())
                                .last(patientsPage.isLast())
                                .first(patientsPage.isFirst())
                                .build();
        }

        public PagedResponse<PatientResponse> searchPatients(String search, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<Patient> patientsPage = patientRepository.searchPatients(search, pageable);

                List<PatientResponse> content = patientsPage.getContent().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());

                return PagedResponse.<PatientResponse>builder()
                                .content(content)
                                .page(patientsPage.getNumber())
                                .size(patientsPage.getSize())
                                .totalElements(patientsPage.getTotalElements())
                                .totalPages(patientsPage.getTotalPages())
                                .last(patientsPage.isLast())
                                .first(patientsPage.isFirst())
                                .build();
        }

        public PatientResponse getPatientById(java.util.UUID id) {
                Patient patient = patientRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
                return mapToResponse(patient);
        }

        public PatientResponse getPatientByUserId(java.util.UUID userId) {
                Patient patient = patientRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "userId", userId));
                return mapToResponse(patient);
        }

        @Transactional
        public PatientResponse createOrUpdateProfile(java.util.UUID userId, PatientProfileRequest request) {
                Patient patient = patientRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", "userId", userId));

                patient.setFirstName(request.getFirstName());
                patient.setLastName(request.getLastName());
                patient.setDateOfBirth(request.getDateOfBirth());
                patient.setGender(request.getGender());
                patient.setBloodGroup(request.getBloodGroup());
                patient.setAddress(request.getAddress());
                patient.setEmergencyContact(request.getEmergencyContact());
                patient.setAllergies(request.getAllergies());
                patient.setMedicalConditions(request.getMedicalConditions());

                patient = patientRepository.save(patient);
                return mapToResponse(patient);
        }

        private PatientResponse mapToResponse(Patient patient) {
                return PatientResponse.builder()
                                .id(patient.getId())
                                .userId(patient.getUser().getId())
                                .email(patient.getUser().getEmail())
                                .phone(patient.getUser().getPhone())
                                .firstName(patient.getFirstName())
                                .lastName(patient.getLastName())
                                .fullName(patient.getFullName())
                                .dateOfBirth(patient.getDateOfBirth())
                                .gender(patient.getGender())
                                .bloodGroup(patient.getBloodGroup())
                                .address(patient.getAddress())
                                .emergencyContact(patient.getEmergencyContact())
                                .profileImage(patient.getProfileImage())
                                .allergies(patient.getAllergies())
                                .medicalConditions(patient.getMedicalConditions())
                                .build();
        }
}
