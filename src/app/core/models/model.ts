export interface Task {
    id: number;
    name: string;
}
export interface Target {
    id: number;
    name: string;
}

export interface FeatureSet {
    id: number;
    feature_type: string;
    data_type: string;
    current_version: string;
}

export interface Model {
    id: number;
    name: string;

    task: Task;
    targets: Target[];
    feature_sets: FeatureSet[];

}

export interface ModelVersion {
    id: number;
    version: string;
    train_sample_size: number;
    val_loss: number | null;
    val_accuracy: number | null;
    val_mae: number | null;
    is_current: boolean;
    created_at: Date;
    model: Model;
}

export type ModelVersionSortBy = 'model_id' | 'created_at' | 'version' | 'train_sample_size' | 'val_accuracy' | 'val_mae';

export interface ModelFilters {
    task_id: number;
}

export interface ModelVersionFilters {
    model_id: number;
}

export interface MetricScore {
    metric: string;
    value: number;
}

export type TargetLiteral = 'historical_period' | 'start_year' | 'year_range'

export interface TargetScores {
    target: TargetLiteral;
    scores: MetricScore[];
}
