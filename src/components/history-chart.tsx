import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import IntervalSelector from '@/components/interval-selector';
import {formatAmount, formatDate, formatTickDate} from '@/lib/utils';

type CustomTooltipProps = {
  active: boolean;
  payload: { value: number; payload: any }[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="center-items">
        <p className="font-thin">{formatDate(data.date)}</p>
        <p className="label">{formatAmount(payload[0].value, data.currency, true)}</p>
      </div>
    );
  }

  return null;
};

type CustomDotProps = {
  cx: number;
  cy: number;
  stroke: any;
  value: any;
};

const CustomDot = ({ cx, cy, stroke, value }: CustomDotProps) => {
  const fillColor = value[1] >= 0 ? '#a2b35e' : '#ff4d4f';
  return <circle cx={cx} cy={cy} r={4} stroke={stroke} fill={fillColor} />;
};

interface HistoryChartData {
  date: string;
  totalValue: number;
  currency: string;
}

export function HistoryChart({
  data,
  height = 350,
}: {
  data: HistoryChartData[];
  height?: number;
}) {
  const [interval, setInterval] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('3M');

  const filteredData = useMemo(() => {
    if (!data) return [];
    const today = new Date();
    let startDate: Date;
    switch (interval) {
      case '1D':
        startDate = new Date(today.setDate(today.getDate() - 1));
        break;
      case '1W':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case '1M':
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case '3M':
        startDate = new Date(today.setMonth(today.getMonth() - 3));
        break;
      case '1Y':
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      case 'ALL':
        return data;
    }

    return data.filter((d) => new Date(d.date) >= startDate);
  }, [data, interval]);

  // Calculate the min and max values in the filtered data
  const minValue = Math.min(...filteredData.map((d) => d.totalValue));
  const maxValue = Math.max(...filteredData.map((d) => d.totalValue));

  // Calculate where the 0 line lies between the min and max values
  const zeroPosition = useMemo(() => {
    if (minValue >= 0) {
      return 0; // all positive
    }
    if (maxValue <= 0) {
      return 1; // all negative
    }
    return Math.abs(minValue) / (Math.abs(minValue) + maxValue); // percentage of negative space
  }, [minValue, maxValue]);

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={filteredData}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            {/* Add XAxis and YAxis with labels */}
            <XAxis dataKey="date" tickFormatter={formatTickDate}></XAxis>
            <YAxis
              hide={false}
              type="number"
              domain={['auto', 'auto']}
            />

            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            {/* @ts-ignore */}
            <Tooltip content={<CustomTooltip />} />

            {/* Adjusting the stroke dynamically with a gradient for the line */}
            <Area
              isAnimationActive={true}
              animationDuration={300}
              animationEasing="ease-out"
              connectNulls={true}
              type="monotone"
              dataKey="totalValue"
              stroke="url(#strokeGradient)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#dynamicGradient)"
              activeDot={<CustomDot />}
            />

            {/* Fill gradient for the area (green to red with smooth transition) */}
            <defs>
              <linearGradient id="dynamicGradient" x1="0" y1="0" x2="0" y2="1">
                {/* Dynamically position gradient based on zero line */}
                <stop offset="0%" stopColor="#a2b35e" stopOpacity="1" />
                {/* Green at the top */}
                <stop offset={`${(1 - zeroPosition) * 100}%`} stopColor="#a2b35e" stopOpacity="0" />
                {/* Green fades at zero line */}
                <stop offset={`${(1 - zeroPosition) * 100}%`} stopColor="#ff4d4f" stopOpacity="0" />
                {/* Red starts at zero line */}
                <stop offset="100%" stopColor="#ff4d4f" stopOpacity="1" />
                {/* Red at the bottom */}
              </linearGradient>

              {/* Stroke gradient for the line (hard cutoff at y=0) */}
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset={`${(1 - zeroPosition) * 100}%`} stopColor="#a2b35e" />
                {/* Green for positive values */}
                <stop offset={`${(1 - zeroPosition) * 100}%`} stopColor="#ff4d4f" />
                {/* Red for negative values */}
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <IntervalSelector
        className="absolute -bottom-10 left-0 right-0 z-10"
        onIntervalSelect={(newInterval) => {
          setInterval(newInterval);
        }}
      />
    </div>
  );
}
