'use client';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  conversions: number;
}

interface ChartPoint {
  date: string;
  value: number;
}

interface ChartData {
  totalUsers: ChartPoint[];
  activeUsers: ChartPoint[];
  revenue: ChartPoint[];
  conversions: ChartPoint[];
}

interface BreakdownItem {
  id: string;
  label: string;
  value: number;
  change: number;
}

interface AnalyticsResponse {
  metrics: Metrics;
  chartData: ChartData;
  breakdown: BreakdownItem[];
  lastUpdated: string;
}

interface Filters {
  time: string;
  category: string;
  status: string;
}

type MetricKey = 'totalUsers' | 'activeUsers' | 'revenue' | 'conversions';

const KPI_CONFIG: { key: MetricKey; title: string; prefix?: string }[] = [
  { key: 'totalUsers', title: 'Total Users' },
  { key: 'activeUsers', title: 'Active Users' },
  { key: 'revenue', title: 'Revenue', prefix: '$' },
  { key: 'conversions', title: 'Conversions' },
];

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({
    time: 'month',
    category: 'all',
    status: 'all',
  });
  const [activeKPI, setActiveKPI] = useState<MetricKey>('totalUsers');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        time: filters.time,
        category: filters.category,
        status: filters.status,
      });

      const response = await fetch(`/api/analytics?${params}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.metrics || !result.chartData || !result.breakdown) {
        throw new Error('Invalid API response');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [filters.category, filters.status, filters.time]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getActiveKPITitle = () => {
    return KPI_CONFIG.find((kpi) => kpi.key === activeKPI)?.title || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
              <select
                value={filters.time}
                onChange={(e) => handleFilterChange('time', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="day">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="support">Support</option>
                <option value="product">Product</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && <LoadingState message="Loading analytics..." />}

        {error && <ErrorState message={error} onRetry={fetchData} />}

        {!isLoading && !error && !data && <EmptyState />}

        {!isLoading && !error && data && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {KPI_CONFIG.map((kpi) => (
                <KPICard
                  key={kpi.key}
                  title={kpi.title}
                  value={`${kpi.prefix || ''}${data.metrics[kpi.key].toLocaleString()}`}
                  isActive={activeKPI === kpi.key}
                  onClick={() => setActiveKPI(kpi.key)}
                />
              ))}
            </div>

            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">{getActiveKPITitle()} Trend</h2>
              <TrendChart data={data.chartData[activeKPI]} />
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Breakdown by Category</h2>
              {data.breakdown.length === 0 ? (
                <EmptyState message="No data available for this category" />
              ) : (
                <BreakdownTable data={data.breakdown} />
              )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}

function KPICard({ title, value, isActive, onClick }: KPICardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg p-6 shadow text-left transition-all ${
        isActive
          ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <p className={`text-sm font-medium ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
        {title}
      </p>
      <p className={`mt-2 text-2xl font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </button>
  );
}

function TrendChart({ data }: { data: ChartPoint[] }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No trend data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BreakdownTable({ data }: { data: BreakdownItem[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b text-left text-sm text-gray-500">
          <th className="pb-2">Category</th>
          <th className="pb-2 text-right">Value</th>
          <th className="pb-2 text-right">Change</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b">
            <td className="py-3">{row.label}</td>
            <td className="py-3 text-right">${row.value.toLocaleString()}</td>
            <td className={`py-3 text-right ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {row.change >= 0 ? '+' : ''}{row.change}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}