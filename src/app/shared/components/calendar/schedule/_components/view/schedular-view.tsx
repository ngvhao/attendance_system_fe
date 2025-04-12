'use client';

import type { ClassNames } from '../../../types';
import SchedulerViewFilteration from './schedular-view-filteration';

export default function SchedulerView({
  stopDayEventSummary,
  classNames,
}: {
  stopDayEventSummary?: boolean;
  classNames?: ClassNames;
}) {
  return (
    <div className="flex flex-col gap-6">
      <SchedulerViewFilteration stopDayEventSummary={stopDayEventSummary} classNames={classNames} />
    </div>
  );
}
