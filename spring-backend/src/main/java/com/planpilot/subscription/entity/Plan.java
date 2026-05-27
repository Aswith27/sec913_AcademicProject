package com.planpilot.subscription.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String tier;

    @Column(name = "monthly_price", nullable = false)
    private Integer monthlyPrice;

    @Column(name = "yearly_price", nullable = false)
    private Integer yearlyPrice;

    @Column(name = "benefits_score", nullable = false)
    private Integer benefitsScore;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private String support;

    @Column(nullable = false, length = 1200)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_features", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "feature_name")
    private List<String> features = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_tags", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "tag_name")
    private List<String> tags = new ArrayList<>();

    public Plan() {
    }

    public Plan(String name, String tier, Integer monthlyPrice, Integer yearlyPrice, Integer benefitsScore,
                Integer seats, String support, String description, List<String> features, List<String> tags) {
        this.name = name;
        this.tier = tier;
        this.monthlyPrice = monthlyPrice;
        this.yearlyPrice = yearlyPrice;
        this.benefitsScore = benefitsScore;
        this.seats = seats;
        this.support = support;
        this.description = description;
        this.features = features;
        this.tags = tags;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getTier() {
        return tier;
    }

    public Integer getMonthlyPrice() {
        return monthlyPrice;
    }

    public Integer getYearlyPrice() {
        return yearlyPrice;
    }

    public Integer getBenefitsScore() {
        return benefitsScore;
    }

    public Integer getSeats() {
        return seats;
    }

    public String getSupport() {
        return support;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getFeatures() {
        return features;
    }

    public List<String> getTags() {
        return tags;
    }
}
