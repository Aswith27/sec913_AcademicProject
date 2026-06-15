import { formatMoney } from '../utils/formatters'

function PlansPage({
  highlightedPlan,
  isAdmin,
  isSearching,
  planSort,
  planForm,
  searchIdeas,
  searchQuery,
  searchResults,
  sortedPlans,
  onPlanPick,
  onPlanCreate,
  onPlanFormChange,
  onSearch,
  onSearchIdea,
  onSearchQueryChange,
  onSortChange,
}) {
  return (
    <section className="page-grid plans-layout">
      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">AI-assisted discovery</p>
            <h2>Search for the right plan by intent</h2>
          </div>
          <div className="topbar-chip">{searchResults.length} matches</div>
        </div>
        <form className="search-bar" onSubmit={onSearch}>
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder='Try "Affordable premium plans for growing Indian businesses"'
          />
          <button type="submit">{isSearching ? 'Searching...' : 'Search'}</button>
        </form>
        <div className="chip-row">
          {searchIdeas.map((idea) => (
            <button key={idea} type="button" className="chip-button" onClick={() => onSearchIdea(undefined, idea)}>
              {idea}
            </button>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Spotlight</p>
            <h2>{highlightedPlan?.name ?? 'No recommendation yet'}</h2>
          </div>
        </div>
        {highlightedPlan ? (
          <>
            <p>{highlightedPlan.description}</p>
            <div className="chip-row">
              <span>{formatMoney(highlightedPlan.monthly_price)}/mo</span>
              <span>{formatMoney(highlightedPlan.yearly_price)}/yr</span>
              <span>{highlightedPlan.support}</span>
            </div>
            <div className="feature-list">
              {highlightedPlan.features.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
            <button type="button" onClick={() => onPlanPick(highlightedPlan.id)}>
              {isAdmin ? 'Start with this plan' : 'Subscribe to this plan'}
            </button>
          </>
        ) : (
          <p className="empty-state">Run a search to surface an intent-based recommendation.</p>
        )}
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Catalog controls</p>
            <h2>Sort the plan deck</h2>
          </div>
        </div>
        <div className="toggle-row">
          {[
            { id: 'recommended', label: 'Recommended' },
            { id: 'benefits', label: 'Benefits' },
            { id: 'price', label: 'Price' },
            { id: 'seats', label: 'Seats' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              className={planSort === option.id ? 'active-tab compact' : 'tab compact'}
              onClick={() => onSortChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Search results</p>
            <h2>Recommendation lane</h2>
          </div>
        </div>
        {searchResults.length > 0 ? (
          <div className="search-results-grid">
            {searchResults.map((result) => (
              <article className="plan-card featured search-result-card" key={result.plan.id}>
                <div className="result-topline">
                  <h3>{result.plan.name}</h3>
                  <span>{result.score}</span>
                </div>
                <p>{result.plan.description}</p>
                <div className="chip-row">
                  <span>{result.plan.tier}</span>
                  <span>{formatMoney(result.plan.monthly_price)}/mo</span>
                  <span>{result.plan.benefits_score} benefits</span>
                </div>
                <button type="button" onClick={() => onPlanPick(result.plan.id)}>
                  {isAdmin ? 'Use search result' : 'Subscribe to search result'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No matching plans yet. Add a plan above, then search again.</p>
        )}
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Plan deck</p>
            <h2>Compare available plans</h2>
          </div>
        </div>
        {sortedPlans.length > 0 ? (
          <div className="plan-grid">
            {sortedPlans.map((plan) => {
              const savings = plan.monthly_price * 12 - plan.yearly_price

              return (
                <article className="plan-card" key={plan.id}>
                  <div className="plan-heading">
                    <div>
                      <p className="tier">{plan.tier}</p>
                      <h3>{plan.name}</h3>
                    </div>
                    <div className="price">
                      {formatMoney(plan.monthly_price)}
                      <span>/mo</span>
                    </div>
                  </div>
                  <p className="description">{plan.description}</p>
                  <div className="chip-row plan-meta">
                    <span>{plan.seats} seats</span>
                    <span>{plan.support}</span>
                    <span>{formatMoney(savings)} annual savings</span>
                  </div>
                  <div className="feature-list">
                    {plan.features.map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}
                  </div>
                  <div className="chip-row plan-tags">
                    {plan.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button type="button" className="plan-cta" onClick={() => onPlanPick(plan.id)}>
                    {isAdmin ? `Choose ${plan.name}` : `Subscribe to ${plan.name}`}
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="empty-state">No plans are stored yet. Use the form page to create your first one.</p>
        )}
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Catalog input</p>
            <h2>{isAdmin ? 'Create a plan from the website' : 'Admin-only catalog controls'}</h2>
          </div>
        </div>
        {isAdmin ? (
          <form className="form-stack form-columns" onSubmit={onPlanCreate}>
          <label>
            Plan name
            <input
              value={planForm.name}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, name: event.target.value }))}
              placeholder="Udaan Pro"
            />
          </label>
          <label>
            Tier
            <input
              value={planForm.tier}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, tier: event.target.value }))}
              placeholder="Premium"
            />
          </label>
          <label>
            Monthly price
            <input
              type="number"
              min="0"
              value={planForm.monthly_price}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, monthly_price: event.target.value }))}
              placeholder="6999"
            />
          </label>
          <label>
            Yearly price
            <input
              type="number"
              min="0"
              value={planForm.yearly_price}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, yearly_price: event.target.value }))}
              placeholder="69999"
            />
          </label>
          <label>
            Benefits score
            <input
              type="number"
              min="0"
              value={planForm.benefits_score}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, benefits_score: event.target.value }))}
              placeholder="90"
            />
          </label>
          <label>
            Seats
            <input
              type="number"
              min="1"
              value={planForm.seats}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, seats: event.target.value }))}
              placeholder="25"
            />
          </label>
          <label>
            Support
            <input
              value={planForm.support}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, support: event.target.value }))}
              placeholder="24/7 chat, email, and onboarding support"
            />
          </label>
          <label className="field-wide">
            Description
            <textarea
              rows="4"
              value={planForm.description}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe who this plan is for and what it includes."
            />
          </label>
          <label className="field-wide">
            Features
            <input
              value={planForm.features}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, features: event.target.value }))}
              placeholder="AI insights, GST-ready reports, Advanced security"
            />
          </label>
          <label className="field-wide">
            Tags
            <input
              value={planForm.tags}
              onChange={(event) => onPlanFormChange((current) => ({ ...current, tags: event.target.value }))}
              placeholder="premium, automation, growth"
            />
          </label>
          <button type="submit" className="field-wide">Save plan</button>
          </form>
        ) : (
          <p className="empty-state">Your account can search and compare plans, but only admins can create or edit the catalog.</p>
        )}
      </article>
    </section>
  )
}

export default PlansPage
