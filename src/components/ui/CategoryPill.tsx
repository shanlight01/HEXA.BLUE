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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap select-none ${
        isActive
          ? 'text-white shadow-md scale-105'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:scale-105 hover:shadow-sm'
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
