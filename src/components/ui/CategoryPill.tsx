/**
 * src/components/ui/CategoryPill.tsx
 * 
 * Un bouton cliquable représentant une catégorie de service.
 * Peut être à l'état actif (sélectionné) ou inactif.
 */
import type { ServiceCategory, CategoryInfo } from '@/types';

interface CategoryPillProps {
  category: CategoryInfo;
  isActive?: boolean;
  onClick?: (id: ServiceCategory) => void;
}

export default function CategoryPill({ category, isActive, onClick }: CategoryPillProps) {
  return (
    <button
      className={`category-pill ${isActive ? 'category-pill--active' : ''}`}
      onClick={() => onClick?.(category.id)}
      style={{
        '--pill-color': category.color,
      } as React.CSSProperties}
    >
      <span className="category-pill__icon">{category.icon}</span>
      <span className="category-pill__label">{category.label}</span>
    </button>
  );
}
