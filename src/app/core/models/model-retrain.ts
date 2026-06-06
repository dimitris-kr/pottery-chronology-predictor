export interface Eligibility {
    eligible: boolean;
    new_items_count: number;
    /** Advisory only — below this many new items the UI warns a retrain is low-value. */
    recommended_threshold: number;
}

export interface TrainingRun {
    id: number;
    split_strategy: string;
    random_state: number;
    is_current: boolean;
    created_at: Date;
}

export interface RetrainStarted {
    job_id: string;
    new_training_run: TrainingRun;
    new_version: string;
    train_size: number;
    val_size: number;
    status: string;
}

export type JobStatusValue = 'running' | 'success' | 'failure' | 'not_found';

export interface JobStatus {
    status: JobStatusValue;
    error: string | null;
    result: unknown | null;
}
