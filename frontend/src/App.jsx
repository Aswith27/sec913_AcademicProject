import { useEffect, useState } from 'react'
import './App.css'
import {
  changeSubscriptionPlan,
  clearAuth,
  createAdminUser,
  createPlan,
  createSubscription,
  fetchDashboard,
  getStoredToken,
  getStoredUser,
  login,
  promoteUserToAdmin,
  semanticSearch,
  signup,
  updateSubscriptionStatus,
} from './api'
import { defaultLogin, defaultPlanForm, defaultSignup, navItems, searchIdeas, statusFilters } from './constants/appData'
import ActivityPage from './pages/ActivityPage'
import AuthScreen from './pages/AuthScreen'
import OverviewPage from './pages/OverviewPage'
import PlansPage from './pages/PlansPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import { formatMoney, parseNumber, splitCommaSeparated } from './utils/formatters'
import { getHashPage, navigateWithHash } from './utils/navigation'
import { FiLogOut } from "react-icons/fi"

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authUser, setAuthUser] = useState(() => getStoredUser())
  const [currentPage, setCurrentPage] = useState(() => getHashPage())
  const [signupForm, setSignupForm] = useState(defaultSignup)
  const [loginForm, setLoginForm] = useState(defaultLogin)
  const [planForm, setPlanForm] = useState(defaultPlanForm)
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
  })
  const [dashboard, setDashboard] = useState(null)
  const [searchQuery, setSearchQuery] = useState('Affordable premium plans for growing Indian businesses')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [selectedBilling, setSelectedBilling] = useState('monthly')
  const [planSort, setPlanSort] = useState('recommended')
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [activityQuery, setActivityQuery] = useState('')
  const [selectedPromotionUserId, setSelectedPromotionUserId] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()))
  const [isSearching, setIsSearching] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isManagingAdmins, setIsManagingAdmins] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const isAdmin = authUser?.role === 'ADMIN'

  useEffect(() => {
    function syncPageFromHash() {
      setCurrentPage(getHashPage())
    }

    syncPageFromHash()
    window.addEventListener('hashchange', syncPageFromHash)
    return () => window.removeEventListener('hashchange', syncPageFromHash)
  }, [])

  useEffect(() => {
    if (getStoredToken()) {
      loadDashboard()
    }
  }, [])

  useEffect(() => {
    if (!dashboard || searchResults.length > 0 || dashboard.plans.length === 0) {
      return
    }

    handleSearch()
  }, [dashboard])

  async function loadDashboard() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchDashboard()
      setDashboard(data)
      setSelectedUserId((current) => {
        if (data.users.some((user) => user.id === current)) {
          return current
        }

        return data.users[0]?.id ?? null
      })
      setSelectedPlanId((current) => {
        if (data.plans.some((plan) => plan.id === current)) {
          return current
        }

        return data.plans[0]?.id ?? null
      })
    } catch (loadError) {
      setError(loadError.message)
      if (!getStoredToken()) {
        setAuthUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSearch(event, customQuery) {
    event?.preventDefault()
    const query = customQuery ?? searchQuery
    setSearchQuery(query)
    setIsSearching(true)
    setError('')

    try {
      const data = await semanticSearch(query)
      setSearchResults(data.results)
      setCurrentPage('plans')
      navigateWithHash('plans')
    } catch (searchError) {
      setError(searchError.message)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleSignup(event) {
    event.preventDefault()
    setIsAuthenticating(true)
    setError('')

    try {
      const data = await signup(signupForm)
      setAuthUser(data.user)
      setMessage(`Welcome, ${data.user.name}. Your workspace is ready.`)
      setSignupForm(defaultSignup)
      navigateWithHash('overview')
      await loadDashboard()
    } catch (authError) {
      setError(authError.message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setIsAuthenticating(true)
    setError('')

    try {
      const data = await login(loginForm)
      setAuthUser(data.user)
      setMessage(`Welcome back, ${data.user.name}.`)
      setLoginForm(defaultLogin)
      navigateWithHash('overview')
      await loadDashboard()
    } catch (authError) {
      setError(authError.message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  function handleLogout() {
    clearAuth()
    setAuthUser(null)
    setDashboard(null)
    setSearchResults([])
    setMessage('')
    setError('')
    setAuthMode('login')
  }

  async function handleSubscribe(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!selectedUserId || !selectedPlanId) {
      setError('Create at least one plan and make sure a user is available before creating a subscription.')
      return
    }

    try {
      const data = await createSubscription({
        user_id: Number(selectedUserId),
        plan_id: Number(selectedPlanId),
        billing_cycle: selectedBilling,
      })
      setMessage(data.message)
      await loadDashboard()
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  async function handlePlanCreate(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!isAdmin) {
      setError('Only admins can create plans.')
      return
    }

    try {
      const data = await createPlan({
        ...planForm,
        monthly_price: parseNumber(planForm.monthly_price),
        yearly_price: parseNumber(planForm.yearly_price),
        benefits_score: parseNumber(planForm.benefits_score),
        seats: parseNumber(planForm.seats),
        features: splitCommaSeparated(planForm.features),
        tags: splitCommaSeparated(planForm.tags),
      })
      setMessage(data.message)
      setPlanForm(defaultPlanForm)
      setSelectedPlanId(data.plan.id)
      await loadDashboard()
    } catch (planError) {
      setError(planError.message)
    }
  }

  async function handleAdminCreate(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!isAdmin) {
      setError('Only admins can create other admins.')
      return
    }

    setIsManagingAdmins(true)
    try {
      const data = await createAdminUser(adminForm)
      setMessage(data.message)
      setAdminForm({
        name: '',
        email: '',
        company: '',
        password: '',
      })
      await loadDashboard()
    } catch (adminError) {
      setError(adminError.message)
    } finally {
      setIsManagingAdmins(false)
    }
  }

  async function handlePromoteUser() {
    setMessage('')
    setError('')

    if (!isAdmin) {
      setError('Only admins can promote users.')
      return
    }

    if (!selectedPromotionUserId) {
      setError('Select a user to promote.')
      return
    }

    setIsManagingAdmins(true)
    try {
      const data = await promoteUserToAdmin(Number(selectedPromotionUserId))
      setMessage(data.message)
      setSelectedPromotionUserId('')
      await loadDashboard()
    } catch (promotionError) {
      setError(promotionError.message)
    } finally {
      setIsManagingAdmins(false)
    }
  }

  async function handleStatusChange(subscriptionId, status) {
    setMessage('')
    setError('')

    if (!isAdmin) {
      setError('Only admins can change subscription status.')
      return
    }

    try {
      const data = await updateSubscriptionStatus(subscriptionId, status)
      setMessage(data.message)
      await loadDashboard()
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  async function handlePlanChange(subscriptionId, nextPlanId, billingCycle) {
    setMessage('')
    setError('')

    if (!isAdmin) {
      setError('Only admins can change subscription plans.')
      return
    }

    try {
      const data = await changeSubscriptionPlan(subscriptionId, nextPlanId, billingCycle)
      setMessage(data.message)
      await loadDashboard()
    } catch (changeError) {
      setError(changeError.message)
    }
  }

  function handlePlanPick(planId) {
    setSelectedPlanId(planId)
    setMessage('Plan selected. Finish the subscription setup below.')
    setCurrentPage('subscriptions')
    navigateWithHash('subscriptions')
  }

  function changePage(page) {
    setCurrentPage(page)
    navigateWithHash(page)
  }

  if (!authUser) {
    return (
      <AuthScreen
        authMode={authMode}
        error={error}
        isAuthenticating={isAuthenticating}
        loginForm={loginForm}
        setAuthMode={setAuthMode}
        setLoginForm={setLoginForm}
        setSignupForm={setSignupForm}
        signupForm={signupForm}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    )
  }

  if (isLoading || !dashboard) {
    if (!isLoading && !dashboard) {
      return (
        <main className="shell loading-shell">
          <section className="loading-card">
            <p className="eyebrow">SUBSYNCr workspace</p>
            <h2>We couldn't load your workspace</h2>
            <p>{error || 'The dashboard data is unavailable right now. Please try again.'}</p>
            <div className="topbar-actions">
              <button type="button" className="secondary-button" onClick={loadDashboard}>
                Retry connection
              </button>
            <button
  type="button"
  className="icon-button"
  onClick={handleLogout}
  aria-label="Logout"
>
  <FiLogOut />
</button>
            </div>
          </section>
        </main>
      )
    }

    return (
      <main className="shell loading-shell">
        <section className="loading-card">
          <p className="eyebrow">SUBSYNC</p>
          <h2>Loading your operational view</h2>
          <p>We're connecting metrics, subscriptions, plans, and audit activity now.</p>
        </section>
      </main>
    )
  }

  const { metrics, plans, subscriptions, logs, users } = dashboard
  const statusCounts = statusFilters
    .filter((item) => item !== 'all')
    .map((status) => ({
      status,
      count: subscriptions.filter((subscription) => subscription.status === status).length,
    }))
  const highlightedPlan = searchResults[0]?.plan ?? [...plans].sort((left, right) => right.benefits_score - left.benefits_score)[0]
  const annualizedRevenue = Number(metrics.estimatedMRR ?? 0) * 12
  const renewalQueue = [...subscriptions].sort((left, right) => new Date(left.renews_on) - new Date(right.renews_on)).slice(0, 4)
  const riskSubscriptions = subscriptions
    .filter((subscription) => subscription.usage_health === 'low' || ['paused', 'cancelled'].includes(subscription.status))
    .slice(0, 4)
  const recentLogs = logs.slice(0, 5)
  const sortedPlans = [...plans].sort((left, right) => {
    if (planSort === 'price') {
      return left.monthly_price - right.monthly_price
    }

    if (planSort === 'benefits') {
      return right.benefits_score - left.benefits_score
    }

    if (planSort === 'seats') {
      return right.seats - left.seats
    }

    return right.benefits_score - left.benefits_score || left.monthly_price - right.monthly_price
  })
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    if (subscriptionFilter === 'all') {
      return true
    }

    return subscription.status === subscriptionFilter
  })
  const logActions = ['all', ...new Set(logs.map((log) => log.action))]
  const filteredLogs = logs.filter((log) => {
    const matchesAction = activityFilter === 'all' || log.action === activityFilter
    const haystack = `${log.action} ${log.message}`.toLowerCase()
    const matchesQuery = haystack.includes(activityQuery.trim().toLowerCase())
    return matchesAction && matchesQuery
  })
  const userSnapshots = users.map((user) => {
    const ownedSubscriptions = subscriptions.filter((subscription) => subscription.user.id === user.id)
    const activeOwned = ownedSubscriptions.filter((subscription) => subscription.status === 'active').length
    return {
      ...user,
      totalSubscriptions: ownedSubscriptions.length,
      activeSubscriptions: activeOwned,
      currentPlan: ownedSubscriptions[0]?.plan.name ?? 'No active plan',
    }
  })
  const promotableUsers = users.filter((user) => user.role !== 'ADMIN')

  const pageMap = {
    overview: (
      <OverviewPage
        adminForm={adminForm}
        annualizedRevenue={annualizedRevenue}
        authUser={authUser}
        highlightedPlan={highlightedPlan}
        isAdmin={isAdmin}
        isManagingAdmins={isManagingAdmins}
        metrics={metrics}
        promotableUsers={promotableUsers}
        recentLogs={recentLogs}
        renewalQueue={renewalQueue}
        riskSubscriptions={riskSubscriptions}
        searchIdeas={searchIdeas}
        selectedPromotionUserId={selectedPromotionUserId}
        statusCounts={statusCounts}
        subscriptions={subscriptions}
        onAdminFormChange={setAdminForm}
        onAdminCreate={handleAdminCreate}
        onPageChange={changePage}
        onPlanPick={handlePlanPick}
        onPromoteUser={handlePromoteUser}
        onPromotionSelection={setSelectedPromotionUserId}
        onSearchIdea={handleSearch}
      />
    ),
    plans: (
      <PlansPage
        highlightedPlan={highlightedPlan}
        isAdmin={isAdmin}
        isSearching={isSearching}
        planSort={planSort}
        planForm={planForm}
        searchIdeas={searchIdeas}
        searchQuery={searchQuery}
        searchResults={searchResults}
        sortedPlans={sortedPlans}
        onPlanPick={handlePlanPick}
        onPlanCreate={handlePlanCreate}
        onPlanFormChange={setPlanForm}
        onSearch={handleSearch}
        onSearchIdea={handleSearch}
        onSearchQueryChange={setSearchQuery}
        onSortChange={setPlanSort}
      />
    ),
    subscriptions: (
      <SubscriptionsPage
        filteredSubscriptions={filteredSubscriptions}
        isAdmin={isAdmin}
        plans={plans}
        selectedBilling={selectedBilling}
        selectedPlanId={selectedPlanId}
        selectedUserId={selectedUserId}
        statusCounts={statusCounts}
        subscriptionFilter={subscriptionFilter}
        userSnapshots={userSnapshots}
        users={users}
        onBillingChange={setSelectedBilling}
        onFilterChange={setSubscriptionFilter}
        onPlanChange={handlePlanChange}
        onPlanSelection={setSelectedPlanId}
        onStatusChange={handleStatusChange}
        onSubscribe={handleSubscribe}
        onUserSelection={setSelectedUserId}
      />
    ),
    activity: (
      <ActivityPage
        activityFilter={activityFilter}
        activityQuery={activityQuery}
        filteredLogs={filteredLogs}
        logActions={logActions}
        logs={logs}
        statusCounts={statusCounts}
        subscriptions={subscriptions}
        onActivityFilterChange={setActivityFilter}
        onActivityQueryChange={setActivityQuery}
      />
    ),
  }

  return (
    <main className="shell product-shell">
     <header className="app-header">
  <div className="brand-block">
    <p className="eyebrow">Planmaker</p>

    <h1 className="brand-title">
       Smart Subscription Operations
    </h1>
  </div>

 <nav className="top-nav" aria-label="Workspace pages">
  {navItems.map((item) => (
    <button
      key={item.id}
      type="button"
      className={currentPage === item.id ? 'nav-card active' : 'nav-card'}
      onClick={() => changePage(item.id)}
    >
      {item.label}
    </button>
  ))}
</nav>

  <div className="user-panel">
    <div className="user-details">
      <strong>{authUser.name}</strong>

      <p>
        {authUser.role === 'ADMIN'
          ? 'Administrator'
          : 'User'}
      </p>
    </div>

    <button
      type="button"
      className="secondary-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</header>

      <div className="app-stage">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace page</p>
            <h2>{navItems.find((item) => item.id === currentPage)?.label}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="secondary-button" onClick={loadDashboard}>
              Refresh data
            </button>
            <div className="topbar-chip">{formatMoney(metrics.estimatedMRR)} MRR</div>
          </div>
        </header>

        {message ? <section className="banner success">{message}</section> : null}
        {error ? <section className="banner error">{error}</section> : null}

        {pageMap[currentPage] ?? pageMap.overview}
      </div>
    </main>
  )
}

export default App
