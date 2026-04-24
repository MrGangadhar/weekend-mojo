import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiBarChart2,
  FiTruck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFilm,
  FiMap,
  FiMenu,
  FiNavigation,
  FiUsers,
  FiX,
} from 'react-icons/fi';

const PORTAL_NAV = {
  management: [
    { to: '/admin', label: 'Overview', icon: FiBarChart2 },
    { to: '/admin/trips', label: 'Trips', icon: FiNavigation },
    { to: '/admin/buses', label: 'Buses', icon: FiTruck },
    { to: '/admin/finance', label: 'Finance', icon: FiBarChart2 },
    { to: '/admin/videos', label: 'Moderation', icon: FiFilm },
  ],
  conductor: [
    { to: '/conductor', label: 'Assigned Trips', icon: FiTruck },
    { to: '/conductor/live/:tripId/:busId', label: 'Live Monitor', icon: FiMap, disabled: true },
    { to: '/conductor/passengers/:tripId/:busId', label: 'Passenger List', icon: FiUsers, disabled: true },
  ],
  editor: [
    { to: '/editor', label: 'Approved Videos', icon: FiFilm },
    { to: '/editor/queue', label: 'Publish Queue', icon: FiClock },
  ],
};

function resolvePortalType(pathname) {
  if (pathname.startsWith('/admin')) return 'management';
  if (pathname.startsWith('/conductor')) return 'conductor';
  if (pathname.startsWith('/editor')) return 'editor';
  return null;
}

function Sidebar({ portalType, isCompact, onToggleCompact, onNavigate, mobile = false }) {
  const navItems = PORTAL_NAV[portalType] || [];
  if (navItems.length === 0) return null;

  return (
    <aside className="portal-sidebar-wrapper">
      <div className={`portal-sidebar ${isCompact && !mobile ? 'portal-sidebar-compact' : ''}`}>
        {!mobile && (
          <div className="mb-3 flex items-center justify-between gap-2">
            {!isCompact ? <p className="portal-sidebar-title !mb-0">Portal Navigation</p> : <span />}
            <button
              type="button"
              className="portal-sidebar-toggle"
              onClick={onToggleCompact}
              title={isCompact ? 'Expand sidebar' : 'Compact sidebar'}
              aria-label={isCompact ? 'Expand sidebar' : 'Compact sidebar'}
            >
              {isCompact ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        )}

        {mobile && <p className="portal-sidebar-title">Portal Navigation</p>}

        <div className="space-y-1">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            if (item.disabled) {
              return (
                <div key={item.to} className="portal-sidebar-link-disabled" title={item.label}>
                  <span className="flex items-center gap-2">
                    {ItemIcon && <ItemIcon className="h-4 w-4" />}
                    {(!isCompact || mobile) && <span>{item.label}</span>}
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin' || item.to === '/conductor' || item.to === '/editor'}
                className={({ isActive }) => `portal-sidebar-link ${isActive ? 'portal-sidebar-link-active' : ''}`}
                title={item.label}
                onClick={onNavigate}
              >
                <span className="flex items-center gap-2">
                  {ItemIcon && <ItemIcon className="h-4 w-4" />}
                  {(!isCompact || mobile) && <span>{item.label}</span>}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function DashboardShell({
  eyebrow,
  title,
  subtitle,
  actions,
  metrics = [],
  children,
}) {
  const { pathname } = useLocation();
  const portalType = resolvePortalType(pathname);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCompact, setIsSidebarCompact] = useState(() => {
    try {
      return localStorage.getItem('portalSidebarCompact') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('portalSidebarCompact', isSidebarCompact ? '1' : '0');
    } catch {
      // Ignore localStorage errors in private or restricted contexts.
    }
  }, [isSidebarCompact]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="portal-shell">
      <div className="container mx-auto px-4 py-8 lg:py-10 space-y-6">
        <section className="dashboard-hero">
          <div className="space-y-3">
            {eyebrow && <p className="dashboard-eyebrow">{eyebrow}</p>}
            <div className="space-y-2 max-w-3xl">
              <h1 className="dashboard-title">{title}</h1>
              {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
            </div>
          </div>

          {actions && <div className="dashboard-actions">{actions}</div>}
        </section>

        {metrics.length > 0 && (
          <section className="dashboard-metrics-grid">
            {metrics.map((metric, index) => (
              <KpiCard
                key={`${metric.title || metric.label || index}`}
                label={metric.title || metric.label}
                value={metric.value}
                icon={metric.icon}
                color={metric.color}
                note={metric.note || metric.subtitle}
              />
            ))}
          </section>
        )}

        {portalType ? (
          <>
            <div className="flex justify-end lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="portal-mobile-menu-btn"
              >
                <FiMenu className="h-4 w-4" />
                Menu
              </button>
            </div>

            {isMobileSidebarOpen && (
              <div className="portal-mobile-sidebar-overlay lg:hidden" role="dialog" aria-modal="true">
                <button
                  type="button"
                  className="portal-mobile-sidebar-backdrop"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close navigation menu"
                />
                <div className="portal-mobile-sidebar-sheet">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="portal-sidebar-title !mb-0">Portal Navigation</p>
                    <button
                      type="button"
                      className="portal-sidebar-toggle"
                      onClick={() => setIsMobileSidebarOpen(false)}
                      aria-label="Close navigation menu"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  <Sidebar
                    portalType={portalType}
                    isCompact={false}
                    mobile
                    onNavigate={() => setIsMobileSidebarOpen(false)}
                  />
                </div>
              </div>
            )}

            <div
              className={`grid grid-cols-1 gap-6 ${
                isSidebarCompact
                  ? 'lg:grid-cols-[90px_minmax(0,1fr)]'
                  : 'lg:grid-cols-[260px_minmax(0,1fr)]'
              }`}
            >
              <div className="hidden lg:block">
                <Sidebar
                  portalType={portalType}
                  isCompact={isSidebarCompact}
                  onToggleCompact={() => setIsSidebarCompact((prev) => !prev)}
                />
              </div>
              <div className="space-y-6 min-w-0">{children}</div>
            </div>
          </>
        ) : (
          <div className="space-y-6">{children}</div>
        )}
      </div>
    </div>
  );
}

export function KpiCard({ label, value, icon: Icon, color = 'bg-orange-500', note }) {
  return (
    <article className="dashboard-kpi">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="dashboard-kpi-label">{label}</p>
          <div className="dashboard-kpi-value">{value}</div>
          {note && <p className="dashboard-kpi-note">{note}</p>}
        </div>

        {Icon && (
          <div className={`dashboard-kpi-icon ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </article>
  );
}
