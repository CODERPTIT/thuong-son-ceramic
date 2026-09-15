import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  collapsed?: boolean;
  onClick?: () => void;
}

export default function BrandLogo({ className = '', variant = 'dark', collapsed = false, onClick }: BrandLogoProps) {
  const isDark = variant === 'dark';
  const textColor = isDark ? 'text-[#1C1B19]' : 'text-[#F5F1EA]';
  const tagColor = isDark ? 'text-[#8B7C66]' : 'text-[#D7CEBE]';

  return (
    <Link href="/" onClick={onClick} className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Monogram Emblem "TS" (Thường Sơn) */}
      <div className="relative w-9 h-9 md:w-10 md:h-10 bg-[#1C1B19] text-[#F5F1EA] flex items-center justify-center border border-[#B85C38]/40 shadow-sm shrink-0">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-[#F5F1EA] group-hover:text-[#B85C38] transition-colors"
        >
          {/* Stylized geometric T and S monogram */}
          {/* T bar */}
          <line x1="6" y1="10" x2="34" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
          <line x1="20" y1="10" x2="20" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
          {/* S curve interlock */}
          <path
            d="M28 14C24 13 14 14 14 20C14 26 26 25 26 30C26 33 21 34 16 33"
            stroke="#B85C38"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <span className={`font-serif text-lg md:text-xl font-medium tracking-tight ${textColor} group-hover:text-[#B85C38] transition-colors leading-none`}>
            THƯỜNG SƠN
          </span>
          <span className={`text-[9px] uppercase font-mono tracking-[0.22em] ${tagColor} mt-1`}>
            Ceramic &amp; Surface Atelier
          </span>
        </div>
      )}
    </Link>
  );
}
