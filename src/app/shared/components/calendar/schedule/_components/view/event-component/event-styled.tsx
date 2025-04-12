'use client';

import { CalendarIcon, ClockIcon } from 'lucide-react';
import React from 'react';

import CustomModal from '@/app/shared/components/ui/custom-modal';
import { cn } from '@/app/shared/lib/utils';

import { useModal } from '../../../../providers/modal-context';
import type { CustomEventModal, Event } from '../../../../types';
import AddEventModal from '../../../_modals/add-event-modal';

// Function to format date
const formatDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

// Function to format time only
const formatTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

// Color variants based on event type
const variantColors = {
  primary: {
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  danger: {
    bg: 'bg-red-100',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  success: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  warning: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
  },
};

interface EventStyledProps extends Event {
  minmized?: boolean;
  CustomEventComponent?: React.FC<Event>;
}

export default function EventStyled({
  event,
  // onDelete,
  CustomEventModal,
}: {
  event: EventStyledProps;
  CustomEventModal?: CustomEventModal;
  onDelete?: (id: string) => void;
}) {
  const { setOpen } = useModal();
  // const { handlers } = useScheduler();

  // Determine if delete button should be shown
  // Hide it for minimized events to save space, show on hover instead
  // const _shouldShowDeleteButton = !event?.minmized;

  // Handler function
  function handleEditEvent(event: Event) {
    // Open the modal with the content
    setOpen(
      <CustomModal title="Edit Event">
        <AddEventModal CustomAddEventModal={CustomEventModal?.CustomAddEventModal?.CustomForm} />
      </CustomModal>,
      async () => {
        return {
          ...event,
        };
      },
    );
  }

  // Get background color class based on variant
  const getBackgroundColor = (variant: string | undefined) => {
    const variantKey = (variant as keyof typeof variantColors) || 'primary';
    const colors = variantColors[variantKey] || variantColors.primary;
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  return (
    <div
      key={event?.id}
      className={cn(
        'w-full z-50 relative cursor-pointer border group rounded-lg flex flex-col flex-grow shadow-sm hover:shadow-md transition-shadow duration-200',
        event?.minmized ? 'border-transparent' : 'border-default-400/60',
      )}
    >
      {event.CustomEventComponent ? (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
            });
          }}
        >
          <event.CustomEventComponent {...event} />
        </div>
      ) : (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
            });
          }}
          className={cn(
            'w-full p-2 rounded',
            getBackgroundColor(event?.variant),
            event?.minmized ? 'flex-grow overflow-hidden' : 'min-h-fit',
          )}
        >
          <div className="flex h-full flex-col">
            <div className="mb-1 truncate text-xs font-semibold">{event?.title || 'Untitled Event'}</div>

            {/* Show time in minimized mode */}
            {event?.minmized && <div className="text-[10px] opacity-80">{formatTime(event?.startDate)}</div>}

            {!event?.minmized && event?.description && <div className="my-2 text-sm">{event?.description}</div>}

            {!event?.minmized && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 size-3" />
                  {formatDate(event?.startDate)}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="mr-1 size-3" />
                  {formatDate(event?.endDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
