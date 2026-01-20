import { useState } from 'react'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export const CalendarWithPresets = ({ date, setDate }: CalendarProps) => {
  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                className={cn(
                    "w-[240px] justify-start text-left font-normal border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100",
                    !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : <span>Pick a date</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
            <Card className='max-w-xs border-0 shadow-none'>
                <CardContent className='p-0'>
                <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    defaultMonth={date}
                    className='rounded-md border'
                />
                </CardContent>
                <CardFooter className='flex flex-wrap gap-2 p-3'>
                {[
                    { label: 'Today', value: 0 },
                    { label: 'Tomorrow', value: 1 },
                    { label: 'In 3 days', value: 3 },
                    { label: 'In a week', value: 7 },
                    { label: 'In 2 weeks', value: 14 }
                ].map(preset => (
                    <Button
                    key={preset.value}
                    variant='outline'
                    size='sm'
                    className='flex-1 text-xs h-7'
                    onClick={() => {
                        const newDate = addDays(new Date(), preset.value)
                        setDate(newDate)
                    }}
                    >
                    {preset.label}
                    </Button>
                ))}
                </CardFooter>
            </Card>
        </PopoverContent>
    </Popover>
  )
}
