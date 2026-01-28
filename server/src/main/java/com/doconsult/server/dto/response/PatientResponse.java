package com.doconsult.server.dto.response;

import com.doconsult.server.model.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {

    private java.util.UUID id;
    private java.util.UUID userId;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String bloodGroup;
    private String address;
    private String emergencyContact;
    private String profileImage;
    private String allergies;
    private String medicalConditions;
}
