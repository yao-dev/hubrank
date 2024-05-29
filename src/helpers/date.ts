import eachDayOfInterval from "date-fns/eachDayOfInterval";
import endOfWeek from "date-fns/endOfWeek";
import endOfYear from "date-fns/endOfYear";
import startOfWeek from "date-fns/startOfWeek";
import startOfYear from "date-fns/startOfYear";

export const startOfYearDate = startOfYear(new Date());
export const endOfYearDate = endOfYear(new Date());
export const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
export const endOfWeekDate = endOfWeek(new Date(), { weekStartsOn: 1 });

export const getDaysOfYear = () => eachDayOfInterval({
  start: startOfYearDate,
  end: endOfYearDate,
})

export const getDaysOfWeek = () => eachDayOfInterval({
  start: startOfWeekDate,
  end: endOfWeekDate,
})

export const getUTCHourAndMinute = (time: string) => {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(+hours);
  date.setMinutes(+minutes);
  return {
    date,
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  }
}