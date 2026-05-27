package com.planpilot.subscription.service;

import com.planpilot.subscription.dto.AuthResponse;
import com.planpilot.subscription.dto.LoginRequest;
import com.planpilot.subscription.dto.ResponseMapper;
import com.planpilot.subscription.dto.SignupRequest;
import com.planpilot.subscription.entity.AppUser;
import com.planpilot.subscription.entity.UserRole;
import com.planpilot.subscription.repository.AppUserRepository;
import com.planpilot.subscription.security.JwtService;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(AppUserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EntityExistsException("An account with this email already exists");
        }

        AppUser user = userRepository.save(new AppUser(
                request.name(),
                request.email(),
                request.company(),
                passwordEncoder.encode(request.password()),
                UserRole.USER
        ));

        return new AuthResponse(
                jwtService.generateToken(user.getEmail(), user.getRole().name()),
                ResponseMapper.toUserResponse(user)
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        AppUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return new AuthResponse(
                jwtService.generateToken(user.getEmail(), user.getRole().name()),
                ResponseMapper.toUserResponse(user)
        );
    }
}
