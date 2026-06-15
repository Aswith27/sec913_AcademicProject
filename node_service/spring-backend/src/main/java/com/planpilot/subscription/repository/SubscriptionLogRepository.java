package com.planpilot.subscription.repository;

import com.planpilot.subscription.entity.SubscriptionLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionLogRepository extends JpaRepository<SubscriptionLog, Long> {

    @EntityGraph(attributePaths = {"subscription", "subscription.user", "subscription.plan"})
    List<SubscriptionLog> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"subscription", "subscription.user", "subscription.plan"})
    List<SubscriptionLog> findAllBySubscription_User_IdOrderByCreatedAtDesc(Long userId);
}
