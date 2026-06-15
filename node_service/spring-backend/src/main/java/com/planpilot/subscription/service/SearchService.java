package com.planpilot.subscription.service;

import com.planpilot.subscription.dto.PlanResponse;
import com.planpilot.subscription.dto.ResponseMapper;
import com.planpilot.subscription.dto.SearchResultResponse;
import com.planpilot.subscription.entity.Plan;
import com.planpilot.subscription.repository.PlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SearchService {

    private final PlanRepository planRepository;

    public SearchService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> search(String query) {
        List<SearchResultResponse> results = new ArrayList<>();
        List<String> tokens = tokenize(query);

        for (Plan plan : planRepository.findAll()) {
            double score = score(tokens, plan);
            PlanResponse planResponse = ResponseMapper.toPlanResponse(plan);
            results.add(new SearchResultResponse(
                    planResponse,
                    Math.round(score * 10000.0) / 10000.0,
                    "Matched on pricing, tier, benefits, and descriptive intent."
            ));
        }

        results.sort(Comparator.comparingDouble(item -> -item.score()));

        Map<String, Object> payload = new HashMap<>();
        payload.put("query", query);
        payload.put("results", results);
        return payload;
    }

    private List<String> tokenize(String query) {
        return List.of(query.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9 ]", " ").split("\\s+"));
    }

    private double score(List<String> tokens, Plan plan) {
        String document = (
                plan.getName() + " " + plan.getTier() + " " + plan.getDescription() + " " +
                String.join(" ", plan.getTags()) + " " + String.join(" ", plan.getFeatures())
        ).toLowerCase(Locale.ROOT);

        double score = 0.0;
        for (String token : tokens) {
            if (token.isBlank()) {
                continue;
            }
            if (document.contains(normalize(token))) {
                score += 0.25;
            }
            if ((token.equals("affordable") || token.equals("cheap") || token.equals("budget")) && plan.getMonthlyPrice() <= 5000) {
                score += 0.30;
            }
            if (token.equals("premium") && "Premium".equalsIgnoreCase(plan.getTier())) {
                score += 0.35;
            }
            if ((token.equals("maximum") || token.equals("benefits") || token.equals("best")) && plan.getBenefitsScore() >= 90) {
                score += 0.35;
            }
        }
        score += plan.getBenefitsScore() / 400.0;
        score += Math.max(0, 20000 - plan.getMonthlyPrice()) / 50000.0;
        return score;
    }

    private String normalize(String token) {
        return switch (token) {
            case "cheap", "budget" -> "affordable";
            case "best" -> "maximum";
            case "features" -> "benefits";
            default -> token;
        };
    }
}
