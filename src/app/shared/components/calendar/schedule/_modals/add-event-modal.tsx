'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid'; // Use UUID to generate event IDs

import { Button } from '@/app/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/shared/components/ui/dropdown-menu';
import { Input } from '@/app/shared/components/ui/input';
import { Label } from '@/app/shared/components/ui/label';
import { Textarea } from '@/app/shared/components/ui/textarea';
import { cn } from '@/app/shared/lib/utils';
import { useSchedulerStore } from '@/app/shared/stores/study-schedule.store';

import { useModal } from '../../providers/modal-context';
import { type Event, type EventFormData, eventSchema, type Variant } from '../../types';
import SelectDate from '../_components/add-event-components/select-date';
export default function AddEventModal({
  CustomAddEventModal,
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
}) {
  const { setClose, data } = useModal();

  const [selectedColor, setSelectedColor] = useState<string>(getEventColor(data?.variant || 'primary'));

  const typedData = data as { default: Event };

  const { addEvent, updateEvent } = useSchedulerStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      variant: data?.variant || 'primary',
      color: data?.color || 'blue',
    },
  });

  // Reset the form on initialization
  useEffect(() => {
    if (data?.default) {
      const eventData = data?.default;
      console.log('eventData', eventData);
      reset({
        title: eventData.title,
        description: eventData.description || '',
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        variant: eventData.variant || 'primary',
        color: eventData.color || 'blue',
      });
    }
  }, [data, reset]);

  const colorOptions = [
    { key: 'blue', name: 'Blue' },
    { key: 'red', name: 'Red' },
    { key: 'green', name: 'Green' },
    { key: 'yellow', name: 'Yellow' },
  ];

  function getEventColor(variant: Variant) {
    switch (variant) {
      case 'primary':
        return 'blue';
      case 'danger':
        return 'red';
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      default:
        return 'blue';
    }
  }

  function getEventStatus(color: string) {
    switch (color) {
      case 'blue':
        return 'primary';
      case 'red':
        return 'danger';
      case 'green':
        return 'success';
      case 'yellow':
        return 'warning';
      default:
        return 'default';
    }
  }

  // const getButtonVariant = (color: string) => {
  //   switch (color) {
  //     case 'blue':
  //       return 'default';
  //     case 'red':
  //       return 'destructive';
  //     case 'green':
  //       return 'secondary';
  //     case 'yellow':
  //       return 'warning';
  //     default:
  //       return 'default';
  //   }
  // };

  const onSubmit: SubmitHandler<EventFormData> = (formData) => {
    const newEvent: Event = {
      id: uuidv4(), // Generate a unique ID
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      variant: formData.variant,
      description: formData.description,
    };

    if (!typedData?.default?.id) addEvent(newEvent);
    else updateEvent(newEvent);
    setClose(); // Close the modal after submission
  };

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
      {CustomAddEventModal ? (
        <CustomAddEventModal register={register} errors={errors} />
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="title">Event Name</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter event name"
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message as string}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Enter event description" />
          </div>

          <SelectDate
            data={{
              startDate: data?.default?.startDate || new Date(),
              endDate: data?.default?.endDate || new Date(),
            }}
            setValue={setValue}
          />

          <div className="grid gap-2">
            <Label>Color</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="my-2 w-fit">
                  {colorOptions.find((color) => color.key === selectedColor)?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {colorOptions.map((color) => (
                  <DropdownMenuItem
                    key={color.key}
                    onClick={() => {
                      setSelectedColor(color.key);
                      setValue('variant', getEventStatus(color.key));
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        style={{
                          backgroundColor: `var(--${color.key})`,
                        }}
                        className={`mr-2 size-4 rounded-full`}
                      />
                      {color.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex justify-end space-x-2 border-t pt-2">
            <Button variant="outline" type="button" onClick={() => setClose()}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </div>
        </>
      )}
    </form>
  );
}
