package com.doconsult.server.service;

import com.doconsult.server.dto.request.LoginRequest;
import com.doconsult.server.dto.request.RegisterRequest;
import com.doconsult.server.dto.response.AuthResponse;
import com.doconsult.server.exception.BadRequestException;
import com.doconsult.server.model.*;
import com.doconsult.server.repository.DoctorRepository;
import com.doconsult.server.repository.PatientRepository;
import com.doconsult.server.repository.UserRepository;
import com.doconsult.server.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.admin.email}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${app.admin.password}")
    private String adminPassword;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Admin role cannot be created through registration
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin registration is not allowed");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(false) // User is inactive until email is verified
                .isEmailVerified(false)
                .build();

        // Generate OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));

        user = userRepository.save(user);

        // Create profile based on role
        boolean profileCompleted = false;
        if (request.getRole() == Role.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .isVerified(false)
                    .build();
            doctorRepository.save(doctor);
        } else if (request.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .user(user)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .build();
            patientRepository.save(patient);
            profileCompleted = true; // Patient profile is complete with basic info
        }

        // Send OTP Email
        emailService.sendOtpEmail(user.getEmail(), otp);

        // Return response without tokens (user needs to verify first) or with tokens
        // but restricted access
        // For this flow, we'll return tokens but the frontend should check
        // isEmailVerified

        // Return response without tokens (user needs to verify first)
        return buildAuthResponse(user, null, null, request.getFirstName(), request.getLastName(),
                profileCompleted);
    }

    public AuthResponse verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }

        user.setIsEmailVerified(true);
        user.setIsActive(true); // Activate user after verification
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Generate tokens for auto-login
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String accessToken = jwtTokenProvider.generateToken(new java.util.HashMap<>(), userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        // Get profile info
        String firstName = "";
        String lastName = "";
        boolean profileCompleted = false;

        if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (doctor != null) {
                firstName = doctor.getFirstName();
                lastName = doctor.getLastName();
                profileCompleted = doctor.getSpecialization() != null;
            }
        } else if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
            if (patient != null) {
                firstName = patient.getFirstName();
                lastName = patient.getLastName();
                profileCompleted = true;
            }
        }

        return buildAuthResponse(user, accessToken, refreshToken, firstName, lastName, profileCompleted);
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getIsEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail().equals(adminEmail) && request.getPassword().equals(adminPassword)) {
            // Check if admin exists in DB, if not, create a virtual one or use an existing
            // one
            // For simplicity, we'll return a special AuthResponse for the hardcoded admin
            return buildAdminAuthResponse();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.getIsEmailVerified()) {
            // Check if OTP is expired, if so, generate new one sends it
            if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                String otp = String.format("%06d", new java.util.Random().nextInt(999999));
                user.setOtp(otp);
                user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
                userRepository.save(user);
                emailService.sendOtpEmail(user.getEmail(), otp);
            }
            throw new BadRequestException("Email not verified");
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("Account is deactivated");
        }

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken((UserDetails) authentication.getPrincipal());

        // Get profile info
        String firstName = "";
        String lastName = "";
        boolean profileCompleted = false;

        if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (doctor != null) {
                firstName = doctor.getFirstName();
                lastName = doctor.getLastName();
                profileCompleted = doctor.getSpecialization() != null;
            }
        } else if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
            if (patient != null) {
                firstName = patient.getFirstName();
                lastName = patient.getLastName();
                profileCompleted = true;
            }
        } else if (user.getRole() == Role.ADMIN) {
            firstName = "Admin";
            lastName = "";
            profileCompleted = true;
        }

        return buildAuthResponse(user, accessToken, refreshToken, firstName, lastName, profileCompleted);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtTokenProvider.extractUsername(refreshToken);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        if (!jwtTokenProvider.isTokenValid(refreshToken, userDetails)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String newAccessToken = jwtTokenProvider.generateToken(new java.util.HashMap<>(), userDetails);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        String firstName = "";
        String lastName = "";
        boolean profileCompleted = false;

        if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (doctor != null) {
                firstName = doctor.getFirstName();
                lastName = doctor.getLastName();
                profileCompleted = doctor.getSpecialization() != null;
            }
        } else if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
            if (patient != null) {
                firstName = patient.getFirstName();
                lastName = patient.getLastName();
                profileCompleted = true;
            }
        }

        return buildAuthResponse(user, newAccessToken, newRefreshToken, firstName, lastName, profileCompleted);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        if (email.equals(adminEmail)) {
            return User.builder()
                    .id(java.util.UUID.nameUUIDFromBytes("ADMIN-ROOT".getBytes()))
                    .email(adminEmail)
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken,
            String firstName, String lastName, boolean profileCompleted) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .firstName(firstName)
                        .lastName(lastName)
                        .profileCompleted(profileCompleted)
                        .build())
                .build();
    }

    private AuthResponse buildAdminAuthResponse() {
        // We still need a valid JWT token. We can create one for the admin email.
        UserDetails adminDetails = org.springframework.security.core.userdetails.User.builder()
                .username(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        String accessToken = jwtTokenProvider.generateToken(new java.util.HashMap<>(), adminDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(adminDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .user(AuthResponse.UserInfo.builder()
                        .id(java.util.UUID.nameUUIDFromBytes("ADMIN-ROOT".getBytes()))
                        .email(adminEmail)
                        .role(Role.ADMIN)
                        .firstName("Elite")
                        .lastName("Admin")
                        .profileCompleted(true)
                        .build())
                .build();
    }
}
