import React from 'react';
import HeroSection from '@/components/hero/HeroSection';
import MaterialIntroSection from '@/components/sections/MaterialIntroSection';
import MaterialTypesSection from '@/components/sections/MaterialTypesSection';
import ShopBySpaceSection from '@/components/sections/ShopBySpaceSection';
import FeaturedCollectionSection from '@/components/sections/FeaturedCollectionSection';
import SelectedProductsSection from '@/components/sections/SelectedProductsSection';
import MaterialFinderSection from '@/components/material-finder/MaterialFinderSection';
import EditorialStorySection from '@/components/sections/EditorialStorySection';
import BathroomSolutionsSection from '@/components/sections/BathroomSolutionsSection';
import DigitalShowroomZaloSection from '@/components/sections/DigitalShowroomZaloSection';
import JournalPreviewSection from '@/components/sections/JournalPreviewSection';
import ShowroomSection from '@/components/showroom/ShowroomSection';

export default function HomePage() {
  return (
    <>
      {/* SECTION 1 — HERO */}
      <HeroSection />

      {/* SECTION 2 — MATERIAL INTRO */}
      <MaterialIntroSection />

      {/* SECTION 3 — MATERIAL TYPES */}
      <MaterialTypesSection />

      {/* SECTION 4 — SHOP BY SPACE */}
      <ShopBySpaceSection />

      {/* SECTION 5 — FEATURED COLLECTION */}
      <FeaturedCollectionSection />

      {/* SECTION 6 — SELECTED PRODUCTS */}
      <SelectedProductsSection />

      {/* SECTION 7 — MATERIAL FINDER */}
      <MaterialFinderSection />

      {/* SECTION 8 — EDITORIAL / ARCHITECTURE */}
      <EditorialStorySection />

      {/* SECTION 9 — BATHROOM SOLUTIONS */}
      <BathroomSolutionsSection />

      {/* SECTION 10 — DIGITAL SHOWROOM / ZALO */}
      <DigitalShowroomZaloSection />

      {/* SECTION 11 — JOURNAL / CẨM NANG */}
      <JournalPreviewSection />

      {/* SECTION 12 — SHOWROOM */}
      <ShowroomSection />
    </>
  );
}
