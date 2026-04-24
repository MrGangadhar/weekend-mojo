import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiUser, FiLogOut, FiHome, FiCalendar, FiVideo, FiTruck } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

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
        return [
          { to: '/conductor', label: 'Assigned Trips', icon: FiCalendar },
        ];
      case 'editor':
        return [
          { to: '/editor', label: 'Videos', icon: FiVideo },
        ];
      default:
        return [
          { to: '/', label: 'Home', icon: FiHome },
          { to: '/dashboard', label: 'My Bookings', icon: FiCalendar },
          { to: '/upload-video', label: 'Upload Video', icon: FiVideo },
        ];
    }
  };
  
  const navLinks = getNavLinks();
  
  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/90 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-18 items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white shadow-lg shadow-orange-500/25">
              WM
            </span>
            <span className="text-xl font-semibold tracking-tight text-slate-900">Weekend Mojo</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
          
          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-orange-200 hover:shadow-md focus:outline-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                <FiUser />
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-semibold text-slate-900">
                  {user?.name || (user?.role === 'user' ? user?.mobile : user?.role)}
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{user?.role || 'guest'}</div>
              </div>
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
              <Menu.Items className="absolute right-0 mt-3 w-52 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl shadow-slate-950/10 backdrop-blur-xl z-50">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium transition`}
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </nav>
  );
}