import SchedulerWrapper from '@/app/shared/components/calendar/schedule/_components/wrapper/schedular-wrapper';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* <LoginForm /> */}
      {/* <SchedulerProvider weekStartsOn="monday">
        <SchedulerWrapper
          stopDayEventSummary={true}
          classNames={{
            tabs: {
              panel: 'p-0',
            },
          }}
        />
      </SchedulerProvider> */}
      <SchedulerWrapper
        stopDayEventSummary={true}
        classNames={{
          tabs: {
            panel: 'p-0',
          },
        }}
      />
    </div>
  );
}

// export default function MyCalendar() {
//   return (

//   )
// }
