from __future__ import annotations

from collections import Counter
from datetime import date, datetime, timedelta
from math import sqrt
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="Subscription and Plan Management API",
    description=(
        "Demo backend for subscription management with SQL-style entities and "
        "MongoDB-inspired semantic plan search."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class User(BaseModel):
    id: int
    name: str
    email: str
    company: str


class Plan(BaseModel):
    id: int
    name: str
    tier: Literal["Starter", "Growth", "Premium", "Enterprise"]
    monthly_price: int
    yearly_price: int
    benefits_score: int = Field(ge=1, le=100)
    seats: int
    support: str
    features: list[str]
    tags: list[str]
    description: str


class Subscription(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: Literal["active", "paused", "trial", "cancelled", "scheduled_change"]
    billing_cycle: Literal["monthly", "yearly"]
    started_on: date
    renews_on: date
    auto_renew: bool
    usage_health: Literal["low", "medium", "high"]


class SubscriptionLog(BaseModel):
    id: int
    subscription_id: int
    action: str
    message: str
    created_at: datetime


class SearchRequest(BaseModel):
    query: str = Field(min_length=2)


class SubscribeRequest(BaseModel):
    user_id: int
    plan_id: int
    billing_cycle: Literal["monthly", "yearly"] = "monthly"


class PlanChangeRequest(BaseModel):
    subscription_id: int
    new_plan_id: int
    billing_cycle: Literal["monthly", "yearly"] | None = None


class StatusUpdateRequest(BaseModel):
    subscription_id: int
    status: Literal["active", "paused", "cancelled"]


USERS = [
    User(id=1, name="Ava Carter", email="ava@northstar.io", company="Northstar Retail"),
    User(id=2, name="Rahul Menon", email="rahul@stackgrid.ai", company="StackGrid"),
    User(id=3, name="Sophia Lee", email="sophia@caremesh.com", company="CareMesh"),
]

PLANS = [
    Plan(
        id=101,
        name="Launchpad",
        tier="Starter",
        monthly_price=19,
        yearly_price=190,
        benefits_score=52,
        seats=3,
        support="Email support",
        features=["Core analytics", "3 team seats", "Community templates"],
        tags=["affordable", "starter", "small-team"],
        description=(
            "A budget friendly starter plan for small teams that want essential "
            "analytics, basic automation, and predictable pricing."
        ),
    ),
    Plan(
        id=102,
        name="Momentum",
        tier="Growth",
        monthly_price=49,
        yearly_price=490,
        benefits_score=74,
        seats=10,
        support="Priority email",
        features=["Advanced analytics", "Workflow automation", "Team dashboards"],
        tags=["balanced", "growth", "automation"],
        description=(
            "A balanced growth plan with stronger automation, wider collaboration, "
            "and premium-looking capabilities without enterprise cost."
        ),
    ),
    Plan(
        id=103,
        name="Peak Premium",
        tier="Premium",
        monthly_price=79,
        yearly_price=790,
        benefits_score=91,
        seats=25,
        support="24/7 chat and email",
        features=["AI insights", "Premium integrations", "Advanced security"],
        tags=["premium", "benefits", "popular"],
        description=(
            "An affordable premium option for scaling businesses that need richer "
            "benefits, stronger security, AI insights, and responsive support."
        ),
    ),
    Plan(
        id=104,
        name="Summit One",
        tier="Enterprise",
        monthly_price=149,
        yearly_price=1490,
        benefits_score=98,
        seats=100,
        support="Dedicated success manager",
        features=["Custom SLAs", "Single sign-on", "Unlimited automation"],
        tags=["enterprise", "maximum-benefits", "custom"],
        description=(
            "A maximum benefits enterprise plan with custom onboarding, dedicated "
            "success support, compliance features, and broad operational control."
        ),
    ),
]

SUBSCRIPTIONS = [
    Subscription(
        id=5001,
        user_id=1,
        plan_id=102,
        status="active",
        billing_cycle="monthly",
        started_on=date.today() - timedelta(days=43),
        renews_on=date.today() + timedelta(days=17),
        auto_renew=True,
        usage_health="high",
    ),
    Subscription(
        id=5002,
        user_id=2,
        plan_id=103,
        status="trial",
        billing_cycle="yearly",
        started_on=date.today() - timedelta(days=9),
        renews_on=date.today() + timedelta(days=5),
        auto_renew=True,
        usage_health="medium",
    ),
]

SUBSCRIPTION_LOGS = [
    SubscriptionLog(
        id=9001,
        subscription_id=5001,
        action="created",
        message="Subscription created on Momentum monthly plan.",
        created_at=datetime.now() - timedelta(days=43),
    ),
    SubscriptionLog(
        id=9002,
        subscription_id=5002,
        action="trial_started",
        message="Trial started on Peak Premium yearly plan.",
        created_at=datetime.now() - timedelta(days=9),
    ),
]


def plan_by_id(plan_id: int) -> Plan:
    for plan in PLANS:
        if plan.id == plan_id:
            return plan
    raise HTTPException(status_code=404, detail="Plan not found")


def subscription_by_id(subscription_id: int) -> Subscription:
    for subscription in SUBSCRIPTIONS:
        if subscription.id == subscription_id:
            return subscription
    raise HTTPException(status_code=404, detail="Subscription not found")


def tokenize(text: str) -> list[str]:
    cleaned = "".join(char.lower() if char.isalnum() or char.isspace() else " " for char in text)
    return [token for token in cleaned.split() if token]


def vectorize(text: str) -> Counter[str]:
    synonyms = {
        "cheap": "affordable",
        "budget": "affordable",
        "lowcost": "affordable",
        "premium": "premium",
        "benefits": "benefits",
        "features": "benefits",
        "maximum": "maximum",
        "best": "maximum",
    }
    normalized = [synonyms.get(token, token) for token in tokenize(text)]
    return Counter(normalized)


def cosine_similarity(left: Counter[str], right: Counter[str]) -> float:
    common_terms = set(left) & set(right)
    numerator = sum(left[term] * right[term] for term in common_terms)
    left_magnitude = sqrt(sum(value * value for value in left.values()))
    right_magnitude = sqrt(sum(value * value for value in right.values()))
    if left_magnitude == 0 or right_magnitude == 0:
        return 0.0
    return numerator / (left_magnitude * right_magnitude)


def plan_search_document(plan: Plan) -> str:
    return " ".join(
        [
            plan.name,
            plan.tier,
            plan.description,
            " ".join(plan.tags),
            " ".join(plan.features),
            f"benefits score {plan.benefits_score}",
            f"price {plan.monthly_price}",
        ]
    )


def serialize_subscription(subscription: Subscription) -> dict:
    plan = plan_by_id(subscription.plan_id)
    user = next(user for user in USERS if user.id == subscription.user_id)
    return {
        **subscription.model_dump(),
        "user": user.model_dump(),
        "plan": plan.model_dump(),
    }


@app.get("/")
def root() -> dict:
    return {
        "message": "Subscription management API is running.",
        "sql_tables": ["users", "plans", "subscriptions"],
        "mongodb_collections": [
            "plan_descriptions",
            "plan_embeddings",
            "subscription_logs",
        ],
    }


@app.get("/api/dashboard")
def get_dashboard() -> dict:
    active_count = sum(1 for item in SUBSCRIPTIONS if item.status == "active")
    trial_count = sum(1 for item in SUBSCRIPTIONS if item.status == "trial")
    mrr = sum(plan_by_id(item.plan_id).monthly_price for item in SUBSCRIPTIONS if item.status != "cancelled")
    return {
        "metrics": {
            "availablePlans": len(PLANS),
            "subscriptions": len(SUBSCRIPTIONS),
            "activeSubscriptions": active_count,
            "trialSubscriptions": trial_count,
            "estimatedMRR": mrr,
        },
        "plans": [plan.model_dump() for plan in PLANS],
        "subscriptions": [serialize_subscription(subscription) for subscription in SUBSCRIPTIONS],
        "logs": [log.model_dump() for log in sorted(SUBSCRIPTION_LOGS, key=lambda item: item.created_at, reverse=True)],
        "users": [user.model_dump() for user in USERS],
    }


@app.post("/api/search")
def semantic_plan_search(payload: SearchRequest) -> dict:
    query_vector = vectorize(payload.query)
    ranked_results = []
    for plan in PLANS:
        score = cosine_similarity(query_vector, vectorize(plan_search_document(plan)))
        if "affordable" in query_vector:
            score += max(0, 100 - plan.monthly_price) / 300
        if "premium" in query_vector and plan.tier == "Premium":
            score += 0.2
        if "maximum" in query_vector or "benefits" in query_vector:
            score += plan.benefits_score / 200
        ranked_results.append(
            {
                "plan": plan.model_dump(),
                "score": round(score, 4),
                "reason": (
                    "Matched on pricing, tier, benefits, and descriptive intent "
                    "from the semantic search profile."
                ),
            }
        )

    ranked_results.sort(key=lambda item: item["score"], reverse=True)
    return {"query": payload.query, "results": ranked_results[:4]}


@app.post("/api/subscriptions")
def create_subscription(payload: SubscribeRequest) -> dict:
    plan = plan_by_id(payload.plan_id)
    if not any(user.id == payload.user_id for user in USERS):
        raise HTTPException(status_code=404, detail="User not found")

    next_id = max((subscription.id for subscription in SUBSCRIPTIONS), default=5000) + 1
    subscription = Subscription(
        id=next_id,
        user_id=payload.user_id,
        plan_id=plan.id,
        status="active",
        billing_cycle=payload.billing_cycle,
        started_on=date.today(),
        renews_on=date.today() + timedelta(days=365 if payload.billing_cycle == "yearly" else 30),
        auto_renew=True,
        usage_health="medium",
    )
    SUBSCRIPTIONS.append(subscription)

    SUBSCRIPTION_LOGS.append(
        SubscriptionLog(
            id=max((log.id for log in SUBSCRIPTION_LOGS), default=9000) + 1,
            subscription_id=subscription.id,
            action="subscribed",
            message=f"Subscribed to {plan.name} on {payload.billing_cycle} billing.",
            created_at=datetime.now(),
        )
    )
    return {"message": "Subscription created successfully.", "subscription": serialize_subscription(subscription)}


@app.patch("/api/subscriptions/{subscription_id}/status")
def update_subscription_status(subscription_id: int, payload: StatusUpdateRequest) -> dict:
    subscription = subscription_by_id(subscription_id)
    if payload.subscription_id != subscription_id:
        raise HTTPException(status_code=400, detail="Subscription id mismatch")

    subscription.status = payload.status
    SUBSCRIPTION_LOGS.append(
        SubscriptionLog(
            id=max((log.id for log in SUBSCRIPTION_LOGS), default=9000) + 1,
            subscription_id=subscription.id,
            action="status_changed",
            message=f"Subscription status changed to {payload.status}.",
            created_at=datetime.now(),
        )
    )
    return {"message": "Subscription status updated.", "subscription": serialize_subscription(subscription)}


@app.patch("/api/subscriptions/{subscription_id}/plan")
def change_plan(subscription_id: int, payload: PlanChangeRequest) -> dict:
    subscription = subscription_by_id(subscription_id)
    if payload.subscription_id != subscription_id:
        raise HTTPException(status_code=400, detail="Subscription id mismatch")

    previous_plan = plan_by_id(subscription.plan_id)
    new_plan = plan_by_id(payload.new_plan_id)

    subscription.plan_id = new_plan.id
    if payload.billing_cycle:
        subscription.billing_cycle = payload.billing_cycle
    subscription.status = "scheduled_change"
    subscription.renews_on = date.today() + timedelta(days=365 if subscription.billing_cycle == "yearly" else 30)

    SUBSCRIPTION_LOGS.append(
        SubscriptionLog(
            id=max((log.id for log in SUBSCRIPTION_LOGS), default=9000) + 1,
            subscription_id=subscription.id,
            action="plan_changed",
            message=f"Plan changed from {previous_plan.name} to {new_plan.name}.",
            created_at=datetime.now(),
        )
    )
    return {"message": "Plan change recorded.", "subscription": serialize_subscription(subscription)}
