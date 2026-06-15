package com.planpilot.subscription.repository;

import com.planpilot.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @Override
    @EntityGraph(attributePaths = {"user", "plan"})
    List<Subscription> findAll();

    @EntityGraph(attributePaths = {"user", "plan"})
    List<Subscription> findAllByUser_Id(Long userId);
}
