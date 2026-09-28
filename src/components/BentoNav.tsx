import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  BookText, BrainCircuit, Pill, BarChart3, Lightbulb,
  ShieldAlert, Activity, ChevronRight
} from 'lucide-react';

export type TileSize = 'sm' | 'md' | 'lg' | 'wide' | 'tall';

export interface BentoTile {
  id: string;
  size: TileSize;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent?: string;
  count?: string | number;
  adminOnly?: boolean;
}

interface BentoNavProps {
  tiles: BentoTile[];
  activeId: string;
  onSelect: (id: string) => void;
  isAdmin?: boolean;
}

const sizeClasses: Record<TileSize, string> = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-1 row-span-2',
  lg: 'col-span-2 row-span-2',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-2',
};

const BentoNav: React.FC<BentoNavProps> = ({ tiles, activeId, onSelect, isAdmin }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleTileClick = useCallback((id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      onSelect(id);
    } else if (expandedId) {
      setExpandedId(null);
      onSelect(id);
    } else {
      onSelect(id);
    }
  }, [expandedId, onSelect]);

  const filteredTiles = tiles.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 auto-rows-[80px] md:auto-rows-[90px] gap-2 md:gap-3">
      {filteredTiles.map((tile) => {
        const isActive = activeId === tile.id;
        const isExpanded = expandedId === tile.id;

        return (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            className={cn(
              sizeClasses[tile.size],
              'group relative flex flex-col justify-between p-3 md:p-4 rounded-lg border transition-all duration-200 text-left',
              'hover:scale-[1.02] active:scale-[0.98]',
              isActive
                ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                : 'bg-card border-border hover:border-primary/20 hover:bg-muted/50',
              isExpanded && 'ring-2 ring-primary/40'
            )}
          >
            {/* Top row: icon + count */}
            <div className="flex items-start justify-between">
              <div className={cn(
                'p-1.5 rounded-md transition-colors',
                isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {tile.icon}
              </div>
              {tile.count !== undefined && (
                <span className={cn(
                  'text-[10px] font-semibold tabular-nums',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {tile.count}
                </span>
              )}
            </div>

            {/* Bottom: title + description */}
            <div className="space-y-0.5">
              <h3 className={cn(
                'text-xs md:text-sm font-semibold leading-tight transition-colors',
                isActive ? 'text-primary' : 'text-foreground'
              )}>
                {tile.title}
              </h3>
              {(tile.size !== 'sm') && (
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight line-clamp-2">
                  {tile.description}
                </p>
              )}
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}

            {/* Expand hint on hover */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BentoNav;