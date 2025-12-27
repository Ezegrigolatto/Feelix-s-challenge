import { NextRequest, NextResponse } from 'next/server';

const mockData = {
  metrics: {
    totalUsers: 12453,
    activeUsers: 8721,
    revenue: 284500,
    conversions: 1847,
  },
  breakdown: [
    { id: '1', label: 'Sales', value: 45000, change: 12 },
    { id: '2', label: 'Marketing', value: 32000, change: -5 },
    { id: '3', label: 'Support', value: 18000, change: 8 },
    { id: '4', label: 'Product', value: 27000, change: 15 },
  ],
};

type TimeFilter = 'day' | 'week' | 'month' | 'year';
type CategoryFilter = 'all' | 'sales' | 'marketing' | 'support' | 'product';

const CATEGORY_MULTIPLIERS: Record<CategoryFilter, number> = {
  all: 1,
  sales: 0.3,
  marketing: 0.13,
  support: 0.22,
  product: 0.35,
};

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateChartData(
  total: number,
  labels: string[],
  metricKey: string,
  time: TimeFilter,
  category: CategoryFilter
): { date: string; value: number }[] {
  if (total === 0) {
    return labels.map((label) => ({ date: label, value: 0 }));
  }

  const seed = hashString(`${metricKey}-${time}-${category}`);
  const random = seededRandom(seed);

  const n = labels.length;

  const weights: number[] = [];

  for (let i = 0; i < n; i++) {
    let weight = 0.5 + random() * 1.5;

    if (metricKey === 'revenue' || metricKey === 'conversions') {
      const midPoint = (n - 1) / 2;
      const distanceFromMid = Math.abs(i - midPoint) / midPoint;
      weight *= 1.2 - distanceFromMid * 0.4;
    } else if (metricKey === 'activeUsers') {
      weight *= 0.7 + (i / n) * 0.6;
    } else {
      weight *= 0.85 + (i / n) * 0.3;
    }

    weight *= 0.8 + random() * 0.4;

    weights.push(Math.max(0.1, weight));
  }

  const weightSum = weights.reduce((a, b) => a + b, 0);

  const rawValues = weights.map((w) => (w / weightSum) * total);

  const roundedValues = distributeRounding(rawValues, total);

  return labels.map((label, index) => ({
    date: label,
    value: roundedValues[index],
  }));
}

function distributeRounding(values: number[], targetSum: number): number[] {
  const floored = values.map((v) => Math.floor(v));
  let currentSum = floored.reduce((a, b) => a + b, 0);

  const remainders = values.map((v, i) => ({
    index: i,
    remainder: v - floored[i],
  }));

  remainders.sort((a, b) => b.remainder - a.remainder);

  let i = 0;
  while (currentSum < targetSum && i < remainders.length) {
    floored[remainders[i].index]++;
    currentSum++;
    i++;
  }

  return floored;
}

function getLabelsForTime(time: TimeFilter): string[] {
  switch (time) {
    case 'day':
      return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    case 'week':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case 'month':
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    case 'year':
      return [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
  }
}

function getTimeMultiplier(time: TimeFilter): number {
  switch (time) {
    case 'day':
      return 1 / 365;
    case 'week':
      return 1 / 52;
    case 'month':
      return 1;
    case 'year':
      return 12;
  }
}

function generateBreakdown(
  baseBreakdown: typeof mockData.breakdown,
  revenue: number,
  category: CategoryFilter,
  time: TimeFilter
): typeof mockData.breakdown {
  const filtered =
    category === 'all'
      ? [...baseBreakdown]
      : baseBreakdown.filter((item) => item.label.toLowerCase() === category);

  if (filtered.length === 0) {
    return [];
  }

  const baseSum = filtered.reduce((sum, item) => sum + item.value, 0);

  if (category === 'all') {
    const rawValues = filtered.map((item) => (item.value / baseSum) * revenue);
    const roundedValues = distributeRounding(rawValues, revenue);

    return filtered.map((item, index) => ({
      ...item,
      value: roundedValues[index],
    }));
  } else {
    return filtered.map((item) => ({
      ...item,
      value: revenue,
    }));
  }
}

export async function GET(request: NextRequest) {
  if (Math.random() < 0.1) {
    return NextResponse.json(
      { error: 'Forced API failure for production simulation. Try again.' },
      { status: 500 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const { searchParams } = new URL(request.url);
  const time = (searchParams.get('time') || 'month') as TimeFilter;
  const category = (searchParams.get('category') || 'all') as CategoryFilter;
  const status = searchParams.get('status');

  const timeMultiplier = getTimeMultiplier(time);
  const categoryMultiplier = CATEGORY_MULTIPLIERS[category] ?? 1;
  const combinedMultiplier = timeMultiplier * categoryMultiplier;

  const labels = getLabelsForTime(time);
  const inactiveUsers = mockData.metrics.totalUsers - mockData.metrics.activeUsers;

  const metrics = {
    totalUsers: Math.floor(mockData.metrics.totalUsers * combinedMultiplier),
    activeUsers: Math.floor(mockData.metrics.activeUsers * combinedMultiplier),
    revenue: Math.floor(mockData.metrics.revenue * combinedMultiplier),
    conversions: Math.floor(mockData.metrics.conversions * combinedMultiplier),
  };

  if (status === 'active') {
    metrics.totalUsers = metrics.activeUsers;
  } else if (status === 'inactive') {
    metrics.totalUsers = Math.floor(inactiveUsers * combinedMultiplier);
    metrics.activeUsers = 0;
    metrics.conversions = 0;
  }

  const chartData = {
    totalUsers: generateChartData(
      metrics.totalUsers,
      labels,
      'totalUsers',
      time,
      category
    ),
    activeUsers: generateChartData(
      metrics.activeUsers,
      labels,
      'activeUsers',
      time,
      category
    ),
    revenue: generateChartData(metrics.revenue, labels, 'revenue', time, category),
    conversions: generateChartData(
      metrics.conversions,
      labels,
      'conversions',
      time,
      category
    ),
  };

  const breakdown = generateBreakdown(
    mockData.breakdown,
    metrics.revenue,
    category,
    time
  );

  return NextResponse.json({
    metrics,
    chartData,
    breakdown,
    lastUpdated: new Date().toISOString(),
    filters: { time, category, status },
  });
}
