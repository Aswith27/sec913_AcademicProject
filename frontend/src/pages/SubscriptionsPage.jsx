import { formatDate, formatMoney, sentenceCase } from '../utils/formatters'

function SubscriptionsPage({
  filteredSubscriptions,
  isAdmin,
  plans,
  selectedBilling,
  selectedPlanId,
  selectedUserId,
  statusCounts,
  subscriptionFilter,
  userSnapshots,
  users,
  onBillingChange,
  onDeleteSubscription,
  onFilterChange,
  onPlanChange,
  onPlanSelection,
  onStatusChange,
  onSubscribe,
  onUserSelection,
}) {
  const canCreateSubscription = users.length > 0 && plans.length > 0

  return (
    <section className="page-grid">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Create subscription</p>
            <h2>{isAdmin ? 'Assign a plan to a user' : 'Subscribe to a plan'}</h2>
          </div>
        </div>

        <form className="form-stack" onSubmit={onSubscribe}>
          <label>
            User
            <select
              value={selectedUserId ?? ''}
              disabled={users.length === 0 || !isAdmin}
              onChange={(event) => onUserSelection(Number(event.target.value))}
            >
              {users.length === 0 ? <option value="">No users available</option> : null}

              {users.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.name} - {user.company}
                </option>
              ))}
            </select>
          </label>

          <label>
            Plan
            <select
              value={selectedPlanId ?? ''}
              disabled={plans.length === 0}
              onChange={(event) => onPlanSelection(Number(event.target.value))}
            >
              {plans.length === 0 ? <option value="">No plans available</option> : null}

              {plans.map((plan) => (
                <option value={plan.id} key={plan.id}>
                  {plan.name} - {formatMoney(plan.monthly_price)}/mo
                </option>
              ))}
            </select>
          </label>

          <label>
            Billing cycle
            <select value={selectedBilling} onChange={(event) => onBillingChange(event.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          {!canCreateSubscription ? (
            <p className="help-text">
              Create a plan on the Plans page first. New users can be added from the sign-up screen.
            </p>
          ) : null}

          {!isAdmin ? (
            <p className="help-text">
              You can subscribe plans for your own account. Admins can assign subscriptions for any user.
            </p>
          ) : null}

          <button type="submit" disabled={!canCreateSubscription}>
            {isAdmin ? 'Create subscription' : 'Subscribe now'}
          </button>
        </form>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Roster health</p>
            <h2>Filter by lifecycle state</h2>
          </div>
        </div>

        <div className="toggle-row">
          <button
            type="button"
            className={subscriptionFilter === 'all' ? 'active-tab compact' : 'tab compact'}
            onClick={() => onFilterChange('all')}
          >
            All
          </button>

          {statusCounts.map((item) => (
            <button
              key={item.status}
              type="button"
              className={subscriptionFilter === item.status ? 'active-tab compact' : 'tab compact'}
              onClick={() => onFilterChange(item.status)}
            >
              {sentenceCase(item.status)} ({item.count})
            </button>
          ))}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Subscription roster</p>
            <h2>Act on live customer plans</h2>
          </div>

          <div className="topbar-chip">{filteredSubscriptions.length} shown</div>
        </div>

        {filteredSubscriptions.length > 0 ? (
          <div className="subscription-list">
            {filteredSubscriptions.map((subscription) => (
              <article className="subscription-card" key={subscription.id}>
                <div className="subscription-header">
                  <div>
                    <h3>{subscription.user.name}</h3>

                    <p>
                      {subscription.user.company} - {subscription.plan.name}
                    </p>
                  </div>

                  <span className={`status-pill ${subscription.status}`}>
                    {sentenceCase(subscription.status)}
                  </span>
                </div>

                <div className="subscription-meta">
                  <span>{subscription.billing_cycle}</span>
                  <span>Renews {formatDate(subscription.renews_on)}</span>
                  <span>{subscription.usage_health} usage</span>
                  <span>
                    {subscription.auto_renew ? 'Auto renew on' : 'Auto renew off'}
                  </span>
                </div>

                {isAdmin ? (
                  <div className="action-row">
                    <button
                      type="button"
                      onClick={() => onStatusChange(subscription.id, 'active')}
                    >
                      Activate
                    </button>

                    <button
                      type="button"
                      onClick={() => onStatusChange(subscription.id, 'paused')}
                    >
                      Pause
                    </button>

                    <button
                      type="button"
                      onClick={() => onStatusChange(subscription.id, 'cancelled')}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={plans.length < 2}
                      onClick={() => {
                        const currentIndex = plans.findIndex(
                          (plan) => plan.id === subscription.plan.id
                        )

                        const nextPlan =
                          plans[(currentIndex + 1) % plans.length]

                        onPlanChange(
                          subscription.id,
                          nextPlan.id,
                          subscription.billing_cycle
                        )
                      }}
                    >
                      Move to next plan
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => onDeleteSubscription(subscription.id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <p className="help-text">
                    Lifecycle updates are managed by admins.
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            {isAdmin
              ? 'No subscriptions yet. Create one after adding a plan.'
              : 'No subscriptions are currently assigned to your account.'}
          </p>
        )}
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Customer footprint</p>
            <h2>User account coverage</h2>
          </div>
        </div>

        {userSnapshots.length > 0 ? (
          <div className="user-grid">
            {userSnapshots.map((user) => (
              <article className="mini-card profile-card" key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.company}</p>
                </div>

                <div className="profile-stats">
                  <span>{user.totalSubscriptions} subs</span>
                  <span>{user.activeSubscriptions} active</span>
                  <span>{user.currentPlan}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            {isAdmin
              ? 'No users are available yet. Create one from the sign-up screen.'
              : 'Your profile snapshot will appear here once subscription data is available.'}
          </p>
        )}
      </article>
    </section>
  )
}

export default SubscriptionsPage