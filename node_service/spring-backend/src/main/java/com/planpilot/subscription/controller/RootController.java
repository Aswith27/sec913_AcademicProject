package com.planpilot.subscription.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "message", "Spring subscription management API is running.",
                "sql_tables", new String[]{"users", "plans", "subscriptions"},
                "mongodb_collections", new String[]{"plan_descriptions", "plan_embeddings", "subscription_logs"}
        );
    }
}
