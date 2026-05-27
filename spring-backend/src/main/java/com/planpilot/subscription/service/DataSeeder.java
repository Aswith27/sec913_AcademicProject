package com.planpilot.subscription.service;

import com.planpilot.subscription.entity.AppUser;
import com.planpilot.subscription.entity.Plan;
import com.planpilot.subscription.entity.Subscription;
import com.planpilot.subscription.entity.SubscriptionLog;
import com.planpilot.subscription.entity.UserRole;
import com.planpilot.subscription.repository.AppUserRepository;
import com.planpilot.subscription.repository.PlanRepository;
import com.planpilot.subscription.repository.SubscriptionLogRepository;
import com.planpilot.subscription.repository.SubscriptionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionLogRepository subscriptionLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AppUserRepository userRepository,
                      PlanRepository planRepository,
                      SubscriptionRepository subscriptionRepository,
                      SubscriptionLogRepository subscriptionLogRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionLogRepository = subscriptionLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (planRepository.count() > 0) {
            return;
        }

        AppUser priya = userRepository.save(new AppUser("Priya Sharma", "priya@navdrishti.in", "NavDrishti Retail", passwordEncoder.encode("password123"), UserRole.USER));
        AppUser arjun = userRepository.save(new AppUser("Arjun Menon", "arjun@vyuhstack.in", "VyuhStack Technologies", passwordEncoder.encode("password123"), UserRole.USER));
        userRepository.save(new AppUser("Aditi Rao", "aditi@swasthcare.in", "SwasthCare Clinics", passwordEncoder.encode("password123"), UserRole.USER));

        Plan aarambh = planRepository.save(new Plan(
                "Aarambh Lite", "Starter", 1499, 14999, 52, 3, "Email support",
                "A budget-friendly starter plan for small Indian teams that need essential analytics, basic automation, and predictable monthly pricing.",
                List.of("Core analytics", "3 team seats", "Ready-to-use templates"),
                List.of("affordable", "starter", "small-business")
        ));
        Plan unnati = planRepository.save(new Plan(
                "Unnati Growth", "Growth", 3999, 39999, 74, 10, "Priority email",
                "A balanced growth plan for scaling teams with stronger automation, broader collaboration, and reporting suited for fast-moving Indian businesses.",
                List.of("Advanced analytics", "Workflow automation", "Team dashboards"),
                List.of("balanced", "growth", "automation")
        ));
        Plan shikhar = planRepository.save(new Plan(
                "Shikhar Premium", "Premium", 6999, 69999, 91, 25, "24/7 chat and email",
                "A premium option for scaling companies that need richer benefits, stronger security, AI insights, and responsive support across larger operations.",
                List.of("AI insights", "Premium integrations", "Advanced security"),
                List.of("premium", "benefits", "popular")
        ));
        planRepository.save(new Plan(
                "Maharaja Enterprise", "Enterprise", 14999, 149999, 98, 100, "Dedicated success manager",
                "A maximum-benefits enterprise plan with custom onboarding, dedicated success support, compliance features, and broad operational control for large organisations.",
                List.of("Custom SLAs", "Single sign-on", "Unlimited automation"),
                List.of("enterprise", "maximum-benefits", "custom")
        ));

        Subscription first = subscriptionRepository.save(new Subscription(
                priya, unnati, "active", "monthly",
                LocalDate.now().minusDays(43), LocalDate.now().plusDays(17), true, "high"
        ));
        Subscription second = subscriptionRepository.save(new Subscription(
                arjun, shikhar, "trial", "yearly",
                LocalDate.now().minusDays(9), LocalDate.now().plusDays(5), true, "medium"
        ));

        subscriptionLogRepository.save(new SubscriptionLog(
                first, "created", "Subscription created on Unnati Growth monthly plan.", LocalDateTime.now().minusDays(43)
        ));
        subscriptionLogRepository.save(new SubscriptionLog(
                second, "trial_started", "Trial started on Shikhar Premium yearly plan.", LocalDateTime.now().minusDays(9)
        ));
    }
}
