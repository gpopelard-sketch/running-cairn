import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
function Icon({ size = 20, className, children }) {
    return (React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: className }, children));
}
function Plus({ size, className }) {
    return React.createElement(Icon, { size: size, className: className },
        React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
        React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" }));
}
function X({ size, className }) {
    return React.createElement(Icon, { size: size, className: className },
        React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
        React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }));
}
function ChevronDown({ size, className }) {
    return React.createElement(Icon, { size: size, className: className },
        React.createElement("path", { d: "m6 9 6 6 6-6" }));
}
function Trash2({ size, className }) {
    return (React.createElement(Icon, { size: size, className: className },
        React.createElement("path", { d: "M3 6h18" }),
        React.createElement("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
        React.createElement("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
        React.createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
        React.createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" })));
}
function BarChart2({ size, className }) {
    return React.createElement(Icon, { size: size, className: className },
        React.createElement("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
        React.createElement("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
        React.createElement("line", { x1: "6", y1: "20", x2: "6", y2: "14" }));
}
function LineChartIcon({ size, className }) {
    return React.createElement(Icon, { size: size, className: className },
        React.createElement("path", { d: "M3 3v18h18" }),
        React.createElement("path", { d: "m19 9-5 5-4-4-3 3" }));
}
const STORAGE_KEY = 'running-cairn-activities';
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function toLocalISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function todayISO() {
    return toLocalISO(new Date());
}
function formatKm(n) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function formatDuration(totalSeconds) {
    const s = Math.round(totalSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
        return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
}
function formatPace(secPerKm) {
    if (!isFinite(secPerKm) || secPerKm <= 0)
        return '—';
    const m = Math.floor(secPerKm / 60);
    const s = Math.round(secPerKm % 60);
    return `${m}'${String(s).padStart(2, '0')}"/km`;
}
function formatSpeed(distanceKm, durationSec) {
    if (!durationSec || !distanceKm)
        return '—';
    const kmh = distanceKm / (durationSec / 3600);
    return `${kmh.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km/h`;
}
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length)
        return null;
    const data = payload[0].payload;
    return (React.createElement("div", { style: { background: 'rgba(23,24,43,0.92)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#F5F5FA', backdropFilter: 'blur(10px)' } },
        React.createElement("div", { style: { color: 'rgba(245,245,250,0.55)', marginBottom: 3 } }, label),
        React.createElement("div", null,
            data.km,
            " km \u00B7 ",
            formatDuration(data.sec),
            " \u00B7 D+ ",
            Math.round(data.elev || 0),
            " m"),
        React.createElement("div", { style: { color: 'rgba(245,245,250,0.55)', marginTop: 2 } },
            data.count || 0,
            " sortie",
            (data.count || 0) > 1 ? 's' : '')));
}
function mondayOf(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}
function weekKey(dateStr) {
    return toLocalISO(mondayOf(dateStr));
}
function monthLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}
function monthKey(dateStr) {
    return dateStr.slice(0, 7);
}
const SEED_BATCHES = [
    {
        key: 'running-cairn-batch-1',
        activities: [
            { date: '2026-09-02', sport: 'trail', type: 'entrainement', distanceKm: 8.36, durationSec: 3165, elevationM: 81, avgHr: 0 },
            { date: '2026-09-01', sport: 'trail', type: 'entrainement', distanceKm: 6.46, durationSec: 2758, elevationM: 119, avgHr: 0 },
            { date: '2026-08-29', sport: 'trail', type: 'entrainement', distanceKm: 15.59, durationSec: 8499, elevationM: 422, avgHr: 0 },
            { date: '2026-08-28', sport: 'trail', type: 'entrainement', distanceKm: 8.61, durationSec: 3959, elevationM: 0, avgHr: 0 },
            { date: '2026-08-27', sport: 'trail', type: 'entrainement', distanceKm: 5.93, durationSec: 2703, elevationM: 103, avgHr: 0 },
            { date: '2026-08-25', sport: 'trail', type: 'entrainement', distanceKm: 5.92, durationSec: 2400, elevationM: 100, avgHr: 0 },
            { date: '2026-08-23', sport: 'trail', type: 'entrainement', distanceKm: 8.26, durationSec: 3819, elevationM: 73, avgHr: 0 },
            { date: '2026-08-22', sport: 'trail', type: 'entrainement', distanceKm: 6.91, durationSec: 3029, elevationM: 147, avgHr: 0 },
            { date: '2026-08-20', sport: 'trail', type: 'entrainement', distanceKm: 6.14, durationSec: 2404, elevationM: 0, avgHr: 0 },
        ],
    },
    {
        key: 'running-cairn-batch-2',
        activities: [{ "date": "2024-02-05", "sport": "trail", "type": "entrainement", "distanceKm": 2.83, "durationSec": 1040, "elevationM": 20, "avgHr": 148 }, { "date": "2024-02-08", "sport": "trail", "type": "entrainement", "distanceKm": 7.22, "durationSec": 3130, "elevationM": 86, "avgHr": 151 }, { "date": "2024-02-14", "sport": "trail", "type": "entrainement", "distanceKm": 8.15, "durationSec": 3473, "elevationM": 125, "avgHr": 155 }, { "date": "2024-02-18", "sport": "trail", "type": "entrainement", "distanceKm": 6.45, "durationSec": 2738, "elevationM": 50, "avgHr": 142 }, { "date": "2024-02-21", "sport": "trail", "type": "entrainement", "distanceKm": 8.17, "durationSec": 3437, "elevationM": 125, "avgHr": 149 }, { "date": "2024-02-25", "sport": "trail", "type": "entrainement", "distanceKm": 6.78, "durationSec": 2900, "elevationM": 101, "avgHr": 142 }, { "date": "2024-02-28", "sport": "trail", "type": "entrainement", "distanceKm": 4.0, "durationSec": 1446, "elevationM": 40, "avgHr": 154 }, { "date": "2024-03-07", "sport": "trail", "type": "entrainement", "distanceKm": 8.51, "durationSec": 3501, "elevationM": 65, "avgHr": 150 }, { "date": "2024-03-10", "sport": "trail", "type": "entrainement", "distanceKm": 4.0, "durationSec": 1864, "elevationM": 66, "avgHr": 134 }, { "date": "2024-03-12", "sport": "velo", "type": "entrainement", "distanceKm": 9.45, "durationSec": 1986, "elevationM": 125, "avgHr": 137 }, { "date": "2024-03-15", "sport": "trail", "type": "entrainement", "distanceKm": 5.52, "durationSec": 2342, "elevationM": 44, "avgHr": 146 }, { "date": "2024-03-17", "sport": "velo", "type": "entrainement", "distanceKm": 13.66, "durationSec": 4101, "elevationM": 292, "avgHr": 128 }, { "date": "2024-03-23", "sport": "trail", "type": "entrainement", "distanceKm": 4.66, "durationSec": 1972, "elevationM": 82, "avgHr": 136 }, { "date": "2024-04-04", "sport": "trail", "type": "entrainement", "distanceKm": 9.65, "durationSec": 4096, "elevationM": 148, "avgHr": 159 }, { "date": "2024-04-09", "sport": "trail", "type": "entrainement", "distanceKm": 5.81, "durationSec": 2581, "elevationM": 71, "avgHr": 151 }, { "date": "2024-04-10", "sport": "trail", "type": "entrainement", "distanceKm": 9.15, "durationSec": 3829, "elevationM": 39, "avgHr": 156 }, { "date": "2024-04-14", "sport": "trail", "type": "entrainement", "distanceKm": 7.57, "durationSec": 3231, "elevationM": 116, "avgHr": 155 }, { "date": "2024-04-18", "sport": "trail", "type": "entrainement", "distanceKm": 6.47, "durationSec": 2630, "elevationM": 50, "avgHr": 150 }, { "date": "2024-04-26", "sport": "trail", "type": "entrainement", "distanceKm": 6.01, "durationSec": 2525, "elevationM": 41, "avgHr": 152 }, { "date": "2024-04-27", "sport": "velo", "type": "entrainement", "distanceKm": 27.83, "durationSec": 8123, "elevationM": 314, "avgHr": 129 }, { "date": "2024-05-01", "sport": "trail", "type": "entrainement", "distanceKm": 4.09, "durationSec": 2091, "elevationM": 36, "avgHr": 133 }, { "date": "2024-05-04", "sport": "velo", "type": "entrainement", "distanceKm": 10.29, "durationSec": 1812, "elevationM": 36, "avgHr": 114 }, { "date": "2024-05-05", "sport": "trail", "type": "entrainement", "distanceKm": 8.84, "durationSec": 3601, "elevationM": 96, "avgHr": 162 }, { "date": "2024-05-08", "sport": "trail", "type": "entrainement", "distanceKm": 9.01, "durationSec": 4044, "elevationM": 221, "avgHr": 145 }, { "date": "2024-06-30", "sport": "trail", "type": "entrainement", "distanceKm": 5.01, "durationSec": 2228, "elevationM": 43, "avgHr": 150 }, { "date": "2024-07-07", "sport": "trail", "type": "entrainement", "distanceKm": 6.63, "durationSec": 3008, "elevationM": 24, "avgHr": 157 }, { "date": "2024-07-14", "sport": "trail", "type": "entrainement", "distanceKm": 6.0, "durationSec": 2516, "elevationM": 71, "avgHr": 149 }, { "date": "2024-07-21", "sport": "velo", "type": "entrainement", "distanceKm": 8.2, "durationSec": 3888, "elevationM": 97, "avgHr": 96 }, { "date": "2024-07-24", "sport": "trail", "type": "entrainement", "distanceKm": 7.45, "durationSec": 3244, "elevationM": 100, "avgHr": 163 }, { "date": "2024-07-28", "sport": "trail", "type": "entrainement", "distanceKm": 8.0, "durationSec": 3425, "elevationM": 110, "avgHr": 154 }, { "date": "2024-07-29", "sport": "velo", "type": "entrainement", "distanceKm": 17.15, "durationSec": 3848, "elevationM": 266, "avgHr": 135 }, { "date": "2024-07-30", "sport": "trail", "type": "entrainement", "distanceKm": 5.0, "durationSec": 2315, "elevationM": 74, "avgHr": 152 }, { "date": "2024-08-01", "sport": "velo", "type": "entrainement", "distanceKm": 7.88, "durationSec": 1807, "elevationM": 110, "avgHr": 122 }, { "date": "2024-08-25", "sport": "trail", "type": "entrainement", "distanceKm": 6.51, "durationSec": 2506, "elevationM": 36, "avgHr": 152 }, { "date": "2024-09-01", "sport": "trail", "type": "entrainement", "distanceKm": 8.86, "durationSec": 4130, "elevationM": 200, "avgHr": 164 }, { "date": "2024-09-08", "sport": "trail", "type": "entrainement", "distanceKm": 8.05, "durationSec": 6959, "elevationM": 213, "avgHr": 121 }, { "date": "2024-09-21", "sport": "trail", "type": "entrainement", "distanceKm": 9.67, "durationSec": 3595, "elevationM": 110, "avgHr": 170 }, { "date": "2024-09-27", "sport": "trail", "type": "entrainement", "distanceKm": 6.75, "durationSec": 3001, "elevationM": 23, "avgHr": 144 }, { "date": "2024-09-29", "sport": "trail", "type": "entrainement", "distanceKm": 7.14, "durationSec": 3512, "elevationM": 36, "avgHr": 129 }, { "date": "2024-10-01", "sport": "trail", "type": "entrainement", "distanceKm": 5.14, "durationSec": 2406, "elevationM": 59, "avgHr": 136 }, { "date": "2024-10-04", "sport": "trail", "type": "entrainement", "distanceKm": 6.2, "durationSec": 2673, "elevationM": 83, "avgHr": 146 }, { "date": "2024-10-06", "sport": "trail", "type": "entrainement", "distanceKm": 7.11, "durationSec": 3339, "elevationM": 51, "avgHr": 134 }, { "date": "2024-10-08", "sport": "velo", "type": "entrainement", "distanceKm": 26.82, "durationSec": 6234, "elevationM": 325, "avgHr": 135 }, { "date": "2024-10-12", "sport": "trail", "type": "entrainement", "distanceKm": 6.97, "durationSec": 3436, "elevationM": 153, "avgHr": 149 }, { "date": "2024-10-13", "sport": "velo", "type": "entrainement", "distanceKm": 49.52, "durationSec": 9218, "elevationM": 333, "avgHr": 126 }, { "date": "2024-10-15", "sport": "trail", "type": "entrainement", "distanceKm": 7.65, "durationSec": 4099, "elevationM": 173, "avgHr": 135 }, { "date": "2024-10-18", "sport": "trail", "type": "entrainement", "distanceKm": 2.73, "durationSec": 1273, "elevationM": 121, "avgHr": 135 }, { "date": "2024-10-19", "sport": "trail", "type": "entrainement", "distanceKm": 10.0, "durationSec": 3496, "elevationM": 91, "avgHr": 167 }, { "date": "2024-10-20", "sport": "trail", "type": "entrainement", "distanceKm": 10.0, "durationSec": 4336, "elevationM": 182, "avgHr": 144 }, { "date": "2024-10-26", "sport": "trail", "type": "entrainement", "distanceKm": 6.08, "durationSec": 2822, "elevationM": 91, "avgHr": 128 }, { "date": "2024-10-28", "sport": "trail", "type": "entrainement", "distanceKm": 9.29, "durationSec": 4670, "elevationM": 105, "avgHr": 151 }, { "date": "2024-10-29", "sport": "velo", "type": "entrainement", "distanceKm": 18.48, "durationSec": 3784, "elevationM": 200, "avgHr": 118 }, { "date": "2024-11-02", "sport": "trail", "type": "entrainement", "distanceKm": 9.62, "durationSec": 3901, "elevationM": 266, "avgHr": 164 }, { "date": "2024-11-03", "sport": "trail", "type": "entrainement", "distanceKm": 18.0, "durationSec": 7507, "elevationM": 219, "avgHr": 146 }, { "date": "2024-11-08", "sport": "trail", "type": "entrainement", "distanceKm": 5.75, "durationSec": 2567, "elevationM": 129, "avgHr": 136 }, { "date": "2024-11-10", "sport": "trail", "type": "entrainement", "distanceKm": 6.71, "durationSec": 3604, "elevationM": 44, "avgHr": 112 }, { "date": "2024-11-12", "sport": "trail", "type": "entrainement", "distanceKm": 4.37, "durationSec": 1813, "elevationM": 15, "avgHr": 135 }, { "date": "2024-11-17", "sport": "trail", "type": "entrainement", "distanceKm": 7.31, "durationSec": 3648, "elevationM": 66, "avgHr": 123 }, { "date": "2024-11-19", "sport": "trail", "type": "entrainement", "distanceKm": 4.84, "durationSec": 2041, "elevationM": 38, "avgHr": 140 }, { "date": "2024-11-23", "sport": "trail", "type": "entrainement", "distanceKm": 4.38, "durationSec": 2131, "elevationM": 55, "avgHr": 139 }, { "date": "2024-11-24", "sport": "trail", "type": "entrainement", "distanceKm": 12.87, "durationSec": 5617, "elevationM": 119, "avgHr": 145 }, { "date": "2024-11-26", "sport": "trail", "type": "entrainement", "distanceKm": 6.42, "durationSec": 2576, "elevationM": 32, "avgHr": 149 }, { "date": "2024-11-28", "sport": "trail", "type": "entrainement", "distanceKm": 4.4, "durationSec": 1982, "elevationM": 76, "avgHr": 132 }, { "date": "2024-11-29", "sport": "trail", "type": "entrainement", "distanceKm": 3.63, "durationSec": 1478, "elevationM": 27, "avgHr": 135 }, { "date": "2024-11-30", "sport": "trail", "type": "entrainement", "distanceKm": 8.76, "durationSec": 3414, "elevationM": 145, "avgHr": 157 }, { "date": "2024-12-03", "sport": "trail", "type": "entrainement", "distanceKm": 3.43, "durationSec": 1549, "elevationM": 69, "avgHr": 125 }, { "date": "2024-12-05", "sport": "trail", "type": "entrainement", "distanceKm": 3.08, "durationSec": 1261, "elevationM": 24, "avgHr": 137 }, { "date": "2024-12-06", "sport": "trail", "type": "entrainement", "distanceKm": 3.37, "durationSec": 1517, "elevationM": 34, "avgHr": 129 }, { "date": "2024-12-07", "sport": "trail", "type": "entrainement", "distanceKm": 8.92, "durationSec": 3676, "elevationM": 123, "avgHr": 148 }, { "date": "2024-12-13", "sport": "trail", "type": "entrainement", "distanceKm": 13.35, "durationSec": 5670, "elevationM": 122, "avgHr": 141 }, { "date": "2024-12-15", "sport": "trail", "type": "entrainement", "distanceKm": 4.64, "durationSec": 2626, "elevationM": 87, "avgHr": 121 }, { "date": "2024-12-18", "sport": "trail", "type": "entrainement", "distanceKm": 5.91, "durationSec": 2344, "elevationM": 67, "avgHr": 145 }, { "date": "2024-12-19", "sport": "trail", "type": "entrainement", "distanceKm": 4.4, "durationSec": 1831, "elevationM": 52, "avgHr": 136 }, { "date": "2024-12-20", "sport": "trail", "type": "entrainement", "distanceKm": 6.45, "durationSec": 2461, "elevationM": 36, "avgHr": 148 }, { "date": "2024-12-22", "sport": "trail", "type": "entrainement", "distanceKm": 19.68, "durationSec": 8121, "elevationM": 294, "avgHr": 149 }, { "date": "2024-12-24", "sport": "trail", "type": "entrainement", "distanceKm": 6.38, "durationSec": 2523, "elevationM": 37, "avgHr": 142 }, { "date": "2024-12-26", "sport": "trail", "type": "entrainement", "distanceKm": 4.47, "durationSec": 2007, "elevationM": 81, "avgHr": 129 }, { "date": "2024-12-28", "sport": "trail", "type": "entrainement", "distanceKm": 3.32, "durationSec": 1462, "elevationM": 38, "avgHr": 133 }, { "date": "2024-12-29", "sport": "trail", "type": "entrainement", "distanceKm": 18.14, "durationSec": 7317, "elevationM": 288, "avgHr": 155 }, { "date": "2024-12-31", "sport": "trail", "type": "entrainement", "distanceKm": 3.68, "durationSec": 1623, "elevationM": 34, "avgHr": 131 }, { "date": "2025-01-04", "sport": "trail", "type": "entrainement", "distanceKm": 4.0, "durationSec": 1817, "elevationM": 98, "avgHr": 139 }, { "date": "2025-01-05", "sport": "trail", "type": "entrainement", "distanceKm": 12.29, "durationSec": 5148, "elevationM": 125, "avgHr": 150 }, { "date": "2025-01-07", "sport": "trail", "type": "entrainement", "distanceKm": 5.42, "durationSec": 2148, "elevationM": 101, "avgHr": 145 }, { "date": "2025-01-09", "sport": "trail", "type": "entrainement", "distanceKm": 8.3, "durationSec": 3371, "elevationM": 0, "avgHr": 156 }, { "date": "2025-01-10", "sport": "trail", "type": "entrainement", "distanceKm": 4.18, "durationSec": 1994, "elevationM": 129, "avgHr": 134 }, { "date": "2025-01-12", "sport": "trail", "type": "entrainement", "distanceKm": 21.3, "durationSec": 9174, "elevationM": 243, "avgHr": 138 }, { "date": "2025-01-14", "sport": "trail", "type": "entrainement", "distanceKm": 10.0, "durationSec": 4038, "elevationM": 162, "avgHr": 143 }, { "date": "2025-01-16", "sport": "trail", "type": "entrainement", "distanceKm": 1.63, "durationSec": 792, "elevationM": 0, "avgHr": 145 }, { "date": "2025-01-17", "sport": "trail", "type": "entrainement", "distanceKm": 5.05, "durationSec": 2289, "elevationM": 82, "avgHr": 134 }, { "date": "2025-01-19", "sport": "trail", "type": "entrainement", "distanceKm": 7.3, "durationSec": 3029, "elevationM": 200, "avgHr": 157 }, { "date": "2025-01-21", "sport": "trail", "type": "entrainement", "distanceKm": 8.34, "durationSec": 3455, "elevationM": 5, "avgHr": 147 }, { "date": "2025-01-23", "sport": "trail", "type": "entrainement", "distanceKm": 5.0, "durationSec": 2161, "elevationM": 37, "avgHr": 145 }, { "date": "2025-01-25", "sport": "trail", "type": "entrainement", "distanceKm": 15.14, "durationSec": 11662, "elevationM": 856, "avgHr": 145 }, { "date": "2025-02-02", "sport": "trail", "type": "entrainement", "distanceKm": 18.0, "durationSec": 7741, "elevationM": 437, "avgHr": 146 }, { "date": "2025-02-11", "sport": "trail", "type": "entrainement", "distanceKm": 3.6, "durationSec": 1671, "elevationM": 42, "avgHr": 128 }, { "date": "2025-02-14", "sport": "trail", "type": "entrainement", "distanceKm": 6.57, "durationSec": 3002, "elevationM": 202, "avgHr": 139 }, { "date": "2025-02-16", "sport": "trail", "type": "entrainement", "distanceKm": 13.2, "durationSec": 6054, "elevationM": 329, "avgHr": 142 }, { "date": "2025-02-18", "sport": "trail", "type": "entrainement", "distanceKm": 6.16, "durationSec": 3110, "elevationM": 45, "avgHr": 123 }, { "date": "2025-02-21", "sport": "trail", "type": "entrainement", "distanceKm": 6.38, "durationSec": 2899, "elevationM": 137, "avgHr": 139 }, { "date": "2025-02-23", "sport": "trail", "type": "entrainement", "distanceKm": 15.85, "durationSec": 6350, "elevationM": 130, "avgHr": 149 }, { "date": "2025-02-25", "sport": "trail", "type": "entrainement", "distanceKm": 4.78, "durationSec": 2119, "elevationM": 101, "avgHr": 134 }, { "date": "2025-02-28", "sport": "trail", "type": "entrainement", "distanceKm": 5.0, "durationSec": 2217, "elevationM": 118, "avgHr": 133 }, { "date": "2025-03-02", "sport": "trail", "type": "entrainement", "distanceKm": 9.06, "durationSec": 4503, "elevationM": 278, "avgHr": 139 }, { "date": "2025-03-05", "sport": "trail", "type": "entrainement", "distanceKm": 6.24, "durationSec": 2487, "elevationM": 106, "avgHr": 142 }, { "date": "2025-03-07", "sport": "trail", "type": "entrainement", "distanceKm": 7.74, "durationSec": 3049, "elevationM": 150, "avgHr": 151 }, { "date": "2025-03-09", "sport": "trail", "type": "entrainement", "distanceKm": 14.68, "durationSec": 6633, "elevationM": 349, "avgHr": 143 }, { "date": "2025-03-11", "sport": "trail", "type": "entrainement", "distanceKm": 4.98, "durationSec": 2299, "elevationM": 101, "avgHr": 135 }, { "date": "2025-03-13", "sport": "trail", "type": "entrainement", "distanceKm": 3.32, "durationSec": 1425, "elevationM": 36, "avgHr": 134 }, { "date": "2025-03-14", "sport": "trail", "type": "entrainement", "distanceKm": 6.17, "durationSec": 2742, "elevationM": 174, "avgHr": 135 }, { "date": "2025-03-16", "sport": "trail", "type": "entrainement", "distanceKm": 16.63, "durationSec": 7655, "elevationM": 399, "avgHr": 142 }, { "date": "2025-03-17", "sport": "trail", "type": "entrainement", "distanceKm": 4.11, "durationSec": 1862, "elevationM": 69, "avgHr": 127 }, { "date": "2025-03-19", "sport": "trail", "type": "entrainement", "distanceKm": 6.83, "durationSec": 2750, "elevationM": 110, "avgHr": 151 }, { "date": "2025-03-21", "sport": "trail", "type": "entrainement", "distanceKm": 5.21, "durationSec": 2308, "elevationM": 76, "avgHr": 139 }, { "date": "2025-03-23", "sport": "trail", "type": "entrainement", "distanceKm": 18.93, "durationSec": 7776, "elevationM": 425, "avgHr": 163 }, { "date": "2025-03-26", "sport": "trail", "type": "entrainement", "distanceKm": 6.77, "durationSec": 3000, "elevationM": 141, "avgHr": 132 }, { "date": "2025-03-28", "sport": "trail", "type": "entrainement", "distanceKm": 3.81, "durationSec": 1721, "elevationM": 86, "avgHr": 136 }, { "date": "2025-03-30", "sport": "trail", "type": "entrainement", "distanceKm": 13.36, "durationSec": 6478, "elevationM": 118, "avgHr": 128 }, { "date": "2025-03-31", "sport": "trail", "type": "entrainement", "distanceKm": 5.26, "durationSec": 2111, "elevationM": 63, "avgHr": 147 }, { "date": "2025-04-02", "sport": "trail", "type": "entrainement", "distanceKm": 6.44, "durationSec": 2699, "elevationM": 113, "avgHr": 142 }, { "date": "2025-04-04", "sport": "trail", "type": "entrainement", "distanceKm": 4.72, "durationSec": 1737, "elevationM": 48, "avgHr": 150 }, { "date": "2025-04-06", "sport": "trail", "type": "entrainement", "distanceKm": 21.61, "durationSec": 8741, "elevationM": 366, "avgHr": 146 }, { "date": "2025-04-09", "sport": "trail", "type": "entrainement", "distanceKm": 7.66, "durationSec": 2998, "elevationM": 125, "avgHr": 146 }, { "date": "2025-04-12", "sport": "trail", "type": "entrainement", "distanceKm": 5.54, "durationSec": 2458, "elevationM": 112, "avgHr": 135 }, { "date": "2025-04-13", "sport": "trail", "type": "entrainement", "distanceKm": 6.31, "durationSec": 3009, "elevationM": 72, "avgHr": 115 }, { "date": "2025-04-17", "sport": "trail", "type": "entrainement", "distanceKm": 8.06, "durationSec": 3497, "elevationM": 190, "avgHr": 140 }, { "date": "2025-04-18", "sport": "trail", "type": "entrainement", "distanceKm": 20.8, "durationSec": 8879, "elevationM": 332, "avgHr": 143 }, { "date": "2025-04-23", "sport": "trail", "type": "entrainement", "distanceKm": 5.0, "durationSec": 2140, "elevationM": 98, "avgHr": 129 }, { "date": "2025-04-25", "sport": "trail", "type": "entrainement", "distanceKm": 5.83, "durationSec": 2431, "elevationM": 95, "avgHr": 131 }, { "date": "2025-04-27", "sport": "trail", "type": "entrainement", "distanceKm": 9.63, "durationSec": 4252, "elevationM": 180, "avgHr": 136 }, { "date": "2025-04-30", "sport": "trail", "type": "entrainement", "distanceKm": 6.71, "durationSec": 2563, "elevationM": 60, "avgHr": 157 }, { "date": "2025-05-02", "sport": "trail", "type": "entrainement", "distanceKm": 9.04, "durationSec": 3859, "elevationM": 127, "avgHr": 149 }, { "date": "2025-05-05", "sport": "trail", "type": "entrainement", "distanceKm": 17.7, "durationSec": 7619, "elevationM": 398, "avgHr": 145 }, { "date": "2025-05-07", "sport": "trail", "type": "entrainement", "distanceKm": 5.05, "durationSec": 2308, "elevationM": 49, "avgHr": 127 }, { "date": "2025-05-08", "sport": "trail", "type": "entrainement", "distanceKm": 8.21, "durationSec": 3354, "elevationM": 119, "avgHr": 141 }, { "date": "2025-05-11", "sport": "trail", "type": "entrainement", "distanceKm": 17.0, "durationSec": 7738, "elevationM": 281, "avgHr": 141 }, { "date": "2025-05-12", "sport": "trail", "type": "entrainement", "distanceKm": 4.51, "durationSec": 1906, "elevationM": 81, "avgHr": 127 }, { "date": "2025-05-14", "sport": "trail", "type": "entrainement", "distanceKm": 15.0, "durationSec": 6467, "elevationM": 264, "avgHr": 149 }, { "date": "2025-05-15", "sport": "trail", "type": "entrainement", "distanceKm": 18.97, "durationSec": 8452, "elevationM": 400, "avgHr": 137 }, { "date": "2025-05-18", "sport": "trail", "type": "entrainement", "distanceKm": 5.7, "durationSec": 2241, "elevationM": 46, "avgHr": 135 }, { "date": "2025-05-19", "sport": "trail", "type": "entrainement", "distanceKm": 4.31, "durationSec": 1725, "elevationM": 68, "avgHr": 142 }, { "date": "2025-05-21", "sport": "trail", "type": "entrainement", "distanceKm": 16.56, "durationSec": 6819, "elevationM": 298, "avgHr": 147 }, { "date": "2025-05-27", "sport": "trail", "type": "entrainement", "distanceKm": 3.66, "durationSec": 1495, "elevationM": 43, "avgHr": 135 }, { "date": "2025-05-28", "sport": "trail", "type": "entrainement", "distanceKm": 23.0, "durationSec": 9202, "elevationM": 236, "avgHr": 147 }, { "date": "2025-05-29", "sport": "trail", "type": "entrainement", "distanceKm": 22.94, "durationSec": 10932, "elevationM": 442, "avgHr": 130 }, { "date": "2025-06-01", "sport": "trail", "type": "entrainement", "distanceKm": 10.0, "durationSec": 4968, "elevationM": 111, "avgHr": 133 }, { "date": "2025-06-03", "sport": "trail", "type": "entrainement", "distanceKm": 3.33, "durationSec": 1314, "elevationM": 38, "avgHr": 131 }, { "date": "2025-06-05", "sport": "trail", "type": "entrainement", "distanceKm": 5.86, "durationSec": 2337, "elevationM": 117, "avgHr": 145 }, { "date": "2025-06-06", "sport": "trail", "type": "entrainement", "distanceKm": 6.75, "durationSec": 2715, "elevationM": 60, "avgHr": 141 }, { "date": "2025-06-10", "sport": "trail", "type": "entrainement", "distanceKm": 15.54, "durationSec": 6408, "elevationM": 55, "avgHr": 144 }, { "date": "2025-06-11", "sport": "trail", "type": "entrainement", "distanceKm": 4.19, "durationSec": 1644, "elevationM": 48, "avgHr": 141 }, { "date": "2025-06-13", "sport": "trail", "type": "entrainement", "distanceKm": 5.45, "durationSec": 2177, "elevationM": 82, "avgHr": 147 }, { "date": "2025-06-16", "sport": "trail", "type": "entrainement", "distanceKm": 3.11, "durationSec": 1244, "elevationM": 0, "avgHr": 151 }, { "date": "2025-06-18", "sport": "trail", "type": "entrainement", "distanceKm": 5.34, "durationSec": 2219, "elevationM": 102, "avgHr": 144 }, { "date": "2025-06-19", "sport": "trail", "type": "entrainement", "distanceKm": 7.3, "durationSec": 3125, "elevationM": 166, "avgHr": 146 }, { "date": "2025-06-23", "sport": "trail", "type": "entrainement", "distanceKm": 12.12, "durationSec": 5110, "elevationM": 149, "avgHr": 139 }, { "date": "2025-06-24", "sport": "trail", "type": "entrainement", "distanceKm": 4.58, "durationSec": 2579, "elevationM": 92, "avgHr": 110 }, { "date": "2025-06-25", "sport": "trail", "type": "entrainement", "distanceKm": 9.34, "durationSec": 3738, "elevationM": 76, "avgHr": 148 }, { "date": "2025-06-26", "sport": "trail", "type": "entrainement", "distanceKm": 3.28, "durationSec": 1367, "elevationM": 26, "avgHr": 138 }, { "date": "2025-06-27", "sport": "trail", "type": "entrainement", "distanceKm": 5.43, "durationSec": 2292, "elevationM": 90, "avgHr": 130 }, { "date": "2025-06-30", "sport": "trail", "type": "entrainement", "distanceKm": 4.05, "durationSec": 1677, "elevationM": 55, "avgHr": 143 }, { "date": "2025-07-02", "sport": "trail", "type": "entrainement", "distanceKm": 8.03, "durationSec": 4954, "elevationM": 461, "avgHr": 150 }, { "date": "2025-07-05", "sport": "trail", "type": "entrainement", "distanceKm": 24.56, "durationSec": 21410, "elevationM": 1709, "avgHr": 145 }, { "date": "2025-07-17", "sport": "trail", "type": "entrainement", "distanceKm": 3.86, "durationSec": 1602, "elevationM": 45, "avgHr": 140 }, { "date": "2025-07-19", "sport": "trail", "type": "entrainement", "distanceKm": 4.23, "durationSec": 1879, "elevationM": 89, "avgHr": 134 }, { "date": "2025-07-22", "sport": "trail", "type": "entrainement", "distanceKm": 3.87, "durationSec": 1781, "elevationM": 0, "avgHr": 153 }, { "date": "2025-07-24", "sport": "trail", "type": "entrainement", "distanceKm": 4.78, "durationSec": 1938, "elevationM": 60, "avgHr": 148 }, { "date": "2025-07-27", "sport": "trail", "type": "entrainement", "distanceKm": 6.26, "durationSec": 2660, "elevationM": 118, "avgHr": 142 }, { "date": "2025-07-29", "sport": "trail", "type": "entrainement", "distanceKm": 5.48, "durationSec": 2302, "elevationM": 106, "avgHr": 147 }, { "date": "2025-08-03", "sport": "trail", "type": "entrainement", "distanceKm": 6.6, "durationSec": 3245, "elevationM": 35, "avgHr": 123 }, { "date": "2025-08-05", "sport": "trail", "type": "entrainement", "distanceKm": 6.36, "durationSec": 2519, "elevationM": 113, "avgHr": 155 }, { "date": "2025-08-08", "sport": "trail", "type": "entrainement", "distanceKm": 6.31, "durationSec": 3249, "elevationM": 21, "avgHr": 130 }, { "date": "2025-08-14", "sport": "trail", "type": "entrainement", "distanceKm": 6.85, "durationSec": 3182, "elevationM": 140, "avgHr": 145 }, { "date": "2025-08-17", "sport": "trail", "type": "entrainement", "distanceKm": 7.41, "durationSec": 2963, "elevationM": 110, "avgHr": 153 }, { "date": "2025-08-20", "sport": "trail", "type": "entrainement", "distanceKm": 10.01, "durationSec": 4291, "elevationM": 192, "avgHr": 143 }, { "date": "2025-08-26", "sport": "trail", "type": "entrainement", "distanceKm": 4.97, "durationSec": 2132, "elevationM": 92, "avgHr": 143 }, { "date": "2025-09-01", "sport": "trail", "type": "entrainement", "distanceKm": 6.06, "durationSec": 2619, "elevationM": 81, "avgHr": 139 }, { "date": "2025-09-03", "sport": "trail", "type": "entrainement", "distanceKm": 4.59, "durationSec": 1983, "elevationM": 71, "avgHr": 146 }, { "date": "2025-09-06", "sport": "trail", "type": "entrainement", "distanceKm": 7.43, "durationSec": 6270, "elevationM": 353, "avgHr": 147 }, { "date": "2025-09-07", "sport": "trail", "type": "entrainement", "distanceKm": 7.44, "durationSec": 3957, "elevationM": 201, "avgHr": 165 }, { "date": "2025-09-09", "sport": "trail", "type": "entrainement", "distanceKm": 3.34, "durationSec": 1356, "elevationM": 46, "avgHr": 136 }, { "date": "2025-09-12", "sport": "trail", "type": "entrainement", "distanceKm": 4.34, "durationSec": 1710, "elevationM": 49, "avgHr": 140 }, { "date": "2025-09-14", "sport": "trail", "type": "entrainement", "distanceKm": 8.17, "durationSec": 3646, "elevationM": 124, "avgHr": 141 }, { "date": "2025-09-16", "sport": "trail", "type": "entrainement", "distanceKm": 6.23, "durationSec": 2418, "elevationM": 109, "avgHr": 147 }, { "date": "2025-09-19", "sport": "trail", "type": "entrainement", "distanceKm": 10.01, "durationSec": 4270, "elevationM": 211, "avgHr": 150 }, { "date": "2025-09-23", "sport": "trail", "type": "entrainement", "distanceKm": 5.01, "durationSec": 1963, "elevationM": 89, "avgHr": 157 }, { "date": "2025-09-25", "sport": "trail", "type": "entrainement", "distanceKm": 5.95, "durationSec": 2407, "elevationM": 98, "avgHr": 143 }, { "date": "2025-09-27", "sport": "trail", "type": "entrainement", "distanceKm": 15.01, "durationSec": 6656, "elevationM": 305, "avgHr": 144 }, { "date": "2025-10-01", "sport": "trail", "type": "entrainement", "distanceKm": 4.3, "durationSec": 1851, "elevationM": 99, "avgHr": 140 }, { "date": "2025-10-02", "sport": "velo", "type": "entrainement", "distanceKm": 19.46, "durationSec": 3542, "elevationM": 212, "avgHr": 126 }, { "date": "2025-10-05", "sport": "trail", "type": "entrainement", "distanceKm": 19.79, "durationSec": 10544, "elevationM": 807, "avgHr": 157 }, { "date": "2025-10-22", "sport": "trail", "type": "entrainement", "distanceKm": 5.07, "durationSec": 2373, "elevationM": 65, "avgHr": 134 }, { "date": "2025-10-25", "sport": "trail", "type": "entrainement", "distanceKm": 9.42, "durationSec": 3939, "elevationM": 107, "avgHr": 143 }, { "date": "2025-10-26", "sport": "trail", "type": "entrainement", "distanceKm": 5.09, "durationSec": 2352, "elevationM": 92, "avgHr": 131 }, { "date": "2025-10-27", "sport": "trail", "type": "entrainement", "distanceKm": 6.66, "durationSec": 2885, "elevationM": 85, "avgHr": 150 }, { "date": "2025-10-29", "sport": "trail", "type": "entrainement", "distanceKm": 4.84, "durationSec": 2402, "elevationM": 33, "avgHr": 125 }, { "date": "2025-10-30", "sport": "trail", "type": "entrainement", "distanceKm": 7.05, "durationSec": 2886, "elevationM": 124, "avgHr": 147 }, { "date": "2025-11-01", "sport": "trail", "type": "entrainement", "distanceKm": 8.93, "durationSec": 3618, "elevationM": 230, "avgHr": 158 }, { "date": "2025-11-04", "sport": "trail", "type": "entrainement", "distanceKm": 7.3, "durationSec": 2850, "elevationM": 88, "avgHr": 141 }, { "date": "2025-11-05", "sport": "trail", "type": "entrainement", "distanceKm": 5.58, "durationSec": 2407, "elevationM": 0, "avgHr": 133 }, { "date": "2025-11-07", "sport": "trail", "type": "entrainement", "distanceKm": 9.6, "durationSec": 3748, "elevationM": 111, "avgHr": 147 }, { "date": "2025-11-09", "sport": "trail", "type": "entrainement", "distanceKm": 8.6, "durationSec": 4036, "elevationM": 24, "avgHr": 124 }, { "date": "2025-11-10", "sport": "trail", "type": "entrainement", "distanceKm": 6.04, "durationSec": 2418, "elevationM": 99, "avgHr": 141 }, { "date": "2025-11-14", "sport": "trail", "type": "entrainement", "distanceKm": 2.78, "durationSec": 1302, "elevationM": 52, "avgHr": 126 }, { "date": "2025-11-15", "sport": "trail", "type": "entrainement", "distanceKm": 6.1, "durationSec": 2403, "elevationM": 80, "avgHr": 139 }, { "date": "2025-11-16", "sport": "trail", "type": "entrainement", "distanceKm": 9.34, "durationSec": 4190, "elevationM": 179, "avgHr": 139 }, { "date": "2025-11-18", "sport": "velo", "type": "entrainement", "distanceKm": 21.65, "durationSec": 3968, "elevationM": 181, "avgHr": 126 }, { "date": "2025-11-19", "sport": "trail", "type": "entrainement", "distanceKm": 9.57, "durationSec": 4027, "elevationM": 145, "avgHr": 140 }, { "date": "2025-11-20", "sport": "trail", "type": "entrainement", "distanceKm": 3.66, "durationSec": 1737, "elevationM": 78, "avgHr": 123 }, { "date": "2025-11-21", "sport": "velo", "type": "entrainement", "distanceKm": 20.83, "durationSec": 4770, "elevationM": 342, "avgHr": 130 }, { "date": "2025-11-24", "sport": "trail", "type": "entrainement", "distanceKm": 5.25, "durationSec": 2223, "elevationM": 58, "avgHr": 139 }, { "date": "2025-11-25", "sport": "trail", "type": "entrainement", "distanceKm": 9.43, "durationSec": 3962, "elevationM": 180, "avgHr": 138 }, { "date": "2025-11-27", "sport": "trail", "type": "entrainement", "distanceKm": 10.01, "durationSec": 4068, "elevationM": 189, "avgHr": 140 }, { "date": "2025-11-29", "sport": "trail", "type": "entrainement", "distanceKm": 10.74, "durationSec": 4631, "elevationM": 208, "avgHr": 137 }, { "date": "2025-12-02", "sport": "trail", "type": "entrainement", "distanceKm": 9.33, "durationSec": 3662, "elevationM": 112, "avgHr": 142 }, { "date": "2025-12-03", "sport": "trail", "type": "entrainement", "distanceKm": 6.99, "durationSec": 2747, "elevationM": 60, "avgHr": 143 }, { "date": "2025-12-05", "sport": "trail", "type": "entrainement", "distanceKm": 7.73, "durationSec": 3065, "elevationM": 17, "avgHr": 144 }, { "date": "2025-12-07", "sport": "trail", "type": "entrainement", "distanceKm": 10.14, "durationSec": 4187, "elevationM": 157, "avgHr": 134 }, { "date": "2025-12-09", "sport": "trail", "type": "entrainement", "distanceKm": 10.0, "durationSec": 4092, "elevationM": 115, "avgHr": 133 }, { "date": "2025-12-10", "sport": "trail", "type": "entrainement", "distanceKm": 4.03, "durationSec": 1688, "elevationM": 22, "avgHr": 127 }, { "date": "2025-12-12", "sport": "trail", "type": "entrainement", "distanceKm": 10.94, "durationSec": 4477, "elevationM": 227, "avgHr": 136 }, { "date": "2025-12-14", "sport": "trail", "type": "entrainement", "distanceKm": 13.8, "durationSec": 6307, "elevationM": 236, "avgHr": 129 }, { "date": "2025-12-16", "sport": "velo", "type": "entrainement", "distanceKm": 13.42, "durationSec": 3168, "elevationM": 270, "avgHr": 130 }, { "date": "2025-12-17", "sport": "trail", "type": "entrainement", "distanceKm": 3.07, "durationSec": 1217, "elevationM": 22, "avgHr": 125 }, { "date": "2025-12-19", "sport": "trail", "type": "entrainement", "distanceKm": 7.45, "durationSec": 2961, "elevationM": 130, "avgHr": 141 }, { "date": "2025-12-21", "sport": "velo", "type": "entrainement", "distanceKm": 44.54, "durationSec": 9658, "elevationM": 600, "avgHr": 119 }, { "date": "2025-12-23", "sport": "trail", "type": "entrainement", "distanceKm": 5.59, "durationSec": 2401, "elevationM": 102, "avgHr": 130 }, { "date": "2025-12-24", "sport": "trail", "type": "entrainement", "distanceKm": 7.61, "durationSec": 3843, "elevationM": 288, "avgHr": 129 }, { "date": "2025-12-26", "sport": "trail", "type": "entrainement", "distanceKm": 9.24, "durationSec": 3924, "elevationM": 204, "avgHr": 134 }, { "date": "2025-12-28", "sport": "trail", "type": "entrainement", "distanceKm": 9.27, "durationSec": 4239, "elevationM": 87, "avgHr": 125 }, { "date": "2025-12-29", "sport": "trail", "type": "entrainement", "distanceKm": 12.56, "durationSec": 5723, "elevationM": 270, "avgHr": 132 }, { "date": "2025-12-31", "sport": "trail", "type": "entrainement", "distanceKm": 7.5, "durationSec": 3812, "elevationM": 165, "avgHr": 130 }, { "date": "2026-01-02", "sport": "trail", "type": "entrainement", "distanceKm": 9.47, "durationSec": 3981, "elevationM": 165, "avgHr": 136 }, { "date": "2026-01-04", "sport": "trail", "type": "entrainement", "distanceKm": 11.24, "durationSec": 5081, "elevationM": 206, "avgHr": 141 }, { "date": "2026-01-06", "sport": "trail", "type": "entrainement", "distanceKm": 7.52, "durationSec": 3374, "elevationM": 123, "avgHr": 130 }, { "date": "2026-01-07", "sport": "trail", "type": "entrainement", "distanceKm": 2.27, "durationSec": 987, "elevationM": 25, "avgHr": 126 }, { "date": "2026-01-12", "sport": "trail", "type": "entrainement", "distanceKm": 6.57, "durationSec": 2671, "elevationM": 90, "avgHr": 140 }, { "date": "2026-01-16", "sport": "trail", "type": "entrainement", "distanceKm": 4.6, "durationSec": 2113, "elevationM": 69, "avgHr": 128 }, { "date": "2026-01-17", "sport": "trail", "type": "entrainement", "distanceKm": 1.65, "durationSec": 819, "elevationM": 24, "avgHr": 104 }, { "date": "2026-01-18", "sport": "trail", "type": "entrainement", "distanceKm": 20.49, "durationSec": 8762, "elevationM": 579, "avgHr": 167 }, { "date": "2026-01-26", "sport": "trail", "type": "entrainement", "distanceKm": 5.66, "durationSec": 2435, "elevationM": 158, "avgHr": 143 }, { "date": "2026-01-27", "sport": "trail", "type": "entrainement", "distanceKm": 6.43, "durationSec": 2638, "elevationM": 101, "avgHr": 144 }, { "date": "2026-01-29", "sport": "trail", "type": "entrainement", "distanceKm": 10.0, "durationSec": 4698, "elevationM": 217, "avgHr": 133 }, { "date": "2026-02-01", "sport": "trail", "type": "entrainement", "distanceKm": 1.51, "durationSec": 399, "elevationM": 6, "avgHr": 161 }, { "date": "2026-02-01", "sport": "trail", "type": "entrainement", "distanceKm": 5.47, "durationSec": 3748, "elevationM": 22, "avgHr": 100 }, { "date": "2026-02-03", "sport": "trail", "type": "entrainement", "distanceKm": 7.11, "durationSec": 3326, "elevationM": 189, "avgHr": 135 }, { "date": "2026-02-04", "sport": "trail", "type": "entrainement", "distanceKm": 8.35, "durationSec": 3465, "elevationM": 164, "avgHr": 142 }, { "date": "2026-02-06", "sport": "trail", "type": "entrainement", "distanceKm": 5.77, "durationSec": 2524, "elevationM": 107, "avgHr": 132 }, { "date": "2026-02-08", "sport": "trail", "type": "entrainement", "distanceKm": 4.24, "durationSec": 1755, "elevationM": 53, "avgHr": 124 }, { "date": "2026-02-10", "sport": "trail", "type": "entrainement", "distanceKm": 7.26, "durationSec": 3638, "elevationM": 215, "avgHr": 137 }, { "date": "2026-02-12", "sport": "trail", "type": "entrainement", "distanceKm": 8.29, "durationSec": 3144, "elevationM": 110, "avgHr": 145 }, { "date": "2026-02-13", "sport": "trail", "type": "entrainement", "distanceKm": 4.01, "durationSec": 1725, "elevationM": 63, "avgHr": 131 }, { "date": "2026-02-14", "sport": "trail", "type": "entrainement", "distanceKm": 11.5, "durationSec": 6811, "elevationM": 492, "avgHr": 125 }, { "date": "2026-02-17", "sport": "trail", "type": "entrainement", "distanceKm": 8.72, "durationSec": 3242, "elevationM": 92, "avgHr": 141 }, { "date": "2026-02-19", "sport": "trail", "type": "entrainement", "distanceKm": 11.3, "durationSec": 4560, "elevationM": 275, "avgHr": 148 }, { "date": "2026-02-20", "sport": "trail", "type": "entrainement", "distanceKm": 3.29, "durationSec": 1635, "elevationM": 62, "avgHr": 110 }, { "date": "2026-02-24", "sport": "trail", "type": "entrainement", "distanceKm": 6.45, "durationSec": 2606, "elevationM": 108, "avgHr": 139 }, { "date": "2026-02-25", "sport": "trail", "type": "entrainement", "distanceKm": 3.84, "durationSec": 1503, "elevationM": 48, "avgHr": 136 }, { "date": "2026-02-27", "sport": "trail", "type": "entrainement", "distanceKm": 2.41, "durationSec": 1035, "elevationM": 59, "avgHr": 136 }, { "date": "2026-02-28", "sport": "trail", "type": "entrainement", "distanceKm": 11.89, "durationSec": 4441, "elevationM": 280, "avgHr": 161 }, { "date": "2026-03-03", "sport": "trail", "type": "entrainement", "distanceKm": 8.44, "durationSec": 3540, "elevationM": 151, "avgHr": 132 }, { "date": "2026-03-05", "sport": "trail", "type": "entrainement", "distanceKm": 5.85, "durationSec": 2455, "elevationM": 95, "avgHr": 130 }, { "date": "2026-03-06", "sport": "trail", "type": "entrainement", "distanceKm": 6.17, "durationSec": 2821, "elevationM": 160, "avgHr": 140 }, { "date": "2026-03-08", "sport": "trail", "type": "entrainement", "distanceKm": 8.99, "durationSec": 3975, "elevationM": 120, "avgHr": 132 }, { "date": "2026-03-11", "sport": "trail", "type": "entrainement", "distanceKm": 5.55, "durationSec": 2482, "elevationM": 119, "avgHr": 127 }, { "date": "2026-03-12", "sport": "trail", "type": "entrainement", "distanceKm": 8.99, "durationSec": 3425, "elevationM": 160, "avgHr": 140 }, { "date": "2026-03-13", "sport": "trail", "type": "entrainement", "distanceKm": 4.49, "durationSec": 1961, "elevationM": 70, "avgHr": 129 }, { "date": "2026-03-15", "sport": "trail", "type": "entrainement", "distanceKm": 14.25, "durationSec": 7002, "elevationM": 350, "avgHr": 132 }, { "date": "2026-03-19", "sport": "trail", "type": "entrainement", "distanceKm": 5.81, "durationSec": 2431, "elevationM": 139, "avgHr": 140 }, { "date": "2026-03-22", "sport": "trail", "type": "entrainement", "distanceKm": 18.71, "durationSec": 7170, "elevationM": 430, "avgHr": 164 }, { "date": "2026-03-25", "sport": "trail", "type": "entrainement", "distanceKm": 5.54, "durationSec": 2314, "elevationM": 157, "avgHr": 130 }, { "date": "2026-03-26", "sport": "trail", "type": "entrainement", "distanceKm": 7.21, "durationSec": 2878, "elevationM": 177, "avgHr": 141 }, { "date": "2026-03-27", "sport": "trail", "type": "entrainement", "distanceKm": 4.22, "durationSec": 1680, "elevationM": 66, "avgHr": 132 }, { "date": "2026-03-29", "sport": "trail", "type": "entrainement", "distanceKm": 10.32, "durationSec": 4332, "elevationM": 170, "avgHr": 135 }, { "date": "2026-04-01", "sport": "trail", "type": "entrainement", "distanceKm": 6.3, "durationSec": 2700, "elevationM": 140, "avgHr": 132 }, { "date": "2026-04-02", "sport": "trail", "type": "entrainement", "distanceKm": 9.67, "durationSec": 3629, "elevationM": 158, "avgHr": 143 }, { "date": "2026-04-05", "sport": "trail", "type": "entrainement", "distanceKm": 15.0, "durationSec": 6287, "elevationM": 191, "avgHr": 137 }, { "date": "2026-04-07", "sport": "trail", "type": "entrainement", "distanceKm": 5.65, "durationSec": 2312, "elevationM": 79, "avgHr": 130 }, { "date": "2026-04-08", "sport": "trail", "type": "entrainement", "distanceKm": 9.9, "durationSec": 3941, "elevationM": 193, "avgHr": 144 }, { "date": "2026-04-10", "sport": "trail", "type": "entrainement", "distanceKm": 6.69, "durationSec": 2647, "elevationM": 27, "avgHr": 136 }, { "date": "2026-04-12", "sport": "trail", "type": "entrainement", "distanceKm": 3.32, "durationSec": 1320, "elevationM": 42, "avgHr": 121 }, { "date": "2026-04-13", "sport": "trail", "type": "entrainement", "distanceKm": 17.63, "durationSec": 7440, "elevationM": 324, "avgHr": 135 }, { "date": "2026-04-15", "sport": "trail", "type": "entrainement", "distanceKm": 2.88, "durationSec": 1200, "elevationM": 60, "avgHr": 128 }, { "date": "2026-04-19", "sport": "trail", "type": "entrainement", "distanceKm": 13.54, "durationSec": 6244, "elevationM": 240, "avgHr": 133 }, { "date": "2026-04-20", "sport": "trail", "type": "entrainement", "distanceKm": 20.54, "durationSec": 9068, "elevationM": 373, "avgHr": 135 }, { "date": "2026-04-22", "sport": "trail", "type": "entrainement", "distanceKm": 2.8, "durationSec": 1105, "elevationM": 62, "avgHr": 133 }, { "date": "2026-04-24", "sport": "trail", "type": "entrainement", "distanceKm": 3.31, "durationSec": 1349, "elevationM": 40, "avgHr": 128 }, { "date": "2026-04-26", "sport": "trail", "type": "entrainement", "distanceKm": 22.94, "durationSec": 10462, "elevationM": 893, "avgHr": 162 }, { "date": "2026-04-30", "sport": "trail", "type": "entrainement", "distanceKm": 3.88, "durationSec": 1697, "elevationM": 58, "avgHr": 119 }, { "date": "2026-05-02", "sport": "trail", "type": "entrainement", "distanceKm": 15.1, "durationSec": 7152, "elevationM": 430, "avgHr": 143 }, { "date": "2026-05-04", "sport": "trail", "type": "entrainement", "distanceKm": 19.48, "durationSec": 9449, "elevationM": 494, "avgHr": 136 }, { "date": "2026-05-07", "sport": "trail", "type": "entrainement", "distanceKm": 3.28, "durationSec": 1321, "elevationM": 36, "avgHr": 123 }, { "date": "2026-05-08", "sport": "trail", "type": "entrainement", "distanceKm": 7.45, "durationSec": 2838, "elevationM": 115, "avgHr": 137 }, { "date": "2026-05-10", "sport": "trail", "type": "entrainement", "distanceKm": 22.42, "durationSec": 11694, "elevationM": 522, "avgHr": 119 }, { "date": "2026-05-15", "sport": "trail", "type": "entrainement", "distanceKm": 3.71, "durationSec": 1486, "elevationM": 44, "avgHr": 127 }, { "date": "2026-05-17", "sport": "trail", "type": "entrainement", "distanceKm": 5.71, "durationSec": 2417, "elevationM": 141, "avgHr": 134 }, { "date": "2026-05-18", "sport": "trail", "type": "entrainement", "distanceKm": 5.56, "durationSec": 2904, "elevationM": 126, "avgHr": 111 }, { "date": "2026-05-29", "sport": "trail", "type": "entrainement", "distanceKm": 2.08, "durationSec": 851, "elevationM": 20, "avgHr": 134 }, { "date": "2026-05-30", "sport": "trail", "type": "entrainement", "distanceKm": 4.87, "durationSec": 3570, "elevationM": 77, "avgHr": 126 }, { "date": "2026-06-02", "sport": "trail", "type": "entrainement", "distanceKm": 3.36, "durationSec": 1249, "elevationM": 41, "avgHr": 134 }, { "date": "2026-06-03", "sport": "velo", "type": "entrainement", "distanceKm": 22.45, "durationSec": 3837, "elevationM": 228, "avgHr": 126 }, { "date": "2026-06-06", "sport": "trail", "type": "entrainement", "distanceKm": 21.68, "durationSec": 15663, "elevationM": 1199, "avgHr": 137 }, { "date": "2026-06-10", "sport": "trail", "type": "entrainement", "distanceKm": 3.61, "durationSec": 2172, "elevationM": 80, "avgHr": 116 }, { "date": "2026-06-11", "sport": "trail", "type": "entrainement", "distanceKm": 4.0, "durationSec": 2737, "elevationM": 51, "avgHr": 102 }, { "date": "2026-06-12", "sport": "velo", "type": "entrainement", "distanceKm": 9.7, "durationSec": 1773, "elevationM": 126, "avgHr": 129 }, { "date": "2026-06-16", "sport": "trail", "type": "entrainement", "distanceKm": 4.38, "durationSec": 1713, "elevationM": 51, "avgHr": 147 }, { "date": "2026-06-17", "sport": "velo", "type": "entrainement", "distanceKm": 15.98, "durationSec": 3092, "elevationM": 264, "avgHr": 0 }, { "date": "2026-06-18", "sport": "trail", "type": "entrainement", "distanceKm": 3.92, "durationSec": 1803, "elevationM": 55, "avgHr": 126 }, { "date": "2026-06-22", "sport": "trail", "type": "entrainement", "distanceKm": 2.69, "durationSec": 1207, "elevationM": 39, "avgHr": 129 }, { "date": "2026-06-24", "sport": "trail", "type": "entrainement", "distanceKm": 3.17, "durationSec": 1455, "elevationM": 60, "avgHr": 136 }, { "date": "2026-06-25", "sport": "velo", "type": "entrainement", "distanceKm": 6.42, "durationSec": 1305, "elevationM": 110, "avgHr": 0 }, { "date": "2026-06-26", "sport": "trail", "type": "entrainement", "distanceKm": 3.59, "durationSec": 1537, "elevationM": 71, "avgHr": 142 }, { "date": "2026-06-30", "sport": "trail", "type": "entrainement", "distanceKm": 6.28, "durationSec": 2826, "elevationM": 59, "avgHr": 0 }, { "date": "2026-07-02", "sport": "trail", "type": "entrainement", "distanceKm": 5.1, "durationSec": 2449, "elevationM": 59, "avgHr": 128 }, { "date": "2026-07-09", "sport": "trail", "type": "entrainement", "distanceKm": 3.72, "durationSec": 1505, "elevationM": 67, "avgHr": 147 }, { "date": "2026-07-11", "sport": "trail", "type": "entrainement", "distanceKm": 15.47, "durationSec": 9060, "elevationM": 194, "avgHr": 122 }, { "date": "2026-07-14", "sport": "trail", "type": "entrainement", "distanceKm": 4.55, "durationSec": 1898, "elevationM": 96, "avgHr": 143 }, { "date": "2026-07-16", "sport": "trail", "type": "entrainement", "distanceKm": 4.58, "durationSec": 1922, "elevationM": 89, "avgHr": 145 }, { "date": "2026-07-17", "sport": "velo", "type": "entrainement", "distanceKm": 26.94, "durationSec": 4991, "elevationM": 315, "avgHr": 131 }, { "date": "2026-07-21", "sport": "trail", "type": "entrainement", "distanceKm": 4.36, "durationSec": 1802, "elevationM": 65, "avgHr": 141 }, { "date": "2026-07-22", "sport": "trail", "type": "entrainement", "distanceKm": 7.7, "durationSec": 3603, "elevationM": 146, "avgHr": 142 }, { "date": "2026-07-23", "sport": "trail", "type": "entrainement", "distanceKm": 4.62, "durationSec": 1832, "elevationM": 58, "avgHr": 143 }, { "date": "2026-07-25", "sport": "trail", "type": "entrainement", "distanceKm": 4.31, "durationSec": 1801, "elevationM": 63, "avgHr": 142 }, { "date": "2026-07-28", "sport": "trail", "type": "entrainement", "distanceKm": 5.71, "durationSec": 2376, "elevationM": 70, "avgHr": 147 }, { "date": "2026-07-29", "sport": "trail", "type": "entrainement", "distanceKm": 7.03, "durationSec": 3153, "elevationM": 81, "avgHr": 147 }, { "date": "2026-07-31", "sport": "trail", "type": "entrainement", "distanceKm": 5.39, "durationSec": 2402, "elevationM": 109, "avgHr": 144 }, { "date": "2026-08-02", "sport": "trail", "type": "entrainement", "distanceKm": 8.01, "durationSec": 3585, "elevationM": 127, "avgHr": 135 }, { "date": "2026-08-06", "sport": "trail", "type": "entrainement", "distanceKm": 6.23, "durationSec": 2404, "elevationM": 96, "avgHr": 142 }, { "date": "2026-08-16", "sport": "trail", "type": "entrainement", "distanceKm": 5.23, "durationSec": 2401, "elevationM": 76, "avgHr": 129 }, { "date": "2026-08-19", "sport": "trail", "type": "entrainement", "distanceKm": 3.88, "durationSec": 1501, "elevationM": 59, "avgHr": 144 }],
    },
];
export default function RunningCairn() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saveError, setSaveError] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [openMonths, setOpenMonths] = useState(new Set());
    const [statPeriod, setStatPeriod] = useState('semaine');
    const [focusMonthKey, setFocusMonthKey] = useState(monthKey(todayISO()));
    const [focusWeekKey, setFocusWeekKey] = useState(weekKey(todayISO()));
    const [focusYear, setFocusYear] = useState(new Date(todayISO()).getFullYear());
    const [chartType, setChartType] = useState('bar');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [sport, setSport] = useState('trail');
    const [entryType, setEntryType] = useState('entrainement');
    const [date, setDate] = useState(todayISO());
    const [distance, setDistance] = useState('');
    const [hh, setHh] = useState('');
    const [mm, setMm] = useState('');
    const [ss, setSs] = useState('');
    const [elevation, setElevation] = useState('');
    const [avgHr, setAvgHr] = useState('');
    const [formError, setFormError] = useState('');
    useEffect(() => {
        (async () => {
            let cleared = true;
            try {
                await window.storage.get('running-cairn-demo-cleared', false);
            }
            catch (e) {
                cleared = false;
            }
            let list = [];
            if (!cleared) {
                try {
                    await window.storage.set(STORAGE_KEY, JSON.stringify([]), false);
                    await window.storage.set('running-cairn-demo-cleared', 'true', false);
                }
                catch (e) { /* ignore */ }
            }
            else {
                try {
                    const res = await window.storage.get(STORAGE_KEY, false);
                    list = res ? JSON.parse(res.value) : [];
                }
                catch (e) {
                    list = [];
                }
            }
            let changed = false;
            for (const batch of SEED_BATCHES) {
                let already = true;
                try {
                    await window.storage.get(batch.key, false);
                }
                catch (e) {
                    already = false;
                }
                if (!already) {
                    list = [...list, ...batch.activities.map(a => ({ ...a, id: uid() }))];
                    changed = true;
                    try {
                        await window.storage.set(batch.key, 'true', false);
                    }
                    catch (e) { /* ignore */ }
                }
            }
            if (changed) {
                try {
                    await window.storage.set(STORAGE_KEY, JSON.stringify(list), false);
                }
                catch (e) { /* ignore */ }
            }
            setActivities(list);
            if (list.length > 0) {
                const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
                setOpenMonths(new Set([monthKey(sorted[0].date)]));
            }
            setLoading(false);
        })();
    }, []);
    async function persist(newList) {
        setActivities(newList);
        try {
            const result = await window.storage.set(STORAGE_KEY, JSON.stringify(newList), false);
            if (!result)
                setSaveError(true);
            else
                setSaveError(false);
        }
        catch (e) {
            setSaveError(true);
        }
    }
    function resetForm() {
        setEntryType('entrainement');
        setDate(todayISO());
        setDistance('');
        setHh('');
        setMm('');
        setSs('');
        setElevation('');
        setAvgHr('');
        setFormError('');
    }
    function handleAdd() {
        const dist = parseFloat((distance || '').replace(',', '.'));
        const totalSeconds = (parseInt(hh) || 0) * 3600 + (parseInt(mm) || 0) * 60 + (parseInt(ss) || 0);
        if (!date) {
            setFormError('Indique une date.');
            return;
        }
        if (!dist || dist <= 0) {
            setFormError('Indique une distance.');
            return;
        }
        if (!totalSeconds || totalSeconds <= 0) {
            setFormError('Indique un temps.');
            return;
        }
        const activity = {
            id: uid(),
            date,
            sport,
            type: entryType,
            distanceKm: dist,
            durationSec: totalSeconds,
            elevationM: elevation ? parseFloat(elevation.toString().replace(',', '.')) : 0,
            avgHr: avgHr ? parseInt(avgHr, 10) : 0,
        };
        const newList = [...activities, activity];
        persist(newList);
        setOpenMonths(prev => new Set([...prev, monthKey(date)]));
        resetForm();
        setFormOpen(false);
    }
    function handleDelete(id) {
        persist(activities.filter(a => a.id !== id));
    }
    const preview = useMemo(() => {
        const dist = parseFloat((distance || '').replace(',', '.'));
        const totalSeconds = (parseInt(hh) || 0) * 3600 + (parseInt(mm) || 0) * 60 + (parseInt(ss) || 0);
        if (!dist || !totalSeconds)
            return null;
        return { pace: formatPace(totalSeconds / dist), speed: formatSpeed(dist, totalSeconds) };
    }, [distance, hh, mm, ss]);
    const sportActivities = useMemo(() => activities.filter(a => (a.sport || 'trail') === sport), [activities, sport]);
    const thisWeekKey = weekKey(todayISO());
    const weekStats = useMemo(() => {
        const inWeek = sportActivities.filter(a => weekKey(a.date) === thisWeekKey);
        const dist = inWeek.reduce((s, a) => s + a.distanceKm, 0);
        const time = inWeek.reduce((s, a) => s + a.durationSec, 0);
        const elev = inWeek.reduce((s, a) => s + (a.elevationM || 0), 0);
        return { count: inWeek.length, dist, time, elev, pace: dist > 0 ? time / dist : 0 };
    }, [sportActivities, thisWeekKey]);
    const thisMonthKey = monthKey(todayISO());
    const monthStats = useMemo(() => {
        const inMonth = sportActivities.filter(a => monthKey(a.date) === thisMonthKey);
        const dist = inMonth.reduce((s, a) => s + a.distanceKm, 0);
        const time = inMonth.reduce((s, a) => s + a.durationSec, 0);
        const elev = inMonth.reduce((s, a) => s + (a.elevationM || 0), 0);
        return { count: inMonth.length, dist, time, elev, pace: dist > 0 ? time / dist : 0 };
    }, [sportActivities, thisMonthKey]);
    const weeklyChartData = useMemo(() => {
        const [fy, fm] = focusMonthKey.split('-').map(Number);
        const year = fy;
        const month = fm - 1;
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const weeksMap = new Map();
        for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
            const iso = toLocalISO(d);
            const mon = mondayOf(iso);
            const key = toLocalISO(mon);
            if (!weeksMap.has(key)) {
                weeksMap.set(key, { key, label: mon.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), km: 0, sec: 0, elev: 0, count: 0 });
            }
        }
        sportActivities.forEach(a => {
            const k = weekKey(a.date);
            const w = weeksMap.get(k);
            if (w) {
                w.km += a.distanceKm;
                w.sec += a.durationSec;
                w.elev += (a.elevationM || 0);
                w.count += 1;
            }
        });
        return Array.from(weeksMap.values())
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(w => ({ ...w, km: Math.round(w.km * 10) / 10 }));
    }, [sportActivities, focusMonthKey]);
    const dailyChartData = useMemo(() => {
        const monday = new Date(focusWeekKey + 'T00:00:00');
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(d.getDate() + i);
            const iso = toLocalISO(d);
            const rawLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
            days.push({ key: iso, label: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1), km: 0, sec: 0, elev: 0, count: 0 });
        }
        sportActivities.forEach(a => {
            const day = days.find(d => d.key === a.date);
            if (day) {
                day.km += a.distanceKm;
                day.sec += a.durationSec;
                day.elev += (a.elevationM || 0);
                day.count += 1;
            }
        });
        return days.map(d => ({ ...d, km: Math.round(d.km * 10) / 10 }));
    }, [sportActivities, focusWeekKey]);
    const monthlyChartData = useMemo(() => {
        const months = [];
        for (let m = 0; m < 12; m++) {
            const d = new Date(focusYear, m, 1);
            const key = `${focusYear}-${String(m + 1).padStart(2, '0')}`;
            const rawLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
            months.push({ key, label: rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1), km: 0, sec: 0, elev: 0, count: 0 });
        }
        const map = new Map(months.map(m => [m.key, m]));
        sportActivities.forEach(a => {
            const k = monthKey(a.date);
            const m = map.get(k);
            if (m) {
                m.km += a.distanceKm;
                m.sec += a.durationSec;
                m.elev += (a.elevationM || 0);
                m.count += 1;
            }
        });
        return months.map(m => ({ ...m, km: Math.round(m.km * 10) / 10 }));
    }, [sportActivities, focusYear]);
    const focusMonthLabel = useMemo(() => monthLabel(`${focusMonthKey}-01`), [focusMonthKey]);
    const focusWeekLabel = useMemo(() => {
        const monday = new Date(focusWeekKey + 'T00:00:00');
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        return `${fmt(monday)} au ${fmt(sunday)}`;
    }, [focusWeekKey]);
    const yearStats = useMemo(() => {
        const byYear = {};
        sportActivities.forEach(a => {
            const y = a.date.slice(0, 4);
            if (!byYear[y])
                byYear[y] = { year: y, dist: 0, elev: 0, time: 0, count: 0 };
            byYear[y].dist += a.distanceKm;
            byYear[y].elev += a.elevationM || 0;
            byYear[y].time += a.durationSec;
            byYear[y].count += 1;
        });
        return Object.values(byYear).sort((a, b) => b.year.localeCompare(a.year));
    }, [sportActivities]);
    const monthGroups = useMemo(() => {
        const byMonth = {};
        const filtered = historyFilter === 'course' ? sportActivities.filter(a => a.type === 'course') : sportActivities;
        filtered.forEach(a => {
            const k = monthKey(a.date);
            if (!byMonth[k])
                byMonth[k] = [];
            byMonth[k].push(a);
        });
        return Object.entries(byMonth)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([key, list]) => ({
            key,
            label: monthLabel(list[0].date),
            list: list.sort((a, b) => b.date.localeCompare(a.date)),
            dist: list.reduce((s, a) => s + a.distanceKm, 0),
        }));
    }, [sportActivities, historyFilter]);
    function toggleMonth(key) {
        setOpenMonths(prev => {
            const next = new Set(prev);
            if (next.has(key))
                next.delete(key);
            else
                next.add(key);
            return next;
        });
    }
    if (loading) {
        return (React.createElement("div", { style: { padding: 40, textAlign: 'center', color: 'rgba(245,245,250,0.55)', fontFamily: 'Inter, sans-serif' } }, "Chargement\u2026"));
    }
    return (React.createElement("div", { className: "fl-root" },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .fl-root {
          --bg: #0d0e1a;
          --surface: rgba(255,255,255,0.07);
          --surface-alt: rgba(255,255,255,0.13);
          --text: #F5F5FA;
          --text-muted: rgba(245,245,250,0.55);
          --warn: #FF8A65;
          --trail: #7EEBD8;
          --chart-bar: #2BB89C;
          --month: #B79CFF;
          --border: rgba(255,255,255,0.14);
          background:
            radial-gradient(circle at 20% 0%, rgba(122,90,255,0.22) 0%, transparent 45%),
            radial-gradient(circle at 90% 25%, rgba(62,200,190,0.18) 0%, transparent 50%),
            linear-gradient(160deg, #17182b 0%, #0d0e1a 100%);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          min-height: 100%;
          padding: 20px 16px 48px;
          max-width: 480px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .fl-root * { box-sizing: border-box; }

        .fl-hero-art { margin: -20px -16px 0; width: calc(100% + 32px); }
        .fl-mountains { display: block; width: 100%; height: 260px; }

        .fl-summary-row { display: flex; gap: 10px; padding: 6px 0 18px; margin-top: -85px; position: relative; }
        .fl-summary-card { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 14px 12px; text-align: center; backdrop-filter: blur(14px); }
        .fl-summary-label { color: var(--text-muted); font-size: 12px; margin-bottom: 6px; }
        .fl-summary-number {
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: 30px;
          line-height: 1;
        }
        .fl-summary-unit { font-size: 14px; font-weight: 500; color: var(--text-muted); margin-left: 3px; }
        .fl-summary-stats { margin-top: 8px; font-size: 11.5px; color: var(--text-muted); line-height: 1.6; }
        .fl-summary-stats b { color: var(--text); font-weight: 600; }
        .fl-summary-card--week {
          flex: 1.15; background: linear-gradient(160deg, rgba(126,235,216,0.16), rgba(255,255,255,0.06));
          border-color: rgba(126,235,216,0.3); backdrop-filter: blur(14px);
        }
        .fl-summary-card--week .fl-summary-number { color: var(--trail); }
        .fl-summary-card--month {
          flex: 0.85; padding: 12px 12px 10px; background: linear-gradient(160deg, rgba(183,156,255,0.18), rgba(255,255,255,0.06));
          border-color: rgba(183,156,255,0.35); backdrop-filter: blur(14px);
        }
        .fl-summary-card--month .fl-summary-number { font-size: 25px; color: var(--month); }
        .fl-summary-card--month .fl-summary-label { font-size: 11px; }

        .fl-add-row { display: flex; gap: 8px; margin: 4px 0 20px; }
        .fl-sport-row { display: flex; gap: 8px; margin: 4px 0 14px; }
        .fl-sport-btn {
          flex: 1; text-align: center; padding: 10px; border-radius: 12px; cursor: pointer;
          background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);
          font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px; backdrop-filter: blur(12px);
          transition: background 0.15s, color 0.15s;
        }
        .fl-sport-btn.active { background: var(--surface-alt); color: var(--text); border-color: rgba(126,235,216,0.4); }
        .fl-add-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--surface); border: 1px solid var(--border); color: var(--text);
          font-family: 'Inter', sans-serif; font-weight: 500; font-size: 15px;
          padding: 13px; border-radius: 999px; cursor: pointer; backdrop-filter: blur(14px);
          transition: background 0.15s;
        }
        .fl-add-btn:hover { background: var(--surface-alt); }
        .fl-add-btn-course {
          display: flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap;
          background: rgba(255,138,101,0.08); border: 1px solid rgba(255,138,101,0.35); color: var(--warn);
          font-family: 'Inter', sans-serif; font-weight: 500; font-size: 13px;
          padding: 0 16px; border-radius: 999px; cursor: pointer; backdrop-filter: blur(14px);
          transition: background 0.15s;
        }
        .fl-add-btn-course:hover { background: rgba(255,138,101,0.16); }

        .fl-form { background: var(--surface); border-radius: 16px; padding: 18px; margin-bottom: 20px; border: 1px solid var(--border); backdrop-filter: blur(16px); }
        .fl-form-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .fl-form-title { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; }
        .fl-close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }

        .fl-field { margin-bottom: 14px; }
        .fl-field label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .fl-field input {
          width: 100%; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 10px;
          padding: 11px 12px; color: var(--text); font-family: 'Inter'; font-size: 15px;
        }
        .fl-field input:focus { outline: none; border-color: var(--text-muted); }
        .fl-duration-row { display: flex; gap: 8px; align-items: center; }
        .fl-duration-row .fl-field { flex: 1; margin-bottom: 0; }
        .fl-duration-row input { text-align: center; }
        .fl-two-col { display: flex; gap: 10px; }
        .fl-two-col .fl-field { flex: 1; }

        .fl-preview { font-size: 13px; color: var(--text-muted); margin: 2px 0 14px; min-height: 18px; }
        .fl-preview b { color: var(--text); }

        .fl-error { color: var(--warn); font-size: 13px; margin-bottom: 10px; }

        .fl-submit {
          width: 100%; padding: 12px; border-radius: 10px; border: none; cursor: pointer;
          background: var(--text); color: var(--bg); font-family: 'Inter'; font-weight: 600; font-size: 15px;
        }

        .fl-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
        .fl-tab {
          padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border); background: transparent;
          color: var(--text-muted); font-family: 'Inter'; font-size: 13px; font-weight: 500; cursor: pointer;
        }
        .fl-tab.active { background: var(--surface-alt); color: var(--text); border-color: var(--border); backdrop-filter: blur(12px); }

        .fl-chart-scope { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

        .fl-section-header { display: flex; align-items: center; justify-content: space-between; margin: 28px 0 14px; }
        .fl-section-header .fl-section-title { margin: 0; }
        .fl-chart-toggle { display: flex; gap: 2px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 3px; backdrop-filter: blur(12px); }
        .fl-chart-toggle-btn {
          display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;
          border-radius: 999px; border: none; background: transparent; color: var(--text-muted); cursor: pointer;
        }
        .fl-chart-toggle-btn.active { background: var(--surface-alt); color: var(--trail); }

        .fl-section-title { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; margin: 28px 0 14px; }

        .fl-year-card {
          background: var(--surface); border-radius: 14px; padding: 16px; margin-bottom: 10px; border: 1px solid var(--border);
          cursor: pointer; backdrop-filter: blur(14px);
        }
        .fl-year-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
        .fl-year-num { font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; }
        .fl-year-label { color: var(--text-muted); font-size: 13px; }
        .fl-year-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; color: var(--text-muted); }
        .fl-year-grid b { color: var(--text); }

        .fl-month { border-bottom: 1px solid var(--border); }
        .fl-month-head {
          display: flex; justify-content: space-between; align-items: center; padding: 14px 2px;
          cursor: pointer;
        }
        .fl-month-head-left { font-weight: 500; font-size: 15px; }
        .fl-month-head-right { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 13px; }
        .fl-chevron { transition: transform 0.2s; color: var(--text-muted); }
        .fl-chevron.open { transform: rotate(180deg); }

        .fl-entry {
          display: flex; align-items: center; padding: 10px 2px; gap: 10px;
        }
        .fl-entry-bar { width: 4px; height: 34px; border-radius: 2px; flex-shrink: 0; }
        .fl-entry-main { flex: 1; }
        .fl-entry-date { font-size: 12px; color: var(--text-muted); }
        .fl-entry-figures { font-size: 14px; margin-top: 2px; }
        .fl-entry-figures b { font-weight: 600; }
        .fl-entry-sep { color: var(--text-muted); margin: 0 5px; }
        .fl-del-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; flex-shrink: 0; }
        .fl-del-btn:hover { color: var(--warn); }

        .fl-empty { color: var(--text-muted); font-size: 14px; text-align: center; padding: 24px 10px; }
        .fl-warn { color: var(--warn); font-size: 12px; text-align: center; margin-top: 10px; }
      `),
        React.createElement("div", { className: "fl-hero-art" },
            React.createElement("svg", { className: "fl-mountains", viewBox: "0 0 380 200", preserveAspectRatio: "none" },
                React.createElement("defs", null,
                    React.createElement("linearGradient", { id: "flSky", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
                        React.createElement("stop", { offset: "0%", stopColor: "#1B2417" }),
                        React.createElement("stop", { offset: "55%", stopColor: "#26331F" }),
                        React.createElement("stop", { offset: "100%", stopColor: "#7A4B2A", stopOpacity: "0.7" })),
                    React.createElement("radialGradient", { id: "flGlow", cx: "76%", cy: "18%", r: "55%" },
                        React.createElement("stop", { offset: "0%", stopColor: "#F2B366", stopOpacity: "0.6" }),
                        React.createElement("stop", { offset: "100%", stopColor: "#F2B366", stopOpacity: "0" }))),
                React.createElement("rect", { x: "0", y: "0", width: "380", height: "200", fill: "url(#flSky)" }),
                React.createElement("rect", { x: "0", y: "0", width: "380", height: "200", fill: "url(#flGlow)" }),
                React.createElement("circle", { cx: "289", cy: "40", r: "14", fill: "#F2C879" }),
                React.createElement("polygon", { points: "0,200 0,120 50,70 95,115 145,62 195,120 245,72 300,125 345,80 380,110 380,200", fill: "#3A4A32", opacity: "0.55" }),
                React.createElement("polygon", { points: "0,200 0,145 65,100 125,148 180,98 235,152 285,105 345,155 380,128 380,200", fill: "#28331F", opacity: "0.88" }),
                React.createElement("polygon", { points: "5,200 35,200 20,148", fill: "#232B1C" }),
                React.createElement("polygon", { points: "32,200 65,200 48,132", fill: "#1E251A" }),
                React.createElement("polygon", { points: "60,200 95,200 77,155", fill: "#232B1C" }),
                React.createElement("polygon", { points: "92,200 128,200 110,140", fill: "#1E251A" }),
                React.createElement("polygon", { points: "195,200 220,200 207,178", fill: "#232B1C" }),
                React.createElement("polygon", { points: "245,200 275,200 260,172", fill: "#1E251A" }),
                React.createElement("polygon", { points: "280,200 312,200 296,178", fill: "#2E2A1C" }),
                React.createElement("polygon", { points: "315,200 348,200 331,138", fill: "#1E251A" }),
                React.createElement("polygon", { points: "340,200 375,200 357,152", fill: "#2E2A1C" }))),
        React.createElement("div", { className: "fl-summary-row" },
            React.createElement("div", { className: "fl-summary-card fl-summary-card--week" },
                React.createElement("div", { className: "fl-summary-label" }, "Cette semaine"),
                React.createElement("div", null,
                    React.createElement("span", { className: "fl-summary-number" }, formatKm(weekStats.dist)),
                    React.createElement("span", { className: "fl-summary-unit" }, "km")),
                React.createElement("div", { className: "fl-summary-stats" },
                    weekStats.count,
                    " sortie",
                    weekStats.count > 1 ? 's' : '',
                    " \u00B7 ",
                    formatDuration(weekStats.time),
                    React.createElement("br", null),
                    "D+ ",
                    React.createElement("b", null, Math.round(weekStats.elev)),
                    " m")),
            React.createElement("div", { className: "fl-summary-card fl-summary-card--month" },
                React.createElement("div", { className: "fl-summary-label" }, "Ce mois-ci"),
                React.createElement("div", null,
                    React.createElement("span", { className: "fl-summary-number" }, formatKm(monthStats.dist)),
                    React.createElement("span", { className: "fl-summary-unit" }, "km")),
                React.createElement("div", { className: "fl-summary-stats" },
                    monthStats.count,
                    " sortie",
                    monthStats.count > 1 ? 's' : '',
                    " \u00B7 ",
                    formatDuration(monthStats.time),
                    React.createElement("br", null),
                    "D+ ",
                    React.createElement("b", null, Math.round(monthStats.elev)),
                    " m"))),
        React.createElement("div", { className: "fl-sport-row" },
            React.createElement("button", { className: `fl-sport-btn ${sport === 'trail' ? 'active' : ''}`, onClick: () => setSport('trail') }, "Trail"),
            React.createElement("button", { className: `fl-sport-btn ${sport === 'velo' ? 'active' : ''}`, onClick: () => setSport('velo') }, "V\u00E9lo")),
        !formOpen && (React.createElement("div", { className: "fl-add-row" },
            React.createElement("button", { className: "fl-add-btn", onClick: () => { setEntryType('entrainement'); setFormOpen(true); } },
                React.createElement(Plus, { size: 18 }),
                " Ajouter un entra\u00EEnement"),
            React.createElement("button", { className: "fl-add-btn-course", onClick: () => { setEntryType('course'); setFormOpen(true); } },
                React.createElement(Plus, { size: 14 }),
                " Course"))),
        formOpen && (React.createElement("div", { className: "fl-form" },
            React.createElement("div", { className: "fl-form-row" },
                React.createElement("span", { className: "fl-form-title" }, entryType === 'course' ? 'Nouvelle course' : 'Nouvel entraînement'),
                React.createElement("button", { className: "fl-close-btn", onClick: () => { setFormOpen(false); resetForm(); } },
                    React.createElement(X, { size: 20 }))),
            React.createElement("div", { className: "fl-two-col" },
                React.createElement("div", { className: "fl-field" },
                    React.createElement("label", null, "Date"),
                    React.createElement("input", { type: "date", value: date, onChange: e => setDate(e.target.value), max: todayISO() })),
                React.createElement("div", { className: "fl-field" },
                    React.createElement("label", null, "Distance (km)"),
                    React.createElement("input", { type: "text", inputMode: "decimal", placeholder: "10,5", value: distance, onChange: e => setDistance(e.target.value) }))),
            React.createElement("div", { className: "fl-field" },
                React.createElement("label", null, "Temps"),
                React.createElement("div", { className: "fl-duration-row" },
                    React.createElement("div", { className: "fl-field" },
                        React.createElement("input", { type: "number", inputMode: "numeric", placeholder: "h", value: hh, onChange: e => setHh(e.target.value) })),
                    React.createElement("div", { className: "fl-field" },
                        React.createElement("input", { type: "number", inputMode: "numeric", placeholder: "min", value: mm, onChange: e => setMm(e.target.value) })),
                    React.createElement("div", { className: "fl-field" },
                        React.createElement("input", { type: "number", inputMode: "numeric", placeholder: "sec", value: ss, onChange: e => setSs(e.target.value) })))),
            React.createElement("div", { className: "fl-two-col" },
                React.createElement("div", { className: "fl-field" },
                    React.createElement("label", null, "D+ \u2014 optionnel (m)"),
                    React.createElement("input", { type: "text", inputMode: "decimal", placeholder: "0", value: elevation, onChange: e => setElevation(e.target.value) })),
                React.createElement("div", { className: "fl-field" },
                    React.createElement("label", null, "FC moyenne \u2014 optionnel (bpm)"),
                    React.createElement("input", { type: "text", inputMode: "numeric", placeholder: "0", value: avgHr, onChange: e => setAvgHr(e.target.value) }))),
            React.createElement("div", { className: "fl-preview" }, preview ? React.createElement(React.Fragment, null,
                "Allure estim\u00E9e : ",
                React.createElement("b", null, preview.pace),
                " \u00B7 ",
                React.createElement("b", null, preview.speed)) : React.createElement(React.Fragment, null, "\u00A0")),
            formError && React.createElement("div", { className: "fl-error" }, formError),
            React.createElement("button", { className: "fl-submit", onClick: handleAdd }, "Enregistrer"))),
        sportActivities.length === 0 ? (React.createElement("div", { className: "fl-empty" }, "Aucune sortie enregistr\u00E9e. Ajoute ta premi\u00E8re course pour d\u00E9marrer le suivi.")) : (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "fl-section-header" },
                React.createElement("div", { className: "fl-section-title" }, "Statistiques"),
                statPeriod !== 'année' && (React.createElement("div", { className: "fl-chart-toggle" },
                    React.createElement("button", { className: `fl-chart-toggle-btn ${chartType === 'bar' ? 'active' : ''}`, onClick: () => setChartType('bar'), "aria-label": "Graphique en barres" },
                        React.createElement(BarChart2, { size: 15 })),
                    React.createElement("button", { className: `fl-chart-toggle-btn ${chartType === 'line' ? 'active' : ''}`, onClick: () => setChartType('line'), "aria-label": "Graphique en ligne" },
                        React.createElement(LineChartIcon, { size: 15 }))))),
            React.createElement("div", { className: "fl-tabs" },
                React.createElement("button", { className: `fl-tab ${statPeriod === 'jour' ? 'active' : ''}`, onClick: () => { setFocusWeekKey(weekKey(todayISO())); setStatPeriod('jour'); } }, "Jour"),
                React.createElement("button", { className: `fl-tab ${statPeriod === 'semaine' ? 'active' : ''}`, onClick: () => { setFocusMonthKey(monthKey(todayISO())); setStatPeriod('semaine'); } }, "Semaine"),
                React.createElement("button", { className: `fl-tab ${statPeriod === 'mois' ? 'active' : ''}`, onClick: () => { setFocusYear(new Date(todayISO()).getFullYear()); setStatPeriod('mois'); } }, "Mois"),
                React.createElement("button", { className: `fl-tab ${statPeriod === 'année' ? 'active' : ''}`, onClick: () => setStatPeriod('année') }, "Ann\u00E9e")),
            statPeriod === 'jour' && (React.createElement("div", null,
                React.createElement("div", { className: "fl-chart-scope" },
                    "Semaine du ",
                    focusWeekLabel),
                React.createElement(ResponsiveContainer, { width: "100%", height: 160 }, chartType === 'bar' ? (React.createElement(BarChart, { data: dailyChartData, margin: { top: 4, right: 0, left: -28, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                    React.createElement(XAxis, { dataKey: "label", tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: false, tickLine: false, width: 30 }),
                    React.createElement(Tooltip, { content: React.createElement(ChartTooltip, null) }),
                    React.createElement(Bar, { dataKey: "km", fill: "var(--chart-bar)", radius: [3, 3, 0, 0] }))) : (React.createElement(LineChart, { data: dailyChartData, margin: { top: 4, right: 8, left: -28, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                    React.createElement(XAxis, { dataKey: "label", tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: false, tickLine: false, width: 30 }),
                    React.createElement(Tooltip, { content: React.createElement(ChartTooltip, null) }),
                    React.createElement(Line, { type: "monotone", dataKey: "km", stroke: "var(--chart-bar)", strokeWidth: 2, dot: { r: 3, fill: 'var(--chart-bar)', strokeWidth: 0 }, activeDot: { r: 5 } })))))),
            statPeriod === 'semaine' && (React.createElement("div", null,
                React.createElement("div", { className: "fl-chart-scope" },
                    focusMonthLabel,
                    " \u2014 double-clique sur une semaine pour voir ses jours"),
                React.createElement(ResponsiveContainer, { width: "100%", height: 160 }, chartType === 'bar' ? (React.createElement(BarChart, { data: weeklyChartData, margin: { top: 4, right: 0, left: -28, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                    React.createElement(XAxis, { dataKey: "label", tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: false, tickLine: false, width: 30 }),
                    React.createElement(Tooltip, { content: React.createElement(ChartTooltip, null) }),
                    React.createElement(Bar, { dataKey: "km", fill: "var(--chart-bar)", radius: [3, 3, 0, 0], style: { cursor: 'pointer' }, onDoubleClick: (data) => { setFocusWeekKey(data.payload.key); setStatPeriod('jour'); } }))) : (React.createElement(ComposedChart, { data: weeklyChartData, margin: { top: 4, right: 8, left: -28, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                    React.createElement(XAxis, { dataKey: "label", tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: false, tickLine: false, width: 30 }),
                    React.createElement(YAxis, { yAxisId: "click", hide: true, domain: [0, 1] }),
                    React.createElement(Tooltip, { content: React.createElement(ChartTooltip, null) }),
                    React.createElement(Bar, { yAxisId: "click", dataKey: () => 1, fill: "transparent", isAnimationActive: false, style: { cursor: 'pointer' }, onDoubleClick: (data) => { setFocusWeekKey(data.payload.key); setStatPeriod('jour'); } }),
                    React.createElement(Line, { type: "monotone", dataKey: "km", stroke: "var(--chart-bar)", strokeWidth: 2, dot: { r: 3, fill: 'var(--chart-bar)', strokeWidth: 0 }, activeDot: { r: 5 } })))))),
            statPeriod === 'mois' && (React.createElement("div", null,
                React.createElement("div", { className: "fl-chart-scope" },
                    "Ann\u00E9e ",
                    focusYear,
                    " \u2014 double-clique sur un mois pour voir ses semaines"),
                React.createElement(ResponsiveContainer, { width: "100%", height: 160 }, chartType === 'bar' ? (React.createElement(BarChart, { data: monthlyChartData, margin: { top: 4, right: 0, left: -28, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                    React.createElement(XAxis, { dataKey: "label", tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: false, tickLine: false, width: 30 }),
                    React.createElement(Tooltip, { content: React.createElement(ChartTooltip, null) }),
                    React.createElement(Bar, { dataKey: "km", fill: "var(--chart-bar)", radius: [3, 3, 0, 0], style: { cursor: 'pointer' }, onDoubleClick: (data) => { setFocusMonthKey(data.payload.key); setStatPeriod('semaine'); } }))) : (React.createElement(ComposedChart, { data: monthlyChartData, margin: { top: 4, right: 8, left: -28, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                    React.createElement(XAxis, { dataKey: "label", tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: 'rgba(245,245,250,0.55)', fontSize: 10 }, axisLine: false, tickLine: false, width: 30 }),
                    React.createElement(YAxis, { yAxisId: "click", hide: true, domain: [0, 1] }),
                    React.createElement(Tooltip, { content: React.createElement(ChartTooltip, null) }),
                    React.createElement(Bar, { yAxisId: "click", dataKey: () => 1, fill: "transparent", isAnimationActive: false, style: { cursor: 'pointer' }, onDoubleClick: (data) => { setFocusMonthKey(data.payload.key); setStatPeriod('semaine'); } }),
                    React.createElement(Line, { type: "monotone", dataKey: "km", stroke: "var(--chart-bar)", strokeWidth: 2, dot: { r: 3, fill: 'var(--chart-bar)', strokeWidth: 0 }, activeDot: { r: 5 } })))))),
            statPeriod === 'année' && (React.createElement("div", null,
                React.createElement("div", { className: "fl-chart-scope" }, "Double-clique sur une ann\u00E9e pour voir ses mois"),
                yearStats.map(y => (React.createElement("div", { className: "fl-year-card", key: y.year, onDoubleClick: () => { setFocusYear(parseInt(y.year, 10)); setStatPeriod('mois'); } },
                    React.createElement("div", { className: "fl-year-top" },
                        React.createElement("span", { className: "fl-year-num" }, y.year),
                        React.createElement("span", { className: "fl-year-label" },
                            y.count,
                            " sortie",
                            y.count > 1 ? 's' : '')),
                    React.createElement("div", { className: "fl-year-grid" },
                        React.createElement("span", null,
                            "Distance ",
                            React.createElement("b", null,
                                formatKm(y.dist),
                                " km")),
                        React.createElement("span", null,
                            "D+ total ",
                            React.createElement("b", null,
                                Math.round(y.elev),
                                " m")),
                        React.createElement("span", null,
                            "Temps total ",
                            React.createElement("b", null, formatDuration(y.time))))))))),
            React.createElement("div", { className: "fl-section-title" }, "Historique"),
            React.createElement("div", { className: "fl-tabs" },
                React.createElement("button", { className: `fl-tab ${historyFilter === 'all' ? 'active' : ''}`, onClick: () => setHistoryFilter('all') }, "Toutes"),
                React.createElement("button", { className: `fl-tab ${historyFilter === 'course' ? 'active' : ''}`, onClick: () => setHistoryFilter('course') }, "Courses")),
            historyFilter === 'course' && monthGroups.length === 0 && (React.createElement("div", { className: "fl-empty" }, "Aucune course enregistr\u00E9e pour l'instant.")),
            monthGroups.map(group => {
                const isOpen = openMonths.has(group.key);
                return (React.createElement("div", { className: "fl-month", key: group.key },
                    React.createElement("div", { className: "fl-month-head", onClick: () => toggleMonth(group.key) },
                        React.createElement("span", { className: "fl-month-head-left" }, group.label),
                        React.createElement("span", { className: "fl-month-head-right" },
                            formatKm(group.dist),
                            " km",
                            React.createElement(ChevronDown, { size: 16, className: `fl-chevron ${isOpen ? 'open' : ''}` }))),
                    isOpen && group.list.map(a => (React.createElement("div", { className: "fl-entry", key: a.id },
                        React.createElement("div", { className: "fl-entry-bar", style: { background: a.type === 'course' ? 'var(--month)' : 'var(--trail)' } }),
                        React.createElement("div", { className: "fl-entry-main" },
                            React.createElement("div", { className: "fl-entry-date" }, new Date(a.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })),
                            React.createElement("div", { className: "fl-entry-figures" },
                                React.createElement("b", null,
                                    formatKm(a.distanceKm),
                                    " km"),
                                React.createElement("span", { className: "fl-entry-sep" }, "\u00B7"),
                                formatDuration(a.durationSec),
                                React.createElement("span", { className: "fl-entry-sep" }, "\u00B7"),
                                formatPace(a.durationSec / a.distanceKm),
                                React.createElement("span", { className: "fl-entry-sep" }, "\u00B7"),
                                formatSpeed(a.distanceKm, a.durationSec),
                                a.elevationM > 0 && (React.createElement(React.Fragment, null,
                                    React.createElement("span", { className: "fl-entry-sep" }, "\u00B7"),
                                    "D+ ",
                                    Math.round(a.elevationM),
                                    " m")),
                                a.avgHr > 0 && (React.createElement(React.Fragment, null,
                                    React.createElement("span", { className: "fl-entry-sep" }, "\u00B7"),
                                    "FC ",
                                    a.avgHr,
                                    " bpm")))),
                        React.createElement("button", { className: "fl-del-btn", onClick: () => handleDelete(a.id) },
                            React.createElement(Trash2, { size: 15 })))))));
            }))),
        saveError && React.createElement("div", { className: "fl-warn" }, "La derni\u00E8re sortie n'a peut-\u00EAtre pas \u00E9t\u00E9 sauvegard\u00E9e \u2014 v\u00E9rifie ta connexion.")));
}
const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(React.createElement(RunningCairn, null));
