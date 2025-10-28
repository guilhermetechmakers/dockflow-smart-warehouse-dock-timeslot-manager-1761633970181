import React from 'react';
import { cn } from '@/lib/utils';
import { useDragDrop } from './DragDropProvider';
import { Plus, Clock } from 'lucide-react';

interface DropZoneProps {
  slotId: string;
  onDrop?: (slotId: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function DropZone({ slotId, onDrop, className, children }: DropZoneProps) {
  const { draggedBooking, draggedSlot, dragOverSlot, setDragOverSlot, onBookingDrop, onSlotDrop } = useDragDrop();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedBooking) {
      onBookingDrop(draggedBooking, slotId);
    } else if (draggedSlot) {
      onSlotDrop(draggedSlot, slotId);
    }
    
    onDrop?.(slotId);
    setDragOverSlot(null);
  };

  const isDragOver = dragOverSlot === slotId;
  const hasDraggedItem = draggedBooking || draggedSlot;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "min-h-[100px] rounded-lg border-2 border-dashed transition-all duration-200",
        isDragOver && hasDraggedItem
          ? "border-coral-500 bg-coral-50 scale-105"
          : "border-gray-300 hover:border-gray-400",
        className
      )}
    >
      {children || (
        <div className={cn(
          "flex items-center justify-center h-full p-4 text-center",
          isDragOver && hasDraggedItem ? "text-coral-600" : "text-gray-500"
        )}>
          <div className="space-y-2">
            {isDragOver && hasDraggedItem ? (
              <>
                <Clock className="h-8 w-8 mx-auto text-coral-500" />
                <p className="text-sm font-medium">Drop here to reschedule</p>
              </>
            ) : (
              <>
                <Plus className="h-8 w-8 mx-auto" />
                <p className="text-sm">Drop booking here</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}