import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion'; // Import Framer Motion
import { ArrowLeft, ArrowRight, ChevronLeft, Maximize } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/app/shared/components/ui/badge';
import { Button } from '@/app/shared/components/ui/button';
import CustomModal from '@/app/shared/components/ui/custom-modal';
import { useSchedulerStore } from '@/app/shared/stores/study-schedule.store';
import {
  getDayName,
  getDaysInWeek,
  getEventsForDay,
  getWeekNumber,
  handleEventStyling,
} from '@/app/shared/utils/study-schedule.getter';

import { useModal } from '../../../../providers/modal-context';
import type { CustomEventModal, Event } from '../../../../types';
import EventStyled from '../event-component/event-styled';

const hours = Array.from({ length: 16 }, (_, i) => {
  const hour24 = i + 6;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  return `${hour12}:00 ${ampm}`;
});

// interface ChipData {
//   id: number;
//   color: 'primary' | 'warning' | 'danger';
//   title: string;
//   description: string;
// }

// const chipData: ChipData[] = [
//   {
//     id: 1,
//     color: 'primary',
//     title: 'Ads Campaign Nr1',
//     description: 'Day 1 of 5: Google Ads, Target Audience: SMB-Alpha',
//   },
//   {
//     id: 2,
//     color: 'warning',
//     title: 'Ads Campaign Nr2',
//     description: 'All Day: Day 2 of 5: AdSense + FB, Target Audience: SMB2-Delta3',
//   },
//   {
//     id: 3,
//     color: 'danger',
//     title: 'Critical Campaign Nr3',
//     description: 'Day 3 of 5: High-Impact Ads, Target: E-Commerce Gamma',
//   },
//   {
//     id: 4,
//     color: 'primary',
//     title: 'Ads Campaign Nr4',
//     description: 'Day 4 of 5: FB Ads, Audience: Retailers-Zeta',
//   },
//   {
//     id: 5,
//     color: 'warning',
//     title: 'Campaign Ending Soon',
//     description: 'Final Day: Monitor closely, Audience: Delta2-Beta',
//   },
// ];

// Animation Variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1, // Stagger children animations
//     },
//   },
// };

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

const pageTransitionVariants = {
  enter: (_direction: number) => ({
    opacity: 0,
  }),
  center: {
    opacity: 1,
  },
  exit: (_direction: number) => ({
    opacity: 0,
    transition: {
      opacity: { duration: 0.2, ease: 'easeInOut' },
    },
  }),
};

export default function WeeklyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  classNames,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  // const { getters, handlers } = useScheduler();
  // const addEvent = useSchedulerStore((state) => state.addEvent);
  const events = useSchedulerStore((state) => state.events);
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  // const [detailedHour, setDetailedHour] = useState<string | null>(null);
  // const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [colWidth, setColWidth] = useState<number[]>(Array(7).fill(1));
  // const [isResizing, setIsResizing] = useState<boolean>(false);
  const isResizing = false;
  const [direction, setDirection] = useState<number>(0);
  const { setOpen } = useModal();

  const daysOfWeek = getDaysInWeek(getWeekNumber(currentDate), currentDate.getFullYear());

  // Reset column widths when the date changes
  useEffect(() => {
    setColWidth(Array(7).fill(1));
  }, [currentDate]);

  // const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   if (!hoursColumnRef.current) return;
  //   const rect = hoursColumnRef.current.getBoundingClientRect();
  //   const y = e.clientY - rect.top;
  //   const hourHeight = rect.height / 24;
  //   const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
  //   const minuteFraction = (y % hourHeight) / hourHeight;
  //   const minutes = Math.floor(minuteFraction * 60);

  //   // Format in 12-hour format
  //   const hour12 = hour % 12 || 12;
  //   const ampm = hour < 12 ? 'AM' : 'PM';
  //   setDetailedHour(`${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`);

  //   // Ensure timelinePosition is never negative and is within bounds
  //   // 83px offset accounts for the header height
  //   const headerOffset = 83;
  //   const position = Math.max(0, Math.min(rect.height, Math.round(y))) + headerOffset;
  //   setTimelinePosition(position);
  // }, []);

  // function handleAddEvent(event?: Event) {
  //   // Create the modal content with the provided event data or defaults
  //   const startDate = event?.startDate || new Date();
  //   const endDate = event?.endDate || new Date();

  //   // Open the modal with the content
  //   setOpen(
  //     <CustomModal title="Add Event">
  //       <AddEventModal CustomAddEventModal={CustomEventModal?.CustomAddEventModal?.CustomForm} />
  //     </CustomModal>,
  //     async () => {
  //       return {
  //         ...event,
  //         startDate,
  //         endDate,
  //       };
  //     },
  //   );
  // }

  const handleNextWeek = useCallback(() => {
    setDirection(1);
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  }, [currentDate]);

  const handlePrevWeek = useCallback(() => {
    setDirection(-1);
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  }, [currentDate]);

  // function handleAddEventWeek(dayIndex: number, detailedHour: string) {
  //   if (!detailedHour) {
  //     console.error('Detailed hour not provided.');
  //     return;
  //   }

  //   // Parse the 12-hour format time
  //   const [timePart, ampm] = detailedHour.split(' ');
  //   const [hourStr, minuteStr] = timePart.split(':');
  //   let hours = parseInt(hourStr);
  //   const minutes = parseInt(minuteStr);

  //   // Convert to 24-hour format for Date object
  //   if (ampm === 'PM' && hours < 12) {
  //     hours += 12;
  //   } else if (ampm === 'AM' && hours === 12) {
  //     hours = 0;
  //   }

  //   const chosenDay = daysOfWeek[dayIndex % 7].getDate();

  //   // Ensure day is valid
  //   if (chosenDay < 1 || chosenDay > 31) {
  //     console.error('Invalid day selected:', chosenDay);
  //     return;
  //   }

  //   const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), chosenDay, hours, minutes);

  //   handleAddEvent({
  //     startDate: date,
  //     endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1-hour duration
  //     title: '',
  //     id: '',
  //     variant: 'primary',
  //   });

  //   addEvent({
  //     startDate: date,
  //     endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1-hour duration
  //     title: '',
  //     id: '',
  //     variant: 'primary',
  //   });
  // }

  // Group events by time period to prevent splitting spaces within same time blocks
  const groupEventsByTimePeriod = (events: Event[] | undefined) => {
    if (!events || events.length === 0) return [];

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Precise time overlap checking function
    const eventsOverlap = (event1: Event, event2: Event) => {
      const start1 = new Date(event1.startDate).getTime();
      const end1 = new Date(event1.endDate).getTime();
      const start2 = new Date(event2.startDate).getTime();
      const end2 = new Date(event2.endDate).getTime();

      // Strict time overlap - one event starts before the other ends
      return start1 < end2 && start2 < end1;
    };

    // First, create a graph where events are vertices and edges represent overlaps
    const graph: Record<string, Set<string>> = {};

    // Initialize graph
    for (const event of sortedEvents) {
      graph[event.id] = new Set<string>();
    }

    // Build connections - only connect events that truly overlap in time
    for (let i = 0; i < sortedEvents.length; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        // Only consider events that actually overlap in time
        if (eventsOverlap(sortedEvents[i], sortedEvents[j])) {
          graph[sortedEvents[i].id].add(sortedEvents[j].id);
          graph[sortedEvents[j].id].add(sortedEvents[i].id);
        }
      }
    }

    // Use DFS to find connected components (groups of overlapping events)
    const visited = new Set<string>();
    const groups: Event[][] = [];

    for (const event of sortedEvents) {
      if (!visited.has(event.id)) {
        // Start a new component/group
        const group: Event[] = [];
        const stack: Event[] = [event];
        visited.add(event.id);

        // DFS traversal
        while (stack.length > 0) {
          const current = stack.pop()!;
          group.push(current);

          // Visit neighbors (overlapping events)
          for (const neighborId of graph[current.id]) {
            if (!visited.has(neighborId)) {
              const neighbor = sortedEvents.find((e) => e.id === neighborId);
              if (neighbor) {
                stack.push(neighbor);
                visited.add(neighborId);
              }
            }
          }
        }

        // Sort this group by start time
        group.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        groups.push(group);
      }
    }

    return groups;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="ml-auto flex gap-3">
          {prevButton ? (
            <div onClick={handlePrevWeek}>{prevButton}</div>
          ) : (
            <Button variant="outline" className={classNames?.prev} onClick={handlePrevWeek}>
              <ArrowLeft />
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextWeek}>{nextButton}</div>
          ) : (
            <Button variant="outline" className={classNames?.next} onClick={handleNextWeek}>
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          custom={direction}
          variants={pageTransitionVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.2 },
          }}
          className={`use-automation-zoom-in grid grid-cols-8 gap-0`}
        >
          <div className="bg-default-100 sticky left-0 top-0 z-30 flex h-full items-center justify-center rounded-tl-lg border-0 bg-primary/10">
            <span className="text-xl font-semibold tracking-tight ">Week {getWeekNumber(currentDate)}</span>
          </div>

          <div className="relative col-span-7 flex flex-col">
            <div
              className="grid grow gap-0 rounded-r-lg bg-primary/10"
              style={{
                gridTemplateColumns: colWidth.map((w) => `${w}fr`).join(' '),
                transition: isResizing ? 'none' : 'grid-template-columns 0.3s ease-in-out',
              }}
            >
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="group relative flex flex-col">
                  <div className="bg-default-100 sticky top-0 z-20 flex grow items-center justify-center">
                    <div className="p-4 text-center">
                      <div className="text-lg font-semibold">{getDayName(day.getDay())}</div>
                      <div
                        className={clsx(
                          'text-lg font-semibold',
                          new Date().getDate() === day.getDate() &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear()
                            ? 'text-secondary-500'
                            : '',
                        )}
                      >
                        {day.getDate()}
                      </div>

                      {/* Fullscreen icon that appears on hover */}
                      <div
                        className="absolute right-10 top-5 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();

                          // Set the selected day
                          const selectedDay = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            day.getDate(),
                          );

                          // Get events for the selected day
                          const dayEvents = getEventsForDay(day.getDate(), currentDate, events);

                          setOpen(
                            <CustomModal
                              title={`${getDayName(day.getDay())} ${day.getDate()}, ${selectedDay.getFullYear()}`}
                            >
                              <div className="flex flex-col space-y-4 p-4">
                                <div className="mb-4 flex items-center">
                                  <ChevronLeft
                                    className="mr-2 cursor-pointer hover:text-primary"
                                    onClick={() => setOpen(null)}
                                  />
                                  <h2 className="text-2xl font-bold">{selectedDay.toDateString()}</h2>
                                </div>

                                {dayEvents && dayEvents.length > 0 ? (
                                  <div className="space-y-4">
                                    {/* Timeline view */}
                                    <div className="bg-default-50 relative min-h-[500px] rounded-lg p-4">
                                      <div className="grid h-full grid-cols-[100px_1fr]">
                                        {/* Hours column */}
                                        <div className="flex flex-col">
                                          {hours.map((hour, index) => (
                                            <div
                                              key={`hour-${index}`}
                                              className="border-default-200 h-16 border-b border-r p-2 text-sm text-muted-foreground"
                                            >
                                              {hour}
                                            </div>
                                          ))}
                                        </div>

                                        {/* Events column */}
                                        <div className="relative">
                                          {/* Hour grid lines */}
                                          {Array.from({ length: 24 }).map((_, index) => (
                                            <div key={`grid-${index}`} className="border-default-200 h-16 border-b" />
                                          ))}

                                          {/* Display events */}
                                          {dayEvents.map((event: Event) => {
                                            // Calculate time groups
                                            const timeGroups = groupEventsByTimePeriod(dayEvents);

                                            // Find which time group this event belongs to
                                            let eventsInSamePeriod = 1;
                                            let periodIndex = 0;

                                            for (let i = 0; i < timeGroups.length; i++) {
                                              const groupIndex = timeGroups[i].findIndex((e) => e.id === event.id);
                                              if (groupIndex !== -1) {
                                                eventsInSamePeriod = timeGroups[i].length;
                                                periodIndex = groupIndex;
                                                break;
                                              }
                                            }

                                            // Get styling for this event
                                            const { height, top, left, maxWidth, minWidth } = handleEventStyling(
                                              event,
                                              dayEvents,
                                              {
                                                eventsInSamePeriod,
                                                periodIndex,
                                                adjustForPeriod: true,
                                              },
                                            );

                                            return (
                                              <div
                                                key={event.id}
                                                style={{
                                                  position: 'absolute',
                                                  height,
                                                  top,
                                                  left,
                                                  maxWidth,
                                                  minWidth,
                                                  padding: '0 2px',
                                                  boxSizing: 'border-box',
                                                }}
                                              >
                                                <EventStyled
                                                  event={{
                                                    ...event,
                                                    CustomEventComponent,
                                                    minmized: true,
                                                  }}
                                                  CustomEventModal={CustomEventModal}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Event list */}
                                    <div className="rounded-lg bg-card p-4">
                                      <h3 className="mb-4 text-lg font-semibold">All Events</h3>
                                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {dayEvents.map((event: Event) => (
                                          <div
                                            key={event.id}
                                            className={`border- rounded-lg border-l-4 p-4 shadow-sm${event.variant} transition-shadow hover:shadow-md`}
                                          >
                                            <EventStyled
                                              event={{
                                                ...event,
                                                CustomEventComponent,
                                                minmized: false,
                                              }}
                                              CustomEventModal={CustomEventModal}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-10 text-center text-muted-foreground">
                                    <p>No events scheduled for this day</p>
                                    <Button
                                      variant="outline"
                                      className="mt-4"
                                      onClick={() => {
                                        setOpen(null);
                                        // handleAddEventWeek(idx, detailedHour || '12:00 PM');
                                      }}
                                    >
                                      Add Event
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CustomModal>,
                          );
                        }}
                      >
                        <Maximize size={16} className="text-muted-foreground hover:text-primary" />
                      </div>

                      {/* Resize handle */}
                    </div>
                  </div>
                  <div className="absolute right-0 top-12 h-[calc(100%-3rem)] w-px"></div>
                </div>
              ))}
            </div>

            {/* {detailedHour && (
              <div
                className="pointer-events-none absolute left-0 z-50 flex h-[2px] w-full rounded-full bg-primary/40"
                style={{ top: `${timelinePosition}px` }}
              >
                <Badge variant="outline" className="absolute left-[5px] z-50 -translate-y-1/2 bg-white text-xs">
                  {detailedHour}
                </Badge>
              </div>
            )} */}
          </div>

          <div
            ref={hoursColumnRef}
            // onMouseMove={handleMouseMove}
            // onMouseLeave={() => setDetailedHour(null)}
            className="relative col-span-8 grid grid-cols-8"
          >
            <div className="bg-default-50 hover:bg-default-100 duration-400 col-span-1 transition">
              {hours.map((hour, index) => (
                <motion.div
                  key={`hour-${index}`}
                  variants={itemVariants}
                  className="border-default-200 h-[64px] cursor-pointer border-b border-r p-[16px] text-center text-sm text-muted-foreground"
                >
                  {hour}
                </motion.div>
              ))}
            </div>

            <div
              className="bg-default-50 col-span-7 grid h-full"
              style={{
                gridTemplateColumns: colWidth.map((w) => `${w}fr`).join(' '),
                transition: isResizing ? 'none' : 'grid-template-columns 0.3s ease-in-out',
              }}
            >
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayEvents = getEventsForDay(daysOfWeek[dayIndex % 7].getDate(), currentDate, events);

                // Calculate time groups once for this day's events
                const timeGroups = groupEventsByTimePeriod(dayEvents);

                // Get the count of events to determine if we need to show a "more" button
                const eventsCount = dayEvents?.length || 0;
                const maxEventsToShow = 10; // Limit the number of events to display before showing "more"
                const hasMoreEvents = eventsCount > maxEventsToShow;

                // Only show a subset of events if there are too many
                const visibleEvents = hasMoreEvents ? dayEvents?.slice(0, maxEventsToShow - 1) : dayEvents;

                return (
                  <div
                    key={`day-${dayIndex}`}
                    className="border-default-200 relative z-20 col-span-1 cursor-pointer overflow-hidden border-b border-r text-center text-sm text-muted-foreground transition duration-300"
                    onClick={() => {
                      // handleAddEventWeek(dayIndex, detailedHour as string);
                    }}
                  >
                    <AnimatePresence initial={false}>
                      {visibleEvents?.map((event: Event, _eventIndex: number) => {
                        // For better spacing, consider if this event is part of a time group
                        let eventsInSamePeriod = 1;
                        let periodIndex = 0;

                        // Find which time group this event belongs to
                        for (let i = 0; i < timeGroups.length; i++) {
                          const groupIndex = timeGroups[i].findIndex((e) => e.id === event.id);
                          if (groupIndex !== -1) {
                            eventsInSamePeriod = timeGroups[i].length;
                            periodIndex = groupIndex;
                            break;
                          }
                        }

                        // Customize styling parameters for events in the same time period
                        const { height, left, maxWidth, minWidth, top } = handleEventStyling(event, dayEvents, {
                          eventsInSamePeriod,
                          periodIndex,
                          adjustForPeriod: true,
                        });

                        return (
                          <motion.div
                            key={event.id}
                            style={{
                              minHeight: height,
                              height,
                              top: top,
                              left: left,
                              maxWidth: maxWidth,
                              minWidth: minWidth,
                              padding: '0 2px',
                              boxSizing: 'border-box',
                            }}
                            className="absolute z-50 flex grow flex-col transition-all duration-1000"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EventStyled
                              event={{
                                ...event,
                                CustomEventComponent,
                                minmized: true,
                              }}
                              CustomEventModal={CustomEventModal}
                            />
                          </motion.div>
                        );
                      })}

                      {/* Show "more events" button if there are too many */}
                      {hasMoreEvents && (
                        <motion.div
                          key={`more-events-${dayIndex}`}
                          style={{
                            bottom: '10px',
                            right: '10px',
                            position: 'absolute',
                          }}
                          className="z-50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show a modal with all events for this day
                              setOpen(
                                <CustomModal title={`Events for ${daysOfWeek[dayIndex].toDateString()}`}>
                                  <div className="max-h-[80vh] space-y-2 overflow-y-auto p-2">
                                    {dayEvents?.map((event: Event) => (
                                      <EventStyled
                                        key={event.id}
                                        event={{
                                          ...event,
                                          CustomEventComponent,
                                          minmized: false,
                                        }}
                                        CustomEventModal={CustomEventModal}
                                      />
                                    ))}
                                  </div>
                                </CustomModal>,
                              );
                            }}
                          >
                            +{eventsCount - (maxEventsToShow - 1)} more
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Render hour slots */}
                    {Array.from({ length: 16 }, (_, hourIndex) => (
                      <div
                        key={`day-${dayIndex}-hour-${hourIndex}`}
                        className="border-default-200 relative col-span-1 h-[64px] cursor-pointer border-b border-r text-center text-sm text-muted-foreground transition duration-300"
                      ></div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
