package com.planpilot.subscription.controller;

import com.planpilot.subscription.dto.PlanChangeRequest;

import com.planpilot.subscription.dto.SearchRequest;
import com.planpilot.subscription.dto.StatusUpdateRequest;
import com.planpilot.subscription.dto.SubscribeRequest;
import com.planpilot.subscription.dto.CreatePlanRequest;
import com.planpilot.subscription.dto.DashboardResponse;
import com.planpilot.subscription.service.DashboardService;
import com.planpilot.subscription.service.SearchService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SubscriptionController {

    private final DashboardService dashboardService;
    private final SearchService searchService;

    public SubscriptionController(DashboardService dashboardService, SearchService searchService) {
        this.dashboardService = dashboardService;
        this.searchService = searchService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.dashboard();
    }

    @PostMapping("/search")
    public Map<String, Object> search(@Valid @RequestBody SearchRequest request) {
        return searchService.search(request.query());
    }

    @PostMapping("/plans")
    public Object createPlan(@Valid @RequestBody CreatePlanRequest request) {
        return dashboardService.createPlan(request);
    }

    @PostMapping("/subscriptions")
    public Object createSubscription(@Valid @RequestBody SubscribeRequest request) {
        return dashboardService.createSubscription(request);
    }

    @PatchMapping("/subscriptions/{subscriptionId}/status")
    public Object updateStatus(@PathVariable Long subscriptionId, @Valid @RequestBody StatusUpdateRequest request) {
        return dashboardService.updateStatus(subscriptionId, request);
    }

    @PatchMapping("/subscriptions/{subscriptionId}/plan")
    public Object changePlan(@PathVariable Long subscriptionId, @Valid @RequestBody PlanChangeRequest request) {
        return dashboardService.changePlan(subscriptionId, request);
    }
    @DeleteMapping("/subscriptions/{subscriptionId}")
    public Object deleteSubscription(@PathVariable Long subscriptionId) {
        dashboardService.deleteSubscription(subscriptionId);

        return Map.of(
                "message",
                "Subscription deleted successfully"
        );
    }
}
