package com.planpilot.subscription.service;

import com.planpilot.subscription.dto.ApiMessageResponse;
import com.planpilot.subscription.dto.CreatePlanRequest;
import com.planpilot.subscription.dto.DashboardResponse;
import com.planpilot.subscription.dto.PlanChangeRequest;
import com.planpilot.subscription.dto.PlanMessageResponse;
import com.planpilot.subscription.dto.PlanResponse;
import com.planpilot.subscription.dto.ResponseMapper;
import com.planpilot.subscription.dto.StatusUpdateRequest;
import com.planpilot.subscription.dto.SubscribeRequest;
import com.planpilot.subscription.dto.SubscriptionLogResponse;
import com.planpilot.subscription.dto.SubscriptionResponse;
import com.planpilot.subscription.dto.UserResponse;
import com.planpilot.subscription.entity.AppUser;
import com.planpilot.subscription.entity.Plan;
import com.planpilot.subscription.entity.Subscription;
import com.planpilot.subscription.entity.SubscriptionLog;
import com.planpilot.subscription.entity.UserRole;
import com.planpilot.subscription.repository.AppUserRepository;
import com.planpilot.subscription.repository.PlanRepository;
import com.planpilot.subscription.repository.SubscriptionLogRepository;
import com.planpilot.subscription.repository.SubscriptionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class DashboardService {

    private final AppUserRepository userRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionLogRepository subscriptionLogRepository;

    public DashboardService(AppUserRepository userRepository,
                            PlanRepository planRepository,
                            SubscriptionRepository subscriptionRepository,
                            SubscriptionLogRepository subscriptionLogRepository) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionLogRepository = subscriptionLogRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        AppUser currentUser = getCurrentUser();
        List<Plan> plans = planRepository.findAll();
        List<Subscription> subscriptions = currentUser.getRole() == UserRole.ADMIN
                ? subscriptionRepository.findAll()
                : subscriptionRepository.findAllByUser_Id(currentUser.getId());
        List<SubscriptionLog> logs = currentUser.getRole() == UserRole.ADMIN
                ? subscriptionLogRepository.findAllByOrderByCreatedAtDesc()
                : subscriptionLogRepository.findAllBySubscription_User_IdOrderByCreatedAtDesc(currentUser.getId());

        long activeCount = subscriptions.stream().filter(item -> "active".equals(item.getStatus())).count();
        long trialCount = subscriptions.stream().filter(item -> "trial".equals(item.getStatus())).count();
        int mrr = subscriptions.stream()
                .filter(item -> !"cancelled".equals(item.getStatus()))
                .mapToInt(item -> item.getPlan().getMonthlyPrice())
                .sum();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("availablePlans", plans.size());
        metrics.put("subscriptions", subscriptions.size());
        metrics.put("activeSubscriptions", activeCount);
        metrics.put("trialSubscriptions", trialCount);
        metrics.put("estimatedMRR", mrr);

        List<PlanResponse> planResponses = plans.stream().map(ResponseMapper::toPlanResponse).toList();
        List<SubscriptionResponse> subscriptionResponses = subscriptions.stream().map(ResponseMapper::toSubscriptionResponse).toList();
        List<SubscriptionLogResponse> logResponses = logs.stream().map(ResponseMapper::toLogResponse).toList();
        List<UserResponse> userResponses = currentUser.getRole() == UserRole.ADMIN
                ? userRepository.findAll().stream().map(ResponseMapper::toUserResponse).toList()
                : List.of(ResponseMapper.toUserResponse(currentUser));

        return new DashboardResponse(metrics, planResponses, subscriptionResponses, logResponses, userResponses);
    }

    @Transactional
    public PlanMessageResponse createPlan(CreatePlanRequest request) {
        Plan plan = planRepository.save(new Plan(
                request.name().trim(),
                request.tier().trim(),
                request.monthly_price(),
                request.yearly_price(),
                request.benefits_score(),
                request.seats(),
                request.support().trim(),
                request.description().trim(),
                sanitizeList(request.features()),
                sanitizeList(request.tags())
        ));

        return new PlanMessageResponse("Plan created successfully.", ResponseMapper.toPlanResponse(plan));
    }

    @Transactional
    public ApiMessageResponse createSubscription(SubscribeRequest request) {
        AppUser currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.USER && !currentUser.getId().equals(request.user_id())) {
            throw new IllegalArgumentException("Users can only create subscriptions for their own account");
        }

        AppUser user = userRepository.findById(request.user_id())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Plan plan = planRepository.findById(request.plan_id())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

        String billingCycle = request.billing_cycle();
        Subscription subscription = subscriptionRepository.save(new Subscription(
                user,
                plan,
                "active",
                billingCycle,
                LocalDate.now(),
                LocalDate.now().plusDays("yearly".equalsIgnoreCase(billingCycle) ? 365 : 30),
                true,
                "medium"
        ));

        subscriptionLogRepository.save(new SubscriptionLog(
                subscription,
                "subscribed",
                "Subscribed to " + plan.getName() + " on " + billingCycle + " billing.",
                LocalDateTime.now()
        ));

        return new ApiMessageResponse("Subscription created successfully.", ResponseMapper.toSubscriptionResponse(subscription));
    }

    @Transactional
    public ApiMessageResponse updateStatus(Long subscriptionId, StatusUpdateRequest request) {
        if (!subscriptionId.equals(request.subscription_id())) {
            throw new IllegalArgumentException("Subscription id mismatch");
        }

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        subscription.setStatus(request.status());
        subscriptionRepository.save(subscription);

        subscriptionLogRepository.save(new SubscriptionLog(
                subscription,
                "status_changed",
                "Subscription status changed to " + request.status() + ".",
                LocalDateTime.now()
        ));

        return new ApiMessageResponse("Subscription status updated.", ResponseMapper.toSubscriptionResponse(subscription));
    }

    @Transactional
    public ApiMessageResponse changePlan(Long subscriptionId, PlanChangeRequest request) {
        if (!subscriptionId.equals(request.subscription_id())) {
            throw new IllegalArgumentException("Subscription id mismatch");
        }

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        Plan nextPlan = planRepository.findById(request.new_plan_id())
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

        String previousPlanName = subscription.getPlan().getName();
        subscription.setPlan(nextPlan);
        if (request.billing_cycle() != null && !request.billing_cycle().isBlank()) {
            subscription.setBillingCycle(request.billing_cycle());
        }
        subscription.setStatus("scheduled_change");
        subscription.setRenewsOn(LocalDate.now().plusDays("yearly".equalsIgnoreCase(subscription.getBillingCycle()) ? 365 : 30));
        subscriptionRepository.save(subscription);

        subscriptionLogRepository.save(new SubscriptionLog(
                subscription,
                "plan_changed",
                "Plan changed from " + previousPlanName + " to " + nextPlan.getName() + ".",
                LocalDateTime.now()
        ));

        return new ApiMessageResponse("Plan change recorded.", ResponseMapper.toSubscriptionResponse(subscription));
    }
   

    @Transactional
    public ApiMessageResponse deleteSubscription(Long subscriptionId) {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));

        subscriptionRepository.delete(subscription);

        return new ApiMessageResponse(
                "Subscription deleted successfully.",
                null
        );
    }



    private List<String> sanitizeList(List<String> values) {
        if (values == null) {
            return List.of();
        }

        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new EntityNotFoundException("Authenticated user not found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
    }
}
