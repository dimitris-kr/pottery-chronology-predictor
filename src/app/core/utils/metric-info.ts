export interface MetricInfo {
    title: string;
    label: string;
    description: string;
}

export const METRIC_INFO_MAP: Record<string, MetricInfo> = {
    accuracy: {
        title: 'Accuracy',
        label: 'Overall Correctness',
        description:
            'This is how many predictions the model got right out of all sample inputs.',
    },
    precision: {
        title: 'Precision',
        label: 'Average Trustworthiness of Positive Predictions',
        description:
            'On average across all periods, when the model predicts a period, how often it is correct.',
    },
    recall: {
        title: 'Recall',
        label: 'Average Coverage of Real Samples',
        description:
            'On average across all periods, how many of the items were successfully identified by the model.',
    },
    f1: {
        title: 'F1 Score',
        label: 'Balanced Reliability',
        description:
            'A single score that summarizes both precision and recall.',
    },

    mae: {
        title: 'MAE - Mean Absolute Error',
        label: 'Average Error Magnitude',
        description:
            'On average, how many years the prediction is off from the actual value, regardless of direction.',
    },

    rmse: {
        title: 'RMSE - Root Mean Squared Error',
        label: 'Error with Penalty for Large Mistakes',
        description:
            'Similar to MAE, but gives more weight to large errors, making it sensitive to outliers.',
    },

    medae: {
        title: 'MedAE - Median Absolute Error',
        label: 'Typical Error',
        description:
            'The more stable version of MAE, showing what a typical prediction error looks like without being affected by outliers.',
    },

    r2: {
        title: 'R² Score',
        label: 'Explained Variance',
        description:
            'How well the model explains the variation in the data. Closer to 100 means better predictions.',
    },


}
