'use client';

import { ReactNode } from 'react';

interface DrawerProps {
  title?: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  trigger?: ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export default function Drawer({
  title = 'Menu',
  children,
  isOpen,
  onClose,
  trigger,
  position = 'left',
  size = 'md',
}: DrawerProps) {
  const getWidthClass = () => {
    switch (size) {
      case 'lg':
        return 'w-3/4';
      case 'md':
        return 'w-2/4';
      case 'sm':
        return 'w-1/4';
      default:
        return 'w-2/4';
    }
  };

  return (
    <div>
      {trigger && <div className="inline-block">{trigger}</div>}

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-100/75 z-[1044] transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed bottom-0 ${position === 'left' ? 'left-0' : 'right-0'} top-0 z-[1045] flex ${getWidthClass()} max-w-full flex-col border-none bg-white bg-clip-padding text-neutral-700 shadow-sm outline-none transition duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h5 className="mb-0 font-semibold leading-normal" id="drawer-title">
            {title}
          </h5>
          <button
            type="button"
            className="box-content rounded-none border-none text-neutral-500 hover:text-neutral-800 hover:no-underline focus:text-neutral-800 focus:opacity-100 focus:shadow-none focus:outline-none"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <span className="[&>svg]:h-6 [&>svg]:w-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
