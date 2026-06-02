import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { FiUser, FiLogOut, FiHome, FiCalendar, FiVideo, FiTruck, FiMapPin, FiHeart, FiInbox, FiBell, FiMenu } from 'react-icons/fi';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'management':
        return [
          { to: '/admin', label: 'Dashboard', icon: FiHome },
          { to: '/admin/trips', label: 'Trips', icon: FiCalendar },
          { to: '/admin/buses', label: 'Buses', icon: FiTruck },
          { to: '/admin/finance', label: 'Finance', icon: FiCalendar },
          { to: '/admin/videos', label: 'Videos', icon: FiVideo },
        ];
      case 'conductor':
        return [{ to: '/conductor', label: 'Assigned Trips', icon: FiCalendar }];
      case 'editor':
        return [{ to: '/editor', label: 'Videos', icon: FiVideo }];
      default:
        return [
          { to: '/', label: 'Home', icon: FiHome },
          { section: 'more-trips', label: 'Trips', icon: FiCalendar },
          { section: 'featured-trip', label: 'Destination', icon: FiMapPin },
          { section: 'itinerary', label: 'Itinerary', icon: FiCalendar },
          { to: '/dashboard?tab=bookings', label: 'Bookings', icon: FiCalendar },
          { section: 'more-trips', label: 'Favorites', icon: FiHeart },
          { to: '/upload-video', label: 'Upload Video', icon: FiVideo },
        ];
    }
  };

  const navLinks = getNavLinks();

  const openInbox = () => navigate('/dashboard?tab=bookings');
  const openNotifications = () => navigate('/dashboard?tab=profile');
  const openProfile = () => navigate('/dashboard?tab=profile');

  const goToSection = (sectionId) => {
    setMobileOpen(false);

    if (location.pathname === '/') {
      const target = document.getElementById(sectionId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate(`/#${sectionId}`);
  };

  const handleNavClick = (link) => {
    setMobileOpen(false);

    if (link.section) {
      goToSection(link.section);
      return;
    }

    if (link.to) {
      navigate(link.to);
    }
  };

  const toggleMobile = () => setMobileOpen((v) => !v);

  useEffect(() => {
    // lock body scroll when mobile menu open
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const baseLinkClass = (active) =>
    `flex min-h-[2.25rem] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-semibold transition-all duration-200 ${
      active
        ? 'bg-secondary text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.22)] backdrop-blur-md">
      <div className="container mx-auto px-3">
        <div className="grid gap-1.5 py-2 lg:grid-cols-[auto,minmax(0,1fr),auto] items-center">
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <Link to="/" className="flex min-w-0 items-center gap-2 py-1">
              <BrandLogo variant="mark" className="sm:hidden" />
              <BrandLogo variant="full" className="hidden sm:block w-[140px] lg:w-[160px]" />
            </Link>

            <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:inline-flex lg:hidden">
              Travel
            </span>
          </div>

          <div className="hidden items-stretch gap-2 lg:grid lg:grid-cols-7 lg:gap-1 xl:gap-2">
            {navLinks.map((link) => (
              link.section ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => goToSection(link.section)}
                  className={baseLinkClass(false)}
                >
                  <link.icon className="icon" />
                  <span className="leading-none">{link.label}</span>
                </button>
              ) : (
                <Link key={link.to} to={link.to} className={baseLinkClass(isActive(link.to))}>
                  <link.icon className="icon" />
                  <span className="leading-none">{link.label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Mobile: hamburger button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMobile}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="btn-circle h-9 w-9 flex items-center justify-center"
            >
              <FiMenu className="icon text-[18px]" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={openInbox}
              className="btn-icon h-9 w-9 flex items-center justify-center"
              aria-label="Inbox"
              title="Inbox"
            >
              <FiInbox className="icon text-[18px] text-slate-700" />
            </button>

            <button
              type="button"
              onClick={openNotifications}
              className="relative btn-icon h-9 w-9 flex items-center justify-center"
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell className="icon text-[18px] text-slate-700" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
            </button>

            <button
              type="button"
              onClick={openProfile}
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-orange-200 hover:shadow-md md:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                <FiUser className="icon text-[14px]" />
              </div>
              <div className="hidden text-left lg:block">
                <div className="text-sm font-semibold text-slate-900">
                  {user?.name || (user?.role === 'user' ? user?.mobile : user?.role)}
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{user?.role || 'guest'}</div>
              </div>
            </button>

            <Menu as="div" className="relative md:hidden">
              <Menu.Button className="btn-icon h-9 w-9 flex items-center justify-center" aria-label="Profile menu">
                <FiUser className="icon text-[18px] text-slate-700" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl shadow-slate-950/10 backdrop-blur-xl z-50">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard?tab=profile"
                        className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium transition`}
                      >
                        <FiUser className="mr-2 icon" />
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium transition`}
                      >
                        <FiLogOut className="mr-2 icon" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              type="button"
              onClick={logout}
              className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600 hover:shadow-md md:inline-flex"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu panel (overlay) */}
      <Transition
        as={Fragment}
        show={mobileOpen}
        enter="transition ease-out duration-300"
        enterFrom="-translate-y-4 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-4 opacity-0"
      >
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-x-4 top-4 z-50">
            <div ref={mobilePanelRef} className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-2xl">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <BrandLogo variant="mark" />
                    <div className="text-lg font-semibold text-slate-900">Weekend Mojo</div>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
                    ✕
                  </button>
                </div>

                <nav className="mt-4 grid gap-2">
                  {navLinks.map((link) => (
                    link.section ? (
                      <button key={link.label} type="button" onClick={() => handleNavClick(link)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-800 hover:bg-slate-50">
                        <link.icon className="icon text-slate-600" />
                        <span className="font-medium">{link.label}</span>
                      </button>
                    ) : (
                      <Link key={link.to} to={link.to} onClick={() => handleNavClick(link)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-50">
                        <link.icon className="h-5 w-5 text-slate-600" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    )
                  ))}
                </nav>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { openInbox(); setMobileOpen(false); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">
                        <FiInbox className="icon" /> Inbox
                    </button>
                    <button onClick={() => { openNotifications(); setMobileOpen(false); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">
                      <FiBell className="icon" /> Notifications
                    </button>
                  </div>

                  <div className="mt-3">
                    <button onClick={() => { openProfile(); setMobileOpen(false); }} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left">
                      <div className="font-semibold text-slate-900">{user?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{user?.role || 'visitor'}</div>
                    </button>
                  </div>

                  <div className="mt-3">
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full btn-secondary">Logout</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
}