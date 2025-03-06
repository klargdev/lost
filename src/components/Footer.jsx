import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[[rgb(73, 74, 143)] border-t mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-sm text-[rgb(73, 74, 143)] ">
            &copy; {new Date().getFullYear()} Memorial Tribute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}