import { daysUntil, formatDate, formatDateTime, formatMoney, sentenceCase } from '../utils/formatters'

function OverviewPage({
  adminForm,
  annualizedRevenue,
  authUser,
  highlightedPlan,
  isAdmin,
  isManagingAdmins,
  metrics,
  promotableUsers,
  recentLogs,
  renewalQueue,
  riskSubscriptions,
  searchIdeas,
  selectedPromotionUserId,
  statusCounts,
  subscriptions,
  onAdminCreate,
  onAdminFormChange,
  onPageChange,
  onPlanPick,
  onPromoteUser,
  onPromotionSelection,
  onSearchIdea,
}) {
  return (
    <section className="page-grid">
      <article className="hero-card page-hero">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h3>{authUser.name}, your subscription portfolio is live.</h3>
          <p className="intro-text">
            Today's view combines account health, revenue posture, and quick actions so your next step is always close.
          </p>
        </div>
        <div className="metric-ribbon">
          <article>
            <span>{metrics.availablePlans}</span>
            <p>Plans available</p>
          </article>
          <article>
            <span>{metrics.activeSubscriptions}</span>
            <p>Active subscriptions</p>
          </article>
          <article>
            <span>{metrics.trialSubscriptions}</span>
            <p>Trials in motion</p>
          </article>
          <article>
            <span>{formatMoney(annualizedRevenue)}</span>
            <p>Annualized run rate</p>
          </article>
        </div>
      </article>

      <article className="panel spotlight-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Recommended next move</p>
            <h2>{highlightedPlan?.name ?? 'Search for a plan'}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => onPageChange('plans')}>
            Open plans
          </button>
        </div>
        {highlightedPlan ? (
          <>
            <p>{highlightedPlan.description}</p>
            <div className="chip-row">
              <span>{highlightedPlan.tier}</span>
              <span>{formatMoney(highlightedPlan.monthly_price)}/mo</span>
              <span>{highlightedPlan.benefits_score} benefits</span>
              <span>{highlightedPlan.seats} seats</span>
            </div>
            <div className="feature-list">
              {highlightedPlan.features.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
            <button type="button" onClick={() => onPlanPick(highlightedPlan.id)}>
              {isAdmin ? 'Use this plan' : 'Choose this plan'}
            </button>
          </>
        ) : null}
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Quick prompts</p>
            <h2>Launch semantic searches</h2>
          </div>
        </div>
        <div className="prompt-grid">
          {searchIdeas.map((idea) => (
            <button key={idea} type="button" className="prompt-card" onClick={() => onSearchIdea(undefined, idea)}>
              {idea}
            </button>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Renewal radar</p>
            <h2>Upcoming subscription milestones</h2>
          </div>
        </div>
        <div className="stack-list">
          {renewalQueue.map((subscription) => (
            <article className="mini-card" key={subscription.id}>
              <div>
                <strong>{subscription.user.name}</strong>
                <p>{subscription.plan.name}</p>
              </div>
              <div className="align-right">
                <strong>{daysUntil(subscription.renews_on)} days</strong>
                <p>{formatDate(subscription.renews_on)}</p>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Health profile</p>
            <h2>Lifecycle status mix</h2>
          </div>
          <div className="topbar-chip">{subscriptions.length} total</div>
        </div>
        <div className="status-grid">
          {statusCounts.map((item) => (
            <article className={`status-tile ${item.status}`} key={item.status}>
              <strong>{item.count}</strong>
              <p>{sentenceCase(item.status)}</p>
            </article>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Watch list</p>
            <h2>Accounts needing attention</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => onPageChange('subscriptions')}>
            Open subscriptions
          </button>
        </div>
        <div className="stack-list">
          {riskSubscriptions.length > 0 ? (
            riskSubscriptions.map((subscription) => (
              <article className="mini-card" key={subscription.id}>
                <div>
                  <strong>{subscription.user.name}</strong>
                  <p>{subscription.plan.name}</p>
                </div>
                <div className="align-right">
                  <span className={`status-pill ${subscription.status}`}>{sentenceCase(subscription.status)}</span>
                  <p>{subscription.usage_health} usage</p>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state">No subscriptions are currently flagged as at-risk.</p>
          )}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2>Latest backend events</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => onPageChange('activity')}>
            Open activity page
          </button>
        </div>
        <div className="timeline-list">
          {recentLogs.map((log) => (
            <article className="timeline-item" key={log.id}>
              <div className="timeline-dot" />
              <div>
                <strong>{sentenceCase(log.action)}</strong>
                <p>{log.message}</p>
              </div>
              <time>{formatDateTime(log.created_at)}</time>
            </article>
          ))}
        </div>
      </article>

      {isAdmin ? (
        <article className="panel wide-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Admin access</p>
              <h2>Create and promote administrators</h2>
            </div>
          </div>
          <div className="admin-grid">
            <form className="form-stack" onSubmit={onAdminCreate}>
              <label>
                Admin name
                <input
                  value={adminForm.name}
                  onChange={(event) => onAdminFormChange((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Meera Nair"
                />
              </label>
              <label>
                Admin email
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(event) => onAdminFormChange((current) => ({ ...current, email: event.target.value }))}
                  placeholder="meera@company.in"
                />
              </label>
              <label>
                Company
                <input
                  value={adminForm.company}
                  onChange={(event) => onAdminFormChange((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Company Name"
                />
              </label>
              <label>
                Temporary password
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(event) => onAdminFormChange((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Minimum 6 characters"
                />
              </label>
              <button type="submit" disabled={isManagingAdmins}>
                {isManagingAdmins ? 'Saving admin...' : 'Create admin user'}
              </button>
            </form>

            <div className="form-stack">
              <label>
                Promote existing user
                <select value={selectedPromotionUserId} onChange={(event) => onPromotionSelection(event.target.value)}>
                  <option value="">Select a user</option>
                  {promotableUsers.map((user) => (
                    <option value={user.id} key={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={isManagingAdmins || promotableUsers.length === 0} onClick={onPromoteUser}>
                {isManagingAdmins ? 'Promoting user...' : 'Promote to admin'}
              </button>
              <p className="help-text">
                Use this panel to provision new admin accounts directly in the database or elevate an existing user without manual SQL changes.
              </p>
            </div>
          </div>
        </article>
      ) : null}
    </section>
  )
}

export default OverviewPage
