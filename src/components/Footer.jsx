import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#040303] border-t border-[#461111] mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Memorial Tribute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}