import ModalProvider from '../../../providers/modal-context';
import type { ClassNames } from '../../../types';
import SchedulerView from '../view/schedular-view';

export default function SchedulerWrapper({
  stopDayEventSummary,
  classNames,
}: {
  stopDayEventSummary?: boolean;
  classNames?: ClassNames;
}) {
  return (
    <div className="w-full p-6">
      {/* <h1 className="mb-10 text-8xl font-semibold tracking-tighter">Event Schedule</h1> */}
      <ModalProvider>
        <SchedulerView stopDayEventSummary={stopDayEventSummary} classNames={classNames} />
      </ModalProvider>
    </div>
  );
}
