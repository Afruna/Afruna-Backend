export type DateFilter = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

interface DateComparison {
  current: Date;
  previous: Date;
}

export const getDateRange = (filter: DateFilter): DateComparison => {
  const now = new Date();
  const previous = new Date();

  // Set both dates to start of day for consistent comparison
  now.setHours(0, 0, 0, 0);
  previous.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'daily':
      previous.setDate(now.getDate() - 1);
      break;

    case 'weekly':
      previous.setDate(now.getDate() - 7);
      break;

    case 'monthly':
      previous.setMonth(now.getMonth() - 1);
      break;

    case 'yearly':
      //     now.setMonth(0); // Set to January
      //     now.setDate(1); // Set to first day of January
      //   const lastYear = new Date();
      //   lastYear.setFullYear(now.getFullYear() - 1);
      //   previous.setTime(lastYear.getTime());
      previous.setMonth(0); // January is 0
      previous.setDate(1);
      break;

    case 'all':
      previous.setFullYear(2020); // Or your application's start date
      break;
  }

  return { current: now, previous };
};
