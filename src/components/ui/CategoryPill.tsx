'use client';

/**
 * src/components/ui/CategoryPill.tsx
 *
 * Bouton de catégorie avec icône Lucide et animation de sélection.
 */
import {
  Scissors,
  Wrench,
  Zap,
  Hammer,
  Shirt,
  Settings2,
  Monitor,
  UtensilsCrossed,
  Sparkles,
  Layers,
  Palette,
  Leaf,
} from 'lucide-react';
import type { ServiceCategory, CategoryInfo } from '@/types';

const CATEGORY_ICONS: Record<ServiceCategory, React.ElementType> = {
  coiffure:    Scissors,
  plomberie:   Wrench,
  electricite: Zap,
  menuiserie:  Hammer,
  couture:     Shirt,
  mecanique:   Settings2,
  informatique: Monitor,
  cuisine:     UtensilsCrossed,
  menage:      Sparkles,
  maconnerie:  Layers,
  peinture:    Palette,
  jardinage:   Leaf,
};

interface CategoryPillProps {
  category: CategoryInfo;
  isActive?: boolean;
  onClick?: (id: ServiceCategory) => void;
}

export default function CategoryPill({ category, isActive, onClick }: CategoryPillProps) {
  const Icon = CATEGORY_ICONS[category.id] ?? Sparkles;

  return (
    <button
      id={`category-${category.id}`}
      onClick={() => onClick?.(category.id)}
      className={`inline-flex items-center justify-center gap-2 px-[18px] py-[8px] rounded-full text-[14px] font-medium transition-all duration-200 whitespace-nowrap select-none shadow-sm ${
        isActive
          ? 'text-white'
          : 'bg-white text-[#4a5568] border border-[#e2e8f0] hover:bg-[#f7fafc] hover:border-[#cbd5e0] hover:-translate-y-[1px]'
      }`}
      style={
        isActive
          ? { background: category.color, borderColor: category.color, boxShadow: `0 4px 14px ${category.color}55` }
          : {}
      }
    >
      <Icon
        className="w-4 h-4 shrink-0"
        style={{ color: isActive ? '#fff' : category.color }}
      />
      <span>{category.label}</span>
    </button>
  );
}
