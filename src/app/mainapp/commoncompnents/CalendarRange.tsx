"use client"
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import useFormStore from '../../../store/formdata';
import { PopoverClose } from "@radix-ui/react-popover"

export function CalendarDateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const { feedbackTable, updateFeedbackTable } = useFormStore();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 20)
    })

    const updateFilter = () => {
        updateFeedbackTable("startDate", format(date?.from, 'yyyy-MM-dd'));
        updateFeedbackTable("endDate", format(date?.to, 'yyyy-MM-dd'));
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "yyyy-MM-dd")} -{" "}
                                    {format(date.to, "yyyy-MM-dd")}
                                </>
                            ) : (
                                format(date.from, "yyyy-MM-dd")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    <div className="p-3 m-2 text-right">
                        <PopoverClose>
                            <Button onClick={()=> updateFilter()}>Filter</Button>
                        </PopoverClose>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}