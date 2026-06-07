import {ModelVersion} from './model';
import {HistoricalPeriod} from './historical-period';
import {PotteryItem} from './pottery-item';

export type PredictionSortBy = 'created_at' | 'id';

export type PredictionInputType = 'text' | 'image' | 'text_image';
export type PredictionOutputType = 'historical_period' | 'years';
export type PredictionStatus = 'pending' | 'validated';
export type PredictionMatch = 'exact' | 'partial' | 'none' | 'unknown';

export interface PredictionBase {
    id: number;

    // inputs
    input_text: string | null;
    input_image_path: string | null;
    input_image_url: string | null;

    status: PredictionStatus;
    created_at: Date;

    model_version: ModelVersion;

    pottery_item: PotteryItem | null;

    match: PredictionMatch;
}

export interface ClassificationBreakdown {
    probabilities: Record<string, number>;
}

export interface RegressionPrediction {
    prediction: number;
    std: number;
    ci_lower: number;
    ci_upper: number;
}

export interface RegressionBreakdown {
    start_year?: RegressionPrediction;
    year_range?: RegressionPrediction;
}

export interface ClassificationPrediction extends PredictionBase {
    task: 'classification';

    historical_period: HistoricalPeriod;

    start_year: null;
    end_year: null;
    midpoint_year: null;
    year_range: null;

    breakdown: ClassificationBreakdown;
}

export interface RegressionPredictionResult extends PredictionBase {
    task: 'regression';

    historical_period: null;

    start_year: number;
    end_year: number;
    midpoint_year: number;
    year_range: number;

    breakdown: RegressionBreakdown;
}

export type Prediction =
    | ClassificationPrediction
    | RegressionPredictionResult;

export function isClassification(
    p: Prediction
): p is ClassificationPrediction {
    return p.task === 'classification';
}


/** Count of predictions awaiting expert feedback (status === 'pending'). */
export interface PendingPredictionCount {
    count: number;
}


export interface PredictionFilters {
    input_type?: PredictionInputType;
    output_type?: PredictionOutputType;
    status?: PredictionStatus;
    match?: PredictionMatch;
    pottery_item_id?: number;
}
