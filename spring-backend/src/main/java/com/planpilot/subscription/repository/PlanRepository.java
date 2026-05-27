package com.planpilot.subscription.repository;

import com.planpilot.subscription.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> {
}
