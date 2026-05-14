import {isClassification, Prediction, PredictionMatch, PredictionStatus} from '../models/prediction';
import {HISTORICAL_PERIOD_COLORS} from '../models/historical-period';
import {PotteryItem} from '../models/pottery-item';
import {RequestParams} from '../models/request-params';

export function shorten(text: string, maxWords: number = 10): string {
    let words = text.split(" ");
    if (words.length >= maxWords) {
        words = words.slice(0, maxWords);
    }
    return words.join(' ');
}

export function formatYear(year: number): string {
    let yearAbs = Math.abs(year);
    if (year < 0) return `${yearAbs} BCE`;
    else if (year > 0) return `${yearAbs} CE`;
    else return `${yearAbs}`;
}

export function toSignedYear(year: number, era: 'BCE' | 'CE'): number {
    return era === 'BCE' ? -Math.abs(year) : Math.abs(year);
}

export function cleanParams<T extends Record<string, any>>(obj: T): { [p: string]: any } {
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ''
        )
    );
}

export function matchExplanation(prediction: Prediction): string {
    if (isClassification(prediction)) {
        switch (prediction.match) {
            case "exact":
                return "The predicted period is the same as the true period.";
            case "none":
                return "The predicted period is different from the true period.";
        }
    } else {
        switch (prediction.match) {
            case "exact":
                return "Predicted and true date ranges overlap by ≥ 90%.";
            case "close":
                return "Date ranges overlap by 40–89%, or their midpoints differ by ≤ 50 years.";
            case "none":
                return "Date range overlap is < 40% and midpoint difference is > 50 years.";
        }
    }

    return "No verified chronology is available, the prediction cannot be evaluated.";
}

export function taskExplanation(task: string): string | null {
    switch (task.toLowerCase()) {
        case "classification":
            return "These models predict historical periods.";
        case "regression":
            return "These models predict exact years.";
        default:
            return null;
    }
}

export function scoreColumn(task: string): string {
    switch (task.toLowerCase()) {
        case "classification":
            return "val_accuracy"
        case "regression":
            return "val_mae";
        default:
            return "";
    }
}

export function scoreColumnLabel(task: string): string {
    switch (task.toLowerCase()) {
        case "classification":
            return "Accuracy"
        case "regression":
            return "Avg. Difference";
        default:
            return "";
    }
}

function hashString(str: string): number {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0; // force 32bit
    }

    return Math.abs(hash);
}

function generateColor(str: string): string {
    const hash = hashString(str);

    const hue = hash % 360;

    const saturation = 30 + (hash % 10);
    const lightness = 50 + (hash % 10);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const generatedCache: Record<string, string> = {};

export function getColor(period?: string) {
    if (!period) return null;

    const key = period.toLowerCase();

    if (HISTORICAL_PERIOD_COLORS[key]) {
        return HISTORICAL_PERIOD_COLORS[key];
    }

    if (!generatedCache[key]) {
        generatedCache[key] = generateColor(key);
    }

    return generatedCache[key];
}

export const statusClassMap: Record<PredictionStatus, string> = {
    validated: 'success',
    pending: 'warning',
};

export function getStatusClass(p: Prediction): string {
    return statusClassMap[p.status];
}

export const matchClassMap: Record<PredictionMatch, string> = {
    exact: 'success',
    close: 'warning',
    none: 'danger',
    unknown: 'disabled',
};

export function getMatchClass(p: Prediction): string {
    return matchClassMap[p.match]
}

export function getTrainDataClass(pi: PotteryItem): string {
    return pi.in_train_set ? 'primary' : 'disabled';
}

export function trainDataExplanation(pi: PotteryItem): string {
    return pi.in_train_set ? 'Item is included in the models\' training set' : 'Item is NOT yet included in the models\' training set';
}

export function capitalize(str: string): string {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

function hexToRgb(hex: string) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);

    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function rgbToCss({ r, g, b }: { r: number; g: number; b: number }) {
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function interpolateColor(c1: any, c2: any, t: number) {
    return {
        r: c1.r + (c2.r - c1.r) * t,
        g: c1.g + (c2.g - c1.g) * t,
        b: c1.b + (c2.b - c1.b) * t,
    };
}

const fixedMax = 100;
const GRAY = '#9E9E9E';
const RED = hexToRgb('#c6564b');
const YELLOW = hexToRgb('#C7A748');
const GREEN = hexToRgb('#83A756');
export const HIGH_IS_GOOD = ['accuracy', 'precision', 'recall', 'f1', 'r2'];
export const LOW_IS_GOOD = ['mae', 'rmse', 'medae'];

export function getScoreColor(value: number | null, metric: string, dataMax?: number): string {
    if (value === null || value === undefined) {
        return GRAY;
    }

    metric = metric.toLowerCase();

    let normalized: number;

    if (HIGH_IS_GOOD.includes(metric)) {
        normalized = value; // assuming already 0–1
    } else if (LOW_IS_GOOD.includes(metric)) {
        if (!dataMax || dataMax === 0) return GRAY;
        const max = Math.max(dataMax, fixedMax);
        normalized = 1 - (value / max); // invert (low = good)
    } else {
        return GRAY;
    }

    normalized = Math.max(0, Math.min(1, normalized));

    let color;

    if (normalized < 0.5) {
        // red → yellow
        const t = normalized / 0.5;
        color = interpolateColor(RED, YELLOW, t);
    } else {
        // yellow → green
        const t = (normalized - 0.5) / 0.5;
        color = interpolateColor(YELLOW, GREEN, t);
    }

    return rgbToCss(color);
}

