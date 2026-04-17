import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MetricScore, TargetLiteral, TargetScores} from '../../../core/models/model';
import {EChartsOption} from 'echarts';
import {NgxEchartsDirective} from 'ngx-echarts';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {capitalize, getScoreColor, HIGH_IS_GOOD, LOW_IS_GOOD} from '../../../core/utils/helpers';
import {CommonModule} from '@angular/common';
import {METRIC_INFO_MAP, MetricInfo} from '../../../core/utils/metric-info';

@Component({
    selector: 'app-model-scores-chart',
    imports: [
        CommonModule,
        NgxEchartsDirective,
        MatButtonToggleGroup,
        MatButtonToggle
    ],
    templateUrl: './model-scores-chart.html',
    styleUrl: './model-scores-chart.scss',
})
export class ModelScoresChart implements OnChanges {
    @Input({required: true})
    scores: TargetScores[] = [];

    selectedTarget!: TargetLiteral;

    highOption: any = null;
    lowOption: any = null;

    highHeight: string = '';
    lowHeight: string = '';

    metricsInfo: MetricInfo[] = [];

    ngOnChanges() {
        if (!this.scores?.length) return;

        // default target
        this.selectedTarget = this.scores[0].target;
        this.updateChart();
    }

    onTargetChange(target: TargetLiteral) {
        this.selectedTarget = target;
        this.updateChart();
    }

    buildChart(scores: MetricScore[], valLim: any = 'dataMax') {
        const labels = scores.map(s => s.metric.toUpperCase());
        const values = scores.map(s => s.value);
        const maxValue = Math.max(...values);

        return {
            grid: {
                left: 0,
                right: 60,
                top: 20,
                bottom: 20,
            },

            xAxis: {
                type: 'value',
                name: 'Score',
                max: valLim
            },

            yAxis: {
                type: 'category',
                name: 'Metric',
                data: labels,
                axisTick: {show: false},
                axisLine: {show: false},
                axisLabel: {
                    fontWeight: 500,
                },
            },

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: (params: any) => {
                    const p = params[0];
                    return `${p.name}: <b>${this.formatValue(p.name, p.value)}</b>`;
                },
            },

            series: [
                {
                    type: 'bar',
                    data: values,
                    barWidth: 40,
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: (params: any) =>
                            getScoreColor(valLim === 100 ? params.value / 100 : params.value, params.name, maxValue),
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (p: any) => this.formatValue(p.name, p.value),
                    },
                },
            ],
        };
    }

    updateChart() {
        const current = this.scores.find(s => s.target === this.selectedTarget);
        if (!current) return;

        let {high, low} = this.splitScores(current.scores);

        high = high.map(score => ({...score, value: score.value * 100}));

        this.highOption = high.length ? this.buildChart(high, 100) : null;
        this.lowOption = low.length ? this.buildChart(low) : null;

        this.highHeight = `${high.length * 100}px`;
        this.lowHeight = `${low.length * 100}px`;

        this.metricsInfo = this.getActiveMetrics(current.scores);
    }

    /**
     * Format values nicely
     */
    formatValue(metric: string, val: number): string {
        let formatted = val.toFixed(2);
        if (HIGH_IS_GOOD.includes(metric.toLowerCase())) {
            formatted += '%';
        } else if (LOW_IS_GOOD.includes(metric.toLowerCase())) {
            formatted += ' years';
        }
        return formatted;
    }

    splitScores(scores: MetricScore[]) {
        return {
            high: scores.filter(s =>
                HIGH_IS_GOOD.includes(s.metric.toLowerCase())
            ),
            low: scores.filter(s =>
                LOW_IS_GOOD.includes(s.metric.toLowerCase())
            ),
        };
    }

    getActiveMetrics(scores: MetricScore[]): MetricInfo[] {
        const uniqueMetrics = Array.from(
            new Set(scores.map(s => s.metric.toLowerCase()))
        );

        return uniqueMetrics
            .map(metric => METRIC_INFO_MAP[metric])
            .filter(Boolean);
    }

    protected readonly capitalize = capitalize;
}
