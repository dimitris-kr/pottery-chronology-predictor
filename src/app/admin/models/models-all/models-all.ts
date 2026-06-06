import {Component, OnInit, ViewChild} from '@angular/core';
import {ModelFilters, ModelVersion, ModelVersionSortBy, Task} from '../../../core/models/model';
import {
    MatCell, MatCellDef,
    MatColumnDef, MatHeaderCell, MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource
} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {RequestParams, SortOrder} from '../../../core/models/request-params';
import {ApiModels} from '../../../core/services/api-models';
import {ApiTasks} from '../../../core/services/api-tasks';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {capitalize, getScoreColor, scoreColumn, scoreColumnLabel, taskExplanation} from '../../../core/utils/helpers';
import {DatePipe, DecimalPipe, NgStyle, PercentPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ModelsRetrain} from '../models-retrain/models-retrain';

@Component({
    selector: 'app-models-all',
    imports: [
        MatIcon,
        MatIconButton,
        MatTooltip,
        MatSort,
        MatSortModule,
        MatTable,
        MatHeaderRow,
        MatRow,
        MatHeaderRowDef,
        MatRowDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatCell,
        MatCellDef,
        MatPaginator,
        DatePipe,
        PercentPipe,
        DecimalPipe,
        NgStyle,
        RouterLink,
        ModelsRetrain,
    ],
    templateUrl: './models-all.html',
    styleUrl: './models-all.scss',
})
export class ModelsAll implements OnInit {
    tasks: Task[] = [];
    modelsTables: ModelsTable[] = [];

    displayedColumns: string[] = [
        'model',
        'version',
        'inputType',
        'outputType',
        'score',
        'lastTrained',
        'actions',
    ];

    constructor(
        private tasksApi: ApiTasks,
        private modelsApi: ApiModels,
    ) {
    }

    ngOnInit() {
        this.tasksApi.getAllNoPag().subscribe(
            tasks => {
                this.tasks = tasks;

                this.modelsTables = tasks.map(task => ({
                    task,
                    dataSource: new MatTableDataSource<ModelVersion>([]),
                    total: 0,
                    params: {
                        page: {offset: 0, limit: 25},
                        sort: {sort_by: 'model_id', order: 'asc'},
                        filters: {task_id: task.id}
                    },
                    maxMae: 0,
                }));

                this.modelsTables.forEach(table => this.loadPage(table));
            },
        );
    }

    loadPage(table: ModelsTable, event?: PageEvent) {
        if (event) {
            table.params.page.limit = event.pageSize;
            table.params.page.offset = event.pageIndex * event.pageSize;
        }

        this.modelsApi.getAll(table.params).subscribe(res => {
            table.dataSource.data = res.items;
            table.total = res.total;

            const maes = res.items
                .map(m => m.val_mae)
                .filter(v => v !== null) as number[];

            table.maxMae = maes.length ? Math.max(...maes) : 0;
        });
    }

    resetPagination(table: ModelsTable) {
        table.params.page.offset = 0;
    }

    onSortChange(table: ModelsTable, sort: Sort) {
        if (!sort.direction) return;

        table.params.sort.sort_by = sort.active as ModelVersionSortBy;
        table.params.sort.order = sort.direction as SortOrder;

        this.resetPagination(table);
        this.loadPage(table);
    }

    protected readonly taskExplanation = taskExplanation;
    protected readonly capitalize = capitalize;
    protected readonly scoreColumn = scoreColumn;
    protected readonly scoreColumnLabel = scoreColumnLabel;
    protected readonly getScoreColor = getScoreColor;
}

interface ModelsTable {
    task: Task;
    dataSource: MatTableDataSource<ModelVersion>;
    total: number;
    params: RequestParams<ModelVersionSortBy, ModelFilters>;
    maxMae: number;
}
