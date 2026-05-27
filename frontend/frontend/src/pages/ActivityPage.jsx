import { formatDateTime, sentenceCase } from '../utils/formatters'

function ActivityPage({
  activityFilter,
  activityQuery,
  filteredLogs,
  logActions,
  logs,
  statusCounts,
  subscriptions,
  onActivityFilterChange,
  onActivityQueryChange,
}) {
  return (
    <section className="page-grid">
      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Event stream</p>
            <h2>Trace every subscription decision</h2>
          </div>
          <div className="topbar-chip">{logs.length} events</div>
        </div>
        <div className="search-bar">
          <input
            value={activityQuery}
            onChange={(event) => onActivityQueryChange(event.target.value)}
            placeholder="Filter activity by keyword or message"
          />
        </div>
        <div className="toggle-row">
          {logActions.map((action) => (
            <button
              key={action}
              type="button"
              className={activityFilter === action ? 'active-tab compact' : 'tab compact'}
              onClick={() => onActivityFilterChange(action)}
            >
              {sentenceCase(action)}
            </button>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Operational scorecard</p>
            <h2>Status distribution</h2>
          </div>
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
            <p className="eyebrow">Snapshot</p>
            <h2>Audit coverage</h2>
          </div>
        </div>
        <div className="stack-list">
          <article className="mini-card">
            <div>
              <strong>{logs.length}</strong>
              <p>Total logged events</p>
            </div>
          </article>
          <article className="mini-card">
            <div>
              <strong>{subscriptions.length}</strong>
              <p>Tracked subscriptions</p>
            </div>
          </article>
          <article className="mini-card">
            <div>
              <strong>{new Set(logs.map((log) => log.action)).size}</strong>
              <p>Event types observed</p>
            </div>
          </article>
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Filtered activity log</h2>
          </div>
        </div>
        <div className="timeline-list">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <article className="timeline-item" key={log.id}>
                <div className="timeline-dot" />
                <div>
                  <strong>{sentenceCase(log.action)}</strong>
                  <p>{log.message}</p>
                </div>
                <time>{formatDateTime(log.created_at)}</time>
              </article>
            ))
          ) : (
            <p className="empty-state">No activity matched this filter.</p>
          )}
        </div>
      </article>
    </section>
  )
}

export default ActivityPage
