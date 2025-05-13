'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { NotificationIcon, LogoutIcon, PaymentIcon, UserIcon } from '@/app/components/icons';

export default function DashboardNavBar() {
  const title = process.env.NEXT_PUBLIC_TITLE || 'Eventos Now';
  const [companyName, setCompanyName] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchCompanyName = useCallback(async () => {
    const res = await fetch('/api/dashboard/me');
    const data = await res.json();
    if (data.success && data.company && data.company.name) {
      setCompanyName(data.company.name);
    } else {
      setCompanyName(null);
    }
  }, []);

  useEffect(() => {
    fetchCompanyName();
  }, [fetchCompanyName]);

  const initial = useMemo(
    () => (companyName ? companyName?.[0]?.toUpperCase() : '-'),
    [companyName]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const navLinks = [{ label: 'Eventos', href: '/dashboard/event' }];

  const profileMenuItems = [
    {
      label: 'Dados Cadastrais',
      href: '#',
      icon: <UserIcon size={20} color="#374151" />,
      as: 'a',
    },
    {
      label: 'Pagamentos',
      href: '#',
      icon: <PaymentIcon size={20} color="#374151" />,
      as: 'a',
    },
    {
      label: 'Sair',
      onClick: handleLogout,
      icon: <LogoutIcon size={20} color="#374151" />,
      as: 'button',
    },
  ];

  return (
    <nav className="relative bg-white shadow">
      <div className="container px-6 py-4 mx-auto">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center justify-between">
            <a href="/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
              <span className="ml-2 text-lg font-bold">{title}</span>
            </a>

            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(prev => !prev)}
                type="button"
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label="toggle menu"
              >
                {!isOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            className={`absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center ${
              isOpen
                ? 'translate-x-0 opacity-100'
                : 'opacity-0 -translate-x-full pointer-events-none lg:pointer-events-auto'
            }`}
          >
            <div className="flex flex-col -mx-6 lg:flex-row lg:items-center lg:mx-8">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 mx-3 mt-2 text-gray-700 transition-colors duration-300 transform rounded-md lg:mt-0 hover:bg-gray-100"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center mt-4 lg:mt-0 relative" ref={profileMenuRef}>
              <button
                className="hidden mx-4 text-gray-600 transition-colors duration-300 transform lg:block hover:text-gray-700 focus:text-gray-700 focus:outline-none"
                aria-label="show notifications"
              >
                <NotificationIcon size={28} color="#4B5563" />
              </button>

              <button
                type="button"
                className="flex items-center focus:outline-none"
                aria-label="toggle profile dropdown"
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
              >
                <div className="w-8 h-8 overflow-hidden border-2 border-gray-400 rounded-full flex items-center justify-center bg-gray-200">
                  <span className="text-lg font-bold text-gray-700">{initial}</span>
                </div>
                <h3 className="mx-2 text-gray-700 lg:hidden">{companyName}</h3>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30 min-w-max">
                  {profileMenuItems.map(item =>
                    item.as === 'a' ? (
                      <a
                        key={item.label}
                        href={item.href}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    ) : (
                      <button
                        key={item.label}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
                        onClick={item.onClick}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
