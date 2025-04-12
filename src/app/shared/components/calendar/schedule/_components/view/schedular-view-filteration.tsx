'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar as CalendarIcon, CalendarDaysIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BsCalendarMonth, BsCalendarWeek } from 'react-icons/bs';

import { Button } from '@/app/shared/components/ui/button';
import CustomModal from '@/app/shared/components/ui/custom-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/shared/components/ui/tabs';
import { useMobile } from '@/app/shared/hooks/use-mobile';
import { cn } from '@/app/shared/lib/utils';

import { useModal } from '../../../providers/modal-context';
import type { ClassNames, CustomComponents, Views } from '../../../types';
import AddEventModal from '../../_modals/add-event-modal';
import DailyView from './day/daily-view';
import MonthView from './month/month-view';
import WeeklyView from './week/week-view';

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, type: 'spring', stiffness: 250 },
};

export default function SchedulerViewFilteration({
  views = {
    views: ['day', 'week', 'month'],
    mobileViews: ['day'],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
}: {
  views?: Views;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { setOpen } = useModal();
  const [activeView, setActiveView] = useState<string>('day');
  const isMobile = useMobile();

  function handleAddEvent() {
    // Open the modal with the content
    console.log('Add Event Modal Opened');
    setOpen(
      <CustomModal title="Add Event">
        <AddEventModal CustomAddEventModal={CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm} />
      </CustomModal>,
    );
  }

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  // Set initial active view
  useEffect(() => {
    if (viewsSelector?.length) {
      if (activeView && viewsSelector?.includes(activeView)) {
        setActiveView(activeView);
      } else {
        setActiveView(viewsSelector[0]);
      }
    }
  }, [activeView, viewsSelector]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs value={activeView} onValueChange={setActiveView} className={cn('w-full', classNames?.tabs)}>
            <div className="mb-4 flex items-center justify-between">
              <TabsList className="grid grid-cols-3">
                {viewsSelector?.includes('day') && (
                  <TabsTrigger value="day">
                    {CustomComponents?.customTabs?.CustomDayTab ? (
                      CustomComponents.customTabs.CustomDayTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon size={15} />
                        <span>Day</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes('week') && (
                  <TabsTrigger value="week">
                    {CustomComponents?.customTabs?.CustomWeekTab ? (
                      CustomComponents.customTabs.CustomWeekTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarWeek />
                        <span>Week</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes('month') && (
                  <TabsTrigger value="month">
                    {CustomComponents?.customTabs?.CustomMonthTab ? (
                      CustomComponents.customTabs.CustomMonthTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarMonth />
                        <span>Month</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Add Event Button */}
              {CustomComponents?.customButtons?.CustomAddEventButton ? (
                <div onClick={() => handleAddEvent()}>{CustomComponents?.customButtons.CustomAddEventButton}</div>
              ) : (
                <Button onClick={() => handleAddEvent()} className={classNames?.buttons?.addEvent} variant="default">
                  <CalendarIcon className="mr-2 size-4" />
                  Add Event
                </Button>
              )}
            </div>

            {viewsSelector?.includes('day') && (
              <TabsContent value="day">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <DailyView
                      stopDayEventSummary={stopDayEventSummary}
                      classNames={classNames?.buttons}
                      prevButton={CustomComponents?.customButtons?.CustomPrevButton}
                      nextButton={CustomComponents?.customButtons?.CustomNextButton}
                      CustomEventComponent={CustomComponents?.CustomEventComponent}
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes('week') && (
              <TabsContent value="week">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <WeeklyView
                      classNames={classNames?.buttons}
                      prevButton={CustomComponents?.customButtons?.CustomPrevButton}
                      nextButton={CustomComponents?.customButtons?.CustomNextButton}
                      CustomEventComponent={CustomComponents?.CustomEventComponent}
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes('month') && (
              <TabsContent value="month">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <MonthView
                      classNames={classNames?.buttons}
                      prevButton={CustomComponents?.customButtons?.CustomPrevButton}
                      nextButton={CustomComponents?.customButtons?.CustomNextButton}
                      CustomEventComponent={CustomComponents?.CustomEventComponent}
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
