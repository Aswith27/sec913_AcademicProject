function AuthScreen({
  authMode,
  error,
  isAuthenticating,
  loginForm,
  setAuthMode,
  setLoginForm,
  setSignupForm,
  signupForm,
  onLogin,
  onSignup,
}) {
  return (
    <main className="shell auth-shell">
      <section className="auth-layout">
        <article className="auth-story">
          <p className="eyebrow">PS-23 Subscription and Plan Management</p>
          <h1>All your subscription operations, in one place.</h1>
          <p className="intro-text">
            Manage plans, customers, subscription actions, and activity logs through a clean multi-page workspace.
          </p>
          <div className="feature-orbit">
            <article>
              <strong>Plan discovery</strong>
              <p>Semantic search with quick recommendations and plan comparisons.</p>
            </article>
            <article>
              <strong>Lifecycle actions</strong>
              <p>Create subscriptions, switch plans, and monitor renewal risk from one place.</p>
            </article>
            <article>
              <strong>Operational audit</strong>
              <p>Track log history and customer status changes in a dedicated activity page.</p>
            </article>
          </div>
        </article>

        <section className="panel auth-card">
          <div className="auth-toggle">
            <button type="button" className={authMode === 'login' ? 'active-tab' : 'tab'} onClick={() => setAuthMode('login')}>
              Login
            </button>
            <button type="button" className={authMode === 'signup' ? 'active-tab' : 'tab'} onClick={() => setAuthMode('signup')}>
              Sign up
            </button>
          </div>

          {error ? <section className="banner error">{error}</section> : null}

          {authMode === 'login' ? (
            <form className="form-stack" onSubmit={onLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
              </label>
              <button type="submit" disabled={isAuthenticating}>
                {isAuthenticating ? 'Signing in...' : 'Login'}
              </button>
              <p className="help-text">
                Login uses accounts stored in the database. If admin bootstrap is enabled in the backend config, you can sign in with the configured admin email and password.
              </p>
            </form>
          ) : (
            <form className="form-stack" onSubmit={onSignup}>
              <label>
                Name
                <input
                  value={signupForm.name}
                  onChange={(event) => setSignupForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Company
                <input
                  value={signupForm.company}
                  onChange={(event) => setSignupForm((current) => ({ ...current, company: event.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                />
              </label>
              <button type="submit" disabled={isAuthenticating}>
                {isAuthenticating ? 'Creating account...' : 'Create account'}
              </button>
              <p className="help-text">New signups are created with the USER role. Admin access comes from the backend admin bootstrap or direct database setup.</p>
            </form>
          )}
        </section>
      </section>
    </main>
  )
}

export default AuthScreen
