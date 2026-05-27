package com.planpilot.subscription.service;

import com.planpilot.subscription.dto.CreateAdminUserRequest;
import com.planpilot.subscription.dto.ResponseMapper;
import com.planpilot.subscription.dto.UserMessageResponse;
import com.planpilot.subscription.entity.AppUser;
import com.planpilot.subscription.entity.UserRole;
import com.planpilot.subscription.repository.AppUserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminManagementService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminManagementService(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserMessageResponse createAdmin(CreateAdminUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EntityExistsException("An account with this email already exists");
        }

        AppUser user = userRepository.save(new AppUser(
                request.name().trim(),
                request.email().trim(),
                request.company().trim(),
                passwordEncoder.encode(request.password()),
                UserRole.ADMIN
        ));

        return new UserMessageResponse("Admin user created successfully.", ResponseMapper.toUserResponse(user));
    }

    @Transactional
    public UserMessageResponse promoteUser(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setRole(UserRole.ADMIN);
        userRepository.save(user);

        return new UserMessageResponse("User promoted to admin successfully.", ResponseMapper.toUserResponse(user));
    }
}
