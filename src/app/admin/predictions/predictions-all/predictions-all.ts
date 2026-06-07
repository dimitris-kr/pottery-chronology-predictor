import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild} from '@angular/core';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
    MatTable,
    MatTableDataSource
} from '@angular/material/table';
import {Prediction, PredictionFilters, PredictionSortBy} from '../../../core/models/prediction';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ApiPredictions} from '../../../core/services/api-predictions';
import {PendingPredictions} from '../../../core/services/pending-predictions';
import {MatIcon} from '@angular/material/icon';
import {DatePipe, NgClass} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {formatYear, getMatchClass, matchClassMap, matchExplanation, shorten} from '../../../core/utils/helpers';
import {ApiImages} from '../../../core/services/api-images';
import {debounceTime, forkJoin, tap} from 'rxjs';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {RequestParams, SortOrder} from '../../../core/models/request-params';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from '@angular/material/expansion';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {MatRipple} from '@angular/material/core';
import {MatBadge} from '@angular/material/badge';

@Component({
    selector: 'app-predictions-all',
    imports: [
        MatTable,
        MatColumnDef,
        MatHeaderCell,
        MatCell,
        MatCellDef,
        MatHeaderCellDef,
        MatIcon,
        DatePipe,
        MatIconButton,
        RouterLink,
        MatHeaderRow,
        MatRow,
        MatHeaderRowDef,
        MatRowDef,
        MatPaginator,
        MatProgressSpinner,
        MatSort,
        MatSortModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatFormField,
        MatLabel,
        MatSelect,
        MatOption,
        ReactiveFormsModule,
        MatButton,
        NgClass,
        MatTooltip,
        MatBadge,
    ],
    templateUrl: './predictions-all.html',
    styleUrl: './predictions-all.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictionsAll implements OnInit {

    displayedColumns: string[] = [
        'id',
        'inputImage',
        'inputText',
        'outputType',
        // 'model',
        'result',
        'feedback',
        'match',
        'createdAt',
        'actions',
    ];

    dataSource = new MatTableDataSource<Prediction>([]);
    total = 0;

    imageUrls = new Map<number, string>();

    params: RequestParams<PredictionSortBy, PredictionFilters> = {
        page: {
            offset: 0,
            limit: 25,
        },
        sort: {
            sort_by: 'created_at',
            order: 'desc',
        },
        filters: {},
    };

    filtersForm: FormGroup;

    /** Shared pending predictions count - same source the sidebar badge reads from. */
    protected readonly pending = inject(PendingPredictions);

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        private predictionsApi: ApiPredictions,
        private imagesApi: ApiImages,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
    ) {
        this.filtersForm = this.fb.group<PredictionFilters>({
            input_type: undefined,
            output_type: undefined,
            status: undefined,
            match: undefined,
        });
    }

    ngOnInit(): void {
        this.loadPage();

        this.pending.refresh();

        this.filtersForm.valueChanges
            .pipe(debounceTime(300))
            .subscribe(filters => {
                this.params.filters = filters;
                this.resetPagination();
                this.loadPage();
            });
    }

    loadPage(event?: PageEvent): void {
        if (event) {
            this.params.page.limit = event.pageSize;
            this.params.page.offset = event.pageIndex * event.pageSize;
        }

        this.predictionsApi
            .getAll(this.params)
            .subscribe(res => {
                this.dataSource.data = res.items;
                this.total = res.total;
                this.cdr.markForCheck();
                this.loadImages(res.items);
            });
    }


    loadImages(items: Prediction[]) {
        const requests = items
            .filter(p => p.input_image_path && !this.imageUrls.has(p.id))
            .map(p =>
                this.imagesApi.getImage(p.input_image_path!, 'thumb').pipe(
                    tap(blob => {
                        this.imageUrls.set(p.id, URL.createObjectURL(blob));
                    })
                )
            );

        if (requests.length === 0) return;

        forkJoin(requests).subscribe(() => {
            this.cdr.markForCheck();
        });
    }

    onSortChange(sort: Sort): void {
        if (!sort.direction) return;
        this.params.sort.sort_by = sort.active as PredictionSortBy;
        this.params.sort.order = sort.direction as SortOrder;

        this.resetPagination();
        this.loadPage();
    }

    resetPagination(): void {
        this.params.page.offset = 0;
        this.paginator.pageIndex = 0;
    }

    /** Apply filter for predictions with feedback status = pending. */
    viewPending(): void {
        this.filtersForm.patchValue({status: 'pending'});
    }

    resetPending(): void {
        this.filtersForm.patchValue({status: undefined});
    }

    clearFilters(): void {
        this.filtersForm.reset({
            input_type: undefined,
            output_type: undefined,
            status: undefined,
            match: undefined,
        });
    }

    activePendingStatusFilter(): boolean {
        return this.filtersForm.value.status === 'pending';
    }

    activeFiltersCount(): number {
        const values = this.filtersForm.value;
        let count: number = 0;
        if (values.input_type) count++;
        if (values.output_type) count++;
        if (values.status) count++;
        if (values.match) count++;
        return count;
    }

    activeFilters(): boolean {
        return this.activeFiltersCount() > 0;

        /*const values = this.filtersForm.value;
        return values.input_type || values.output_type || values.status || values.match;*/
    }

    ngOnDestroy() {
        for (const url of this.imageUrls.values()) {
            URL.revokeObjectURL(url);
        }
    }

    protected readonly shorten = shorten;
    protected readonly formatYear = formatYear;
    protected readonly matchExplanation = matchExplanation;
    protected readonly getMatchClass = getMatchClass;
}
