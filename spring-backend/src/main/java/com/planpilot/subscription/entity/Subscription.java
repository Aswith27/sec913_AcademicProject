package com.planpilot.subscription.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id")
    private Plan plan;

    @Column(nullable = false)
    private String status;

    @Column(name = "billing_cycle", nullable = false)
    private String billingCycle;

    @Column(name = "started_on", nullable = false)
    private LocalDate startedOn;

    @Column(name = "renews_on", nullable = false)
    private LocalDate renewsOn;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew;

    @Column(name = "usage_health", nullable = false)
    private String usageHealth;

    public Subscription() {
    }

    public Subscription(AppUser user, Plan plan, String status, String billingCycle, LocalDate startedOn,
                        LocalDate renewsOn, Boolean autoRenew, String usageHealth) {
        this.user = user;
        this.plan = plan;
        this.status = status;
        this.billingCycle = billingCycle;
        this.startedOn = startedOn;
        this.renewsOn = renewsOn;
        this.autoRenew = autoRenew;
        this.usageHealth = usageHealth;
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public Plan getPlan() {
        return plan;
    }

    public String getStatus() {
        return status;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public LocalDate getStartedOn() {
        return startedOn;
    }

    public LocalDate getRenewsOn() {
        return renewsOn;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public String getUsageHealth() {
        return usageHealth;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public void setRenewsOn(LocalDate renewsOn) {
        this.renewsOn = renewsOn;
    }
}
