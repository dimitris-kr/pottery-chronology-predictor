import {Component} from '@angular/core';
import {Model, ModelVersion, ModelVersionFilters, ModelVersionSortBy, TargetScores} from '../../../core/models/model';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ApiModels} from '../../../core/services/api-models';
import {filter, map, switchMap} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {capitalize, getScoreColor, scoreColumn, scoreColumnLabel, taskExplanation} from '../../../core/utils/helpers';
import {
    MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource
} from '@angular/material/table';
import {RequestParams, SortOrder} from '../../../core/models/request-params';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {DatePipe, DecimalPipe, NgStyle, PercentPipe} from '@angular/common';
import {
    ModelVersionProgressChart
} from '../../../reusable/charts/model-version-progress-chart/model-version-progress-chart';
import {ModelScoresChart} from '../../../reusable/charts/model-scores-chart/model-scores-chart';

@Component({
    selector: 'app-models-single',
    imports: [
        MatIcon,
        MatIconButton,
        MatTooltip,
        RouterLink,
        MatSort,
        MatTable,
        MatHeaderRow,
        MatHeaderRowDef,
        MatRow,
        MatRowDef,
        MatCell,
        MatCellDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatSortHeader,
        DecimalPipe,
        PercentPipe,
        NgStyle,
        DatePipe,
        MatPaginator,
        ModelVersionProgressChart,
        ModelScoresChart
    ],
    templateUrl: './models-single.html',
    styleUrl: './models-single.scss',
})
export class ModelsSingle {
    model?: Model;

    versions = {
        data: new MatTableDataSource<ModelVersion>([]),
        total: 0,
        columns: [
            'current',
            'version',
            'sampleSize',
            'score',
            'trainedOn'
        ],
        params: {
            page: {
                offset: 0,
                limit: 25,
            },
            sort: {
                sort_by: 'created_at',
                order: 'desc',
            },
            filters: {},
        } as RequestParams<ModelVersionSortBy, ModelVersionFilters>,
        maxMae: 0,
    }

    versionsAll: ModelVersion[] = [];

    scores: TargetScores[] = [];

    constructor(
        private route: ActivatedRoute,
        private modelsApi: ApiModels,
    ) {
    }

    ngOnInit() {
        this.route.paramMap
            .pipe(
                map(params => Number(params.get('id'))),
                filter(id => !isNaN(id)),
                switchMap(id => this.modelsApi.getSingle(id))
            )
            .subscribe(model => {
                this.model = model;
                this.versions.params.filters.model_id = model.id;
                this.loadVersions();
                this.loadAllVersions();
                this.loadScores();
            });
    }

    loadVersions(event?: PageEvent): void {
        if (event) {
            this.versions.params.page.limit = event.pageSize;
            this.versions.params.page.offset = event.pageIndex * event.pageSize;
        }

        this.modelsApi
            .getAllVersions(this.versions.params)
            .subscribe(res => {
                this.versions.data.data = res.items;
                this.versions.total = res.total;

                const maes = res.items
                    .map(m => m.val_mae)
                    .filter(v => v !== null) as number[];

                this.versions.maxMae = maes.length ? Math.max(...maes) : 0;
            });
    }

    loadAllVersions() {
        if (!this.model) return;

        this.modelsApi
            .getSingleVersions(this.model.id)
            .subscribe(versions => this.versionsAll = versions);
    }

    loadScores() {
        if (!this.model) return;

        this.modelsApi
            .getSingleScores(this.model.id)
            .subscribe(scores => this.scores = scores);
    }

    onSortChange(sort: Sort): void {
        if (!sort.direction) return;
        this.versions.params.sort.sort_by = sort.active as ModelVersionSortBy;
        this.versions.params.sort.order = sort.direction as SortOrder;

        this.resetPagination();
        this.loadVersions();
    }

    resetPagination(): void {
        this.versions.params.page.offset = 0;
    }

    protected readonly capitalize = capitalize;
    protected readonly taskExplanation = taskExplanation;
    protected readonly scoreColumn = scoreColumn;
    protected readonly scoreColumnLabel = scoreColumnLabel;
    protected readonly getScoreColor = getScoreColor;
}
