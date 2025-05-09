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
      // Current: Today (until now)
      now.setHours(23, 59, 59, 999);
      
      // Previous: Yesterday (full day)
      previous.setDate(previous.getDate() - 1);
      previous.setHours(0, 0, 0, 0);
      break;

     case 'weekly':
      // Current: This week (until now)
      now.setHours(23, 59, 59, 999);
      
      // Previous: Last week (full week)
      previous.setDate(previous.getDate() - 7);
      previous.setHours(0, 0, 0, 0);
      break;

    case 'monthly':
      // Current: This month (until now)
      now.setHours(23, 59, 59, 999);
      
      // Previous: Last month (full month)
      previous.setMonth(previous.getMonth() - 1);
      previous.setDate(1); // Start of previous month
      previous.setHours(0, 0, 0, 0);
      break;

    case 'yearly':
      // Current: This year (until now)
      now.setHours(23, 59, 59, 999);
      
      // Previous: Start of this year
      previous.setMonth(0); // January
      previous.setDate(1); // First day
      previous.setHours(0, 0, 0, 0);
      break;
 
    case 'all':
      now.setHours(23, 59, 59, 999);
      previous.setFullYear(2020);
      previous.setMonth(0);
      previous.setDate(1);
      previous.setHours(0, 0, 0, 0);
      break;
  }

  return { current: now, previous };
};
