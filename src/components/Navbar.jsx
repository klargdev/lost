import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tribute', to: '/tribute' },
  { name: 'Program', to: '/program' },
  { name: 'Gallery', to: '/gallery' },
  { name: 'Guestbook', to: '/guestbook' },
  { name: 'Donate', to: '/donate' },
];

export default function Navbar() {
  const location = useLocation();
  const navbarRef = useRef(null);

  // Close the navbar when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        // Close the navbar
        if (navbarRef.current && navbarRef.current.contains(event.target)) return;
        document.getElementById("close-navbar-btn").click();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Disclosure as="nav" className="bg-[#040303] bg-opacity-90 text-white shadow-lg sticky top-0 z-50 backdrop-blur-md" ref={navbarRef}>
      {({ open, close }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-xl font-bold text-white">
                    Memorial
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        location.pathname === item.to
                          ? 'text-white border-[#B3541E]'
                          : 'border-transparent text-gray-300 hover:text-white hover:border-[#A13333]'
                      }`}
                      onClick={() => close()}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button
                  id="close-navbar-btn"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-[#461111] hover:text-white"
                >
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`block px-3 py-4 text-base font-medium ${
                    location.pathname === item.to
                      ? 'bg-[#461111] text-white border-l-4 border-[#B3541E]'
                      : 'text-gray-300 hover:bg-[#040303] hover:text-white hover:border-l-4 hover:border-[#A13333]'
                  }`}
                  onClick={() => close()}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
