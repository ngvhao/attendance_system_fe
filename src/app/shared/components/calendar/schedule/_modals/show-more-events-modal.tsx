import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useModal } from '../../providers/modal-context';
import type { Event } from '../../types';
import EventStyled from '../_components/view/event-component/event-styled';

export default function ShowMoreEventsModal() {
  const { data } = useModal();
  console.log(data);
  const dayEvents = React.useMemo(() => data?.default?.dayEvents || [], [data]);

  const [events, setEvents] = useState<Event[]>(dayEvents);

  useEffect(() => {
    setEvents(dayEvents);
  }, [dayEvents]);

  return (
    <div className="flex flex-col gap-2">
      {events.length > 0 ? (
        events.map((event: Event) => (
          <EventStyled
            onDelete={(id) => {
              setEvents(events.filter((event) => event.id !== id));
            }}
            key={event.id}
            event={{
              ...event,
            }}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CalendarIcon className="mb-2 size-12 text-primary" />
          <p className="text-lg font-medium text-primary">No events found</p>
          <p className="text-sm text-muted-foreground">There are no events scheduled for this day.</p>
        </div>
      )}
    </div>
  );
}
