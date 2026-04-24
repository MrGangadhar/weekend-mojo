export function PublicPageShell({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <div className={`portal-shell ${className}`}>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <section className="dashboard-hero mb-6 lg:mb-8">
          <div className="max-w-4xl space-y-3">
            {eyebrow && <p className="dashboard-eyebrow">{eyebrow}</p>}
            <h1 className="dashboard-title">{title}</h1>
            {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
          </div>
        </section>

        {children}
      </div>
    </div>
  );
}