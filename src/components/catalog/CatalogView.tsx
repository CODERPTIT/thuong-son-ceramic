'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Grid3X3, LayoutGrid } from 'lucide-react';
import CatalogFilterSidebar, { FilterState } from '@/components/catalog/CatalogFilterSidebar';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS } from '@/data/mockData';
import { MaterialType, SurfaceType } from '@/types';

type SortOption = 'featured' | 'newest' | 'name-asc';

export default function CatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filters from search params
  const [filters, setFilters] = useState<FilterState>(() => {
    const mat = searchParams.getAll('material') as MaterialType[];
    const surf = searchParams.getAll('surface') as SurfaceType[];
    const sz = searchParams.getAll('size');
    const uc = searchParams.getAll('useCase');
    const br = searchParams.getAll('brand');
    const col = searchParams.getAll('collection');
    return {
      material: mat,
      surface: surf,
      size: sz,
      useCase: uc,
      brand: br,
      collection: col,
    };
  });

  const [sort, setSort] = useState<SortOption>('featured');
  const [columns, setColumns] = useState<3 | 4>(4);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    newFilters.material.forEach(m => params.append('material', m));
    newFilters.surface.forEach(s => params.append('surface', s));
    newFilters.size.forEach(sz => params.append('size', sz));
    newFilters.useCase.forEach(u => params.append('useCase', u));
    newFilters.brand.forEach(b => params.append('brand', b));
    newFilters.collection.forEach(c => params.append('collection', c));

    const q = searchParams.get('q') || searchParams.get('search');
    if (q) params.set('q', q);

    const queryString = params.toString();
    router.replace(`/catalog${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  // Handle single filter toggle
  const handleFilterChange = (type: keyof FilterState, value: string) => {
    setVisibleCount(24);
    setFilters(prev => {
      const currentList = prev[type] as string[];
      const exists = currentList.includes(value);
      const updatedList = exists
        ? currentList.filter(item => item !== value)
        : [...currentList, value];

      const newFilters = { ...prev, [type]: updatedList };
      updateUrlParams(newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setVisibleCount(24);
    const resetFilters: FilterState = {
      material: [],
      surface: [],
      size: [],
      useCase: [],
      brand: [],
      collection: [],
    };
    setFilters(resetFilters);
    updateUrlParams(resetFilters);
  };

  // Filter & Sort Logic
  const searchQuery = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Search query filter
    if (searchQuery) {
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.code.toLowerCase().includes(searchQuery) ||
          p.material.toLowerCase().includes(searchQuery) ||
          p.brand.toLowerCase().includes(searchQuery)
      );
    }

    // Filter by Material
    if (filters.material.length > 0) {
      result = result.filter(p => filters.material.includes(p.material));
    }

    // Filter by Surface
    if (filters.surface.length > 0) {
      result = result.filter(p => filters.surface.includes(p.surface));
    }

    // Filter by Size
    if (filters.size.length > 0) {
      result = result.filter(p => p.sizes.some(s => filters.size.includes(s)));
    }

    // Filter by UseCase
    if (filters.useCase.length > 0) {
      result = result.filter(p => p.useCases.some(u => filters.useCase.includes(u)));
    }

    // Filter by Brand
    if (filters.brand.length > 0) {
      result = result.filter(p => filters.brand.includes(p.brand));
    }

    // Filter by Collection
    if (filters.collection.length > 0) {
      result = result.filter(p => filters.collection.includes(p.collection));
    }

    // Sort
    if (sort === 'newest') {
      result.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
    } else if (sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else {
      // featured
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [filters, searchQuery, sort]);

  // Extract all active filter chips for display
  const activeChips = useMemo(() => {
    const chips: { type: keyof FilterState; value: string }[] = [];
    Object.entries(filters).forEach(([key, arr]) => {
      (arr as string[]).forEach(val => {
        chips.push({ type: key as keyof FilterState, value: val });
      });
    });
    return chips;
  }, [filters]);

  // Lock scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileFilterOpen]);

  return (
    <div className="py-10 md:py-16 bg-[#F5F1EA]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
        {/* Page Breadcrumb & Title */}
        <div className="mb-10 pb-6 border-b border-[#D5CDBE]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8B7C66] mb-3">
            <span>Trang chủ</span>
            <span>/</span>
            <span className="text-[#1C1B19]">Catalog Sản Phẩm</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#1C1B19]">
            Catalog Vật Liệu Kiến Trúc
          </h1>
          <p className="text-sm text-[#8B7C66] mt-2 max-w-2xl font-light">
            Tuyển tập 590+ mẫu gạch ốp lát cẩm thạch, đá tự nhiên, xi măng và gỗ porcelain chính hãng từ các thương hiệu Apodio Grand, Monalisa, Changyih, Việt Ý SC và Thường Sơn.
          </p>
        </div>

        {/* Top Control Bar: Total Count, Chips, Sort, Grid toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-[#D5CDBE]">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden btn btn-bone text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Filter size={13} /> Bộ Lọc ({activeChips.length})
            </button>

            <span className="text-xs font-mono uppercase tracking-widest text-[#8B7C66]">
              Hiển thị <strong>{filteredProducts.length}</strong> mẫu
            </span>

            {searchQuery && (
              <span className="text-xs font-mono bg-white border border-[#D5CDBE] px-2.5 py-1 text-[#1C1B19]">
                Từ khóa: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {/* Controls: Sort and Column Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs font-mono w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[#8B7C66] uppercase tracking-wider text-[11px] sm:text-xs">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                aria-label="Sắp xếp sản phẩm"
                className="bg-white border border-[#D5CDBE] text-[#1C1B19] py-1.5 px-3 text-xs focus:outline-none focus:border-[#B85C38]"
              >
                <option value="featured">Nổi Bật (Tuyển Chọn)</option>
                <option value="newest">Mới Nhất</option>
                <option value="name-asc">Tên (A - Z)</option>
              </select>
            </div>

            {/* Desktop Column Toggle */}
            <div className="hidden sm:flex items-center border border-[#D5CDBE] bg-white p-0.5">
              <button
                onClick={() => setColumns(3)}
                aria-label="Lưới 3 cột"
                className={`p-1.5 transition-colors ${columns === 3 ? 'bg-[#1C1B19] text-[#F5F1EA]' : 'text-[#8B7C66] hover:text-[#1C1B19]'}`}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setColumns(4)}
                aria-label="Lưới 4 cột"
                className={`p-1.5 transition-colors ${columns === 4 ? 'bg-[#1C1B19] text-[#F5F1EA]' : 'text-[#8B7C66] hover:text-[#1C1B19]'}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-white/70 border border-[#D5CDBE]">
            <span className="text-[11px] font-mono text-[#8B7C66] uppercase mr-2">Đang lọc:</span>
            {activeChips.map((chip) => (
              <span
                key={`${chip.type}-${chip.value}`}
                className="inline-flex items-center gap-1.5 text-xs bg-[#FAF8F4] border border-[#D5CDBE] px-2.5 py-1 text-[#1C1B19]"
              >
                <span>{chip.value}</span>
                <button
                  onClick={() => handleFilterChange(chip.type, chip.value)}
                  aria-label={`Bỏ lọc ${chip.value}`}
                  className="hover:text-[#B85C38]"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearAll}
              className="text-[11px] font-mono uppercase text-[#B85C38] hover:underline ml-auto pl-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Main 2-Column Layout (Sidebar Left + Grid Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Desktop Filter Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28 bg-[#FAF8F4] border border-[#D5CDBE] p-6">
            <CatalogFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              totalFilteredCount={filteredProducts.length}
            />
          </div>

          {/* Product Grid Area (9 cols) */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white/60 border border-[#D5CDBE] p-8">
                <h3 className="font-serif text-2xl font-light text-[#1C1B19] mb-2">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-sm text-[#8B7C66] max-w-md mx-auto mb-6">
                  Hãy thử gỡ bớt các điều kiện lọc hoặc liên hệ trực tiếp với chuyên viên Thường Sơn để tìm mã tương đương.
                </p>
                <button
                  onClick={handleClearAll}
                  className="btn btn-ink text-xs"
                >
                  Xóa Toàn Bộ Bộ Lọc
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 sm:grid-cols-2 ${
                    columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                  } gap-3 sm:gap-6`}
                >
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="pt-12 text-center border-t border-[#D5CDBE]/60 mt-12">
                    <p className="text-xs font-mono text-[#8B7C66] mb-4">
                      Đang hiển thị {Math.min(visibleCount, filteredProducts.length)} trên tổng số {filteredProducts.length} mẫu gạch tuyển chọn
                    </p>
                    <button
                      onClick={() => setVisibleCount(prev => prev + 24)}
                      className="btn btn-clay text-xs px-8 py-3.5"
                    >
                      Xem Thêm Mẫu Gạch (+24)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer (Fullscreen Sheet) */}
      {mobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1C1B19]/80 backdrop-blur-sm flex justify-end"
        >
          <div className="w-full max-w-md bg-[#F5F1EA] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#D5CDBE] mb-6">
                <span className="font-serif text-xl text-[#1C1B19]">Bộ Lọc Vật Liệu</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Đóng bộ lọc"
                  className="p-1 text-[#1C1B19] hover:text-[#B85C38]"
                >
                  <X size={22} />
                </button>
              </div>

              <CatalogFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                totalFilteredCount={filteredProducts.length}
              />
            </div>

            <div className="pt-6 border-t border-[#D5CDBE] mt-8 sticky bottom-0 bg-[#F5F1EA]">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-ink w-full py-3.5 text-xs text-center"
              >
                Xem {filteredProducts.length} Mẫu Kết Quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
