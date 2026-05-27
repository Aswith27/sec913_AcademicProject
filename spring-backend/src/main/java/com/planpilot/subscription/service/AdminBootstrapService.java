package com.planpilot.subscription.service;

import com.planpilot.subscription.entity.AppUser;
import com.planpilot.subscription.entity.UserRole;
import com.planpilot.subscription.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.admin.bootstrap-enabled", havingValue = "true")
public class AdminBootstrapService implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminName;
    private final String adminEmail;
    private final String adminCompany;
    private final String adminPassword;
    private final boolean updatePasswordOnStartup;

    public AdminBootstrapService(AppUserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 @Value("${app.admin.name}") String adminName,
                                 @Value("${app.admin.email}") String adminEmail,
                                 @Value("${app.admin.company}") String adminCompany,
                                 @Value("${app.admin.password}") String adminPassword,
                                 @Value("${app.admin.update-password-on-startup}") boolean updatePasswordOnStartup) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminCompany = adminCompany;
        this.adminPassword = adminPassword;
        this.updatePasswordOnStartup = updatePasswordOnStartup;
    }

    @Override
    public void run(String... args) {
        AppUser admin = userRepository.findByEmail(adminEmail)
                .orElseGet(() -> new AppUser(
                        adminName,
                        adminEmail,
                        adminCompany,
                        passwordEncoder.encode(adminPassword),
                        UserRole.ADMIN
                ));

        admin.setName(adminName);
        admin.setCompany(adminCompany);
        admin.setRole(UserRole.ADMIN);

        if (admin.getId() == null || updatePasswordOnStartup) {
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        }

        userRepository.save(admin);
    }
}
