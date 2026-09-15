'use client';

import React from 'react';
import { X } from 'lucide-react';
import { MaterialType, SurfaceType } from '@/types';

export interface FilterState {
  material: MaterialType[];
  surface: SurfaceType[];
  size: string[];
  useCase: string[];
  brand: string[];
  collection: string[];
}

interface CatalogFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (type: keyof FilterState, value: string) => void;
  onClearAll: () => void;
  totalFilteredCount: number;
}

const MATERIAL_OPTIONS: MaterialType[] = ['Marble', 'Stone', 'Cement', 'Wood', 'Terrazzo', 'Solid Color'];
const SURFACE_OPTIONS: SurfaceType[] = ['Matt', 'Polished', 'Textured', 'Honed'];
const SIZE_OPTIONS = ['300x600mm', '600x600mm', '600x1200mm', '800x800mm', '200x1200mm', '800x1600mm'];
const USE_CASE_OPTIONS = ['Phòng khách', 'Phòng tắm', 'Phòng bếp', 'Phòng ngủ', 'Ngoài trời', 'Sảnh', 'Thương mại'];
const BRAND_OPTIONS = ['Monalisa', 'Apodio Grand', 'Changyih Premium', 'Việt Ý SC', 'Thường Sơn'];

export default function CatalogFilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
}: CatalogFilterSidebarProps) {
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <aside className="w-full space-y-8 pr-4">
      {/* Header & Clear all */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D5CDBE]">
        <span className="text-xs uppercase font-mono tracking-widest text-[#1C1B19] font-medium">
          Bộ Lọc Vật Liệu
        </span>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-mono uppercase text-[#B85C38] hover:underline flex items-center gap-1"
          >
            <X size={12} /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Filter: Material */}
      <div>
        <h4 className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] mb-3">
          Chất Liệu ({filters.material.length})
        </h4>
        <div className="space-y-2">
          {MATERIAL_OPTIONS.map((mat) => {
            const checked = filters.material.includes(mat);
            return (
              <label
                key={mat}
                className="flex items-center gap-2.5 text-xs text-[#1C1B19] hover:text-[#B85C38] cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onFilterChange('material', mat)}
                  className="rounded-none border-[#D5CDBE] text-[#1C1B19] focus:ring-[#B85C38] h-3.5 w-3.5 accent-[#1C1B19]"
                />
                <span className={checked ? 'font-medium text-[#1C1B19]' : 'text-[#1C1B19]/80'}>
                  {mat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Filter: Surface */}
      <div>
        <h4 className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] mb-3">
          Bề Mặt ({filters.surface.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SURFACE_OPTIONS.map((surf) => {
            const active = filters.surface.includes(surf);
            return (
              <button
                key={surf}
                onClick={() => onFilterChange('surface', surf)}
                className={`text-xs px-2.5 py-1 border transition-all ${
                  active
                    ? 'bg-[#1C1B19] text-[#F5F1EA] border-[#1C1B19]'
                    : 'bg-white/80 text-[#1C1B19] border-[#D5CDBE] hover:border-[#B85C38]'
                }`}
              >
                {surf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter: Size */}
      <div>
        <h4 className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] mb-3">
          Kích Thước ({filters.size.length})
        </h4>
        <div className="space-y-2">
          {SIZE_OPTIONS.map((size) => {
            const checked = filters.size.includes(size);
            return (
              <label
                key={size}
                className="flex items-center gap-2.5 text-xs text-[#1C1B19] hover:text-[#B85C38] cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onFilterChange('size', size)}
                  className="rounded-none border-[#D5CDBE] text-[#1C1B19] focus:ring-[#B85C38] h-3.5 w-3.5 accent-[#1C1B19]"
                />
                <span className={checked ? 'font-medium text-[#1C1B19]' : 'text-[#1C1B19]/80'}>
                  {size}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Filter: Use Case (Không gian) */}
      <div>
        <h4 className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] mb-3">
          Không Gian Sử Dụng ({filters.useCase.length})
        </h4>
        <div className="space-y-2">
          {USE_CASE_OPTIONS.map((space) => {
            const checked = filters.useCase.includes(space);
            return (
              <label
                key={space}
                className="flex items-center gap-2.5 text-xs text-[#1C1B19] hover:text-[#B85C38] cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onFilterChange('useCase', space)}
                  className="rounded-none border-[#D5CDBE] text-[#1C1B19] focus:ring-[#B85C38] h-3.5 w-3.5 accent-[#1C1B19]"
                />
                <span className={checked ? 'font-medium text-[#1C1B19]' : 'text-[#1C1B19]/80'}>
                  {space}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Filter: Brand */}
      <div>
        <h4 className="text-xs uppercase font-mono tracking-wider text-[#8B7C66] mb-3">
          Thương Hiệu ({filters.brand.length})
        </h4>
        <div className="space-y-2">
          {BRAND_OPTIONS.map((brand) => {
            const checked = filters.brand.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center gap-2.5 text-xs text-[#1C1B19] hover:text-[#B85C38] cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onFilterChange('brand', brand)}
                  className="rounded-none border-[#D5CDBE] text-[#1C1B19] focus:ring-[#B85C38] h-3.5 w-3.5 accent-[#1C1B19]"
                />
                <span className={checked ? 'font-medium text-[#1C1B19]' : 'text-[#1C1B19]/80'}>
                  {brand}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
