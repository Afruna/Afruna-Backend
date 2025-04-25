export const calculateMetrics = (current: number, previous: number, period: string) => {
    const difference = current - previous;
    const percentage = previous === 0 ? 100 : (difference / previous) * 100;
    return {
      percentage: Math.abs(Math.round(percentage)),
      trend: difference >= 0 ? 'up' : 'down',
      period,
      value: difference
    };
  };
  