'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import { Button } from '@/app/shared/components/ui/button';
import { useSchedulerStore } from '@/app/shared/stores/study-schedule.store';
import { getEventsForDay, handleEventStyling } from '@/app/shared/utils/study-schedule.getter';

// import { useScheduler } from '../../../../providers/schedular-provider';
import type { CustomEventModal, Event } from '../../../../types';
import EventStyled from '../event-component/event-styled';

// Generate hours in 12-hour format
const hours = Array.from({ length: 16 }, (_, i) => {
  const hour24 = i + 6;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  return `${hour12}:00 ${ampm}`;
});

console.log(hours);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Stagger effect between children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

const pageTransitionVariants = {
  enter: (_direction: number) => ({
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (_direction: number) => ({
    opacity: 0,
    transition: {
      opacity: { duration: 0.2, ease: 'easeInOut' },
    },
  }),
};

// Precise time-based event grouping function
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

  // Use a graph-based approach to find connected components (overlapping event groups)
  const buildOverlapGraph = (events: Event[]) => {
    // Create adjacency list
    const graph: Record<string, string[]> = {};

    // Initialize graph
    events.forEach((event) => {
      graph[event.id] = [];
    });

    // Build connections
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (eventsOverlap(events[i], events[j])) {
          graph[events[i].id].push(events[j].id);
          graph[events[j].id].push(events[i].id);
        }
      }
    }

    return graph;
  };

  // Find connected components using DFS
  const findConnectedComponents = (graph: Record<string, string[]>, events: Event[]) => {
    const visited: Record<string, boolean> = {};
    const components: Event[][] = [];

    // DFS function to traverse the graph
    const dfs = (nodeId: string, component: string[]) => {
      visited[nodeId] = true;
      component.push(nodeId);

      for (const neighbor of graph[nodeId]) {
        if (!visited[neighbor]) {
          dfs(neighbor, component);
        }
      }
    };

    // Find all connected components
    for (const event of events) {
      if (!visited[event.id]) {
        const component: string[] = [];
        dfs(event.id, component);

        // Map IDs back to events
        const eventGroup = component.map((id) => events.find((e) => e.id === id)!);

        components.push(eventGroup);
      }
    }

    return components;
  };

  // Build the overlap graph
  const graph = buildOverlapGraph(sortedEvents);

  // Find connected components (groups of overlapping events)
  const timeGroups = findConnectedComponents(graph, sortedEvents);

  // Sort events within each group by start time
  return timeGroups.map((group) =>
    group.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
  );
};

export default function DailyView({
  prevButton,
  nextButton,
  CustomEventComponent,
  CustomEventModal,
  stopDayEventSummary,
  classNames,
}: {
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  CustomEventComponent?: React.FC<Event>;
  CustomEventModal?: CustomEventModal;
  stopDayEventSummary?: boolean;
  classNames?: { prev?: string; next?: string; addEvent?: string };
}) {
  const hoursColumnRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [direction, setDirection] = useState<number>(0);

  const getFormattedDayTitle = useCallback(() => currentDate.toDateString(), [currentDate]);

  const events = useSchedulerStore((state) => state.events);
  const dayEvents = getEventsForDay(currentDate?.getDate() || 0, currentDate, events);

  // Calculate time groups once for all events
  const timeGroups = groupEventsByTimePeriod(dayEvents);

  const handleNextDay = useCallback(() => {
    setDirection(1);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  }, [currentDate]);

  const handlePrevDay = useCallback(() => {
    setDirection(-1);
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
  }, [currentDate]);

  return (
    <div className="">
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <h1 className="mb-4 text-3xl font-semibold">{getFormattedDayTitle()}</h1>

        <div className="ml-auto flex  gap-3">
          {prevButton ? (
            <div onClick={handlePrevDay}>{prevButton}</div>
          ) : (
            <Button variant={'outline'} className={classNames?.prev} onClick={handlePrevDay}>
              <ArrowLeft />
              Prev
            </Button>
          )}
          {nextButton ? (
            <div onClick={handleNextDay}>{nextButton}</div>
          ) : (
            <Button variant={'outline'} className={classNames?.next} onClick={handleNextDay}>
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
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="flex flex-col gap-4"
        >
          {!stopDayEventSummary && (
            <div className="all-day-events">
              <AnimatePresence initial={false}>
                {dayEvents && dayEvents?.length
                  ? dayEvents?.map((event: any, _eventIndex: any) => {
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mb-2"
                        >
                          <EventStyled
                            event={{
                              ...event,
                              CustomEventComponent,
                              minmized: false,
                            }}
                            CustomEventModal={CustomEventModal}
                          />
                        </motion.div>
                      );
                    })
                  : 'No events for today'}
              </AnimatePresence>
            </div>
          )}

          <div className="bg-default-50 hover:bg-default-100 duration-400 relative rounded-md transition">
            <motion.div
              className="relative flex rounded-xl ease-in-out"
              ref={hoursColumnRef}
              variants={containerVariants}
              initial="hidden" // Ensure initial state is hidden
              animate="visible" // Trigger animation to visible state
              // onMouseMove={handleMouseMove}
              // onMouseLeave={() => setDetailedHour(null)}
            >
              <div className="flex  flex-col">
                {hours.map((hour, index) => (
                  <motion.div
                    key={`hour-${index}`}
                    variants={itemVariants}
                    className="border-default-200   h-[64px] cursor-pointer  p-4 text-left text-sm text-muted-foreground transition duration-300"
                  >
                    {hour}
                  </motion.div>
                ))}
              </div>
              <div className="relative flex grow flex-col ">
                {Array.from({ length: 16 }).map((_, index) => (
                  <div
                    // onClick={() => {
                    //   handleAddEventDay(detailedHour as string);
                    // }}
                    key={`hour-${index}`}
                    className="hover:bg-default-200/50 border-default-200 relative h-[64px]  w-full  cursor-pointer border-b  p-4 text-left text-sm text-muted-foreground transition duration-300"
                  >
                    {/* <div className="duration-250 absolute left-0 top-0 flex size-full items-center justify-center bg-accent text-xs opacity-100 transition hover:opacity-100">
                      Add Event
                    </div> */}
                  </div>
                ))}
                <AnimatePresence initial={false}>
                  {dayEvents && dayEvents?.length
                    ? dayEvents?.map((event: any, _eventIndex: any) => {
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
                              top: top,
                              left: left,
                              maxWidth: maxWidth,
                              minWidth: minWidth,
                              padding: '0 2px',
                              boxSizing: 'border-box',
                              zIndex: periodIndex + 1, // 🛠️ FIX QUAN TRỌNG
                              position: 'absolute', // Dù Tailwind có thể đã có, nên thêm tay cho chắc
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
                      })
                    : ''}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
