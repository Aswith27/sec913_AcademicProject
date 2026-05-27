package com.planpilot.subscription.controller;

import com.planpilot.subscription.dto.CreateAdminUserRequest;
import com.planpilot.subscription.dto.UserMessageResponse;
import com.planpilot.subscription.service.AdminManagementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminManagementService adminManagementService;

    public AdminController(AdminManagementService adminManagementService) {
        this.adminManagementService = adminManagementService;
    }

    @PostMapping("/users")
    public UserMessageResponse createAdmin(@Valid @RequestBody CreateAdminUserRequest request) {
        return adminManagementService.createAdmin(request);
    }

    @PatchMapping("/users/{userId}/promote")
    public UserMessageResponse promoteUser(@PathVariable Long userId) {
        return adminManagementService.promoteUser(userId);
    }
}
