import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {PotteryItem} from '../../../core/models/pottery-item';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ApiPotteryItems} from '../../../core/services/api-pottery-items';
import {ApiImages} from '../../../core/services/api-images';
import {Alert} from '../../../core/services/alert';
import {filter, forkJoin, map, switchMap, tap} from 'rxjs';
import {
    formatYear, getColor, getMatchClass, matchExplanation, shorten,
} from '../../../core/utils/helpers';
import {DatePipe, NgClass, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell, MatHeaderCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable,
    MatTableDataSource
} from '@angular/material/table';
import {Prediction, PredictionFilters, PredictionSortBy} from '../../../core/models/prediction';
import {RequestParams, SortOrder} from '../../../core/models/request-params';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ApiPredictions} from '../../../core/services/api-predictions';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {Breadcrumb} from '../../../core/services/breadcrumb';

@Component({
  selector: 'app-pottery-items-single',
    imports: [
        DatePipe,
        MatIcon,
        MatIconButton,
        MatTooltip,
        RouterLink,
        MatProgressSpinner,
        NgStyle,
        MatCell,
        MatCellDef,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatHeaderRow,
        MatHeaderRowDef,
        MatPaginator,
        MatRow,
        MatRowDef,
        MatSort,
        MatSortHeader,
        MatTable,
        NgClass,
        MatButton
    ],
  templateUrl: './pottery-items-single.html',
  styleUrl: './pottery-items-single.scss',
})
export class PotteryItemsSingle {
    potteryItem?: PotteryItem;
    // Blur Preview (LQIP): thumb appears instantly (usually already cached from the
    // table view) shown blurred, then full replaces it.
    thumbUrl?: string;
    fullUrl?: string;

    connectedPredictions = {
        data: new MatTableDataSource<Prediction>([]),
        total: 0,
        columns: [
            'id',
            'inputImage',
            'inputText',
            'outputType',
            'result',
            'match',
            'createdAt',
            'actions',
        ],
        images: new Map<number, string>(),
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
        } as RequestParams<PredictionSortBy, PredictionFilters>,
    }

    @ViewChild(MatPaginator) connectedPredictionsPaginator!: MatPaginator;

    constructor(
        private route: ActivatedRoute,
        private potteryItemsApi: ApiPotteryItems,
        private imagesApi: ApiImages,
        private predictionsApi: ApiPredictions,
        private alert: Alert,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private breadcrumb: Breadcrumb,
    ) {}

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map(params => Number(params.get('id'))),
                filter(id => !isNaN(id)),
                switchMap(id => this.potteryItemsApi.getSingle(id))
            )
            .subscribe(potteryItem => {
                this.potteryItem = potteryItem;
                this.cdr.markForCheck();
                this.loadImage(potteryItem);

                this.breadcrumb.setLabel(this.router.url, `Pottery Item #${potteryItem.id}`);

                this.connectedPredictions.params.filters.pottery_item_id = potteryItem.id;
                this.loadConnectedPredictions();
            });
    }

    private loadImage(pi: PotteryItem) {
        if (!pi.image_path) return;

        // thumb: fast (likely cached) → shown blurred as placeholder
        this.imagesApi.getImage(pi.image_path, 'thumb').subscribe(blob => {
            this.thumbUrl = URL.createObjectURL(blob);
            this.cdr.markForCheck();
        });
        // full: replaces thumb when loaded
        this.imagesApi.getImage(pi.image_path, 'full').subscribe(blob => {
            this.fullUrl = URL.createObjectURL(blob);
            this.cdr.markForCheck();
        });
    }

    loadConnectedPredictions(event?: PageEvent): void {
        if (event) {
            this.connectedPredictions.params.page.limit = event.pageSize;
            this.connectedPredictions.params.page.offset = event.pageIndex * event.pageSize;
        }

        this.predictionsApi
            .getAll(this.connectedPredictions.params)
            .subscribe(res => {
                this.connectedPredictions.data.data = res.items;
                this.connectedPredictions.total = res.total;
                this.cdr.markForCheck();
                this.loadConnectedPredictionsImages(res.items);
            });
    }

    loadConnectedPredictionsImages(items: Prediction[]) {
        const requests = items
            .filter(p => p.input_image_path && !this.connectedPredictions.images.has(p.id))
            .map(p =>
                this.imagesApi.getImage(p.input_image_path!, 'thumb').pipe(
                    tap(blob => {
                        this.connectedPredictions.images.set(p.id, URL.createObjectURL(blob));
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
        this.connectedPredictions.params.sort.sort_by = sort.active as PredictionSortBy;
        this.connectedPredictions.params.sort.order = sort.direction as SortOrder;

        this.resetPagination();
        this.loadConnectedPredictions();
    }

    resetPagination(): void {
        this.connectedPredictions.params.page.offset = 0;
        this.connectedPredictionsPaginator.pageIndex = 0;
    }

    ngOnDestroy() {
        if (this.thumbUrl) URL.revokeObjectURL(this.thumbUrl);
        if (this.fullUrl) URL.revokeObjectURL(this.fullUrl);
        for (const url of this.connectedPredictions.images.values()) {
            URL.revokeObjectURL(url);
        }
    }

    protected readonly formatYear = formatYear;
    protected readonly getColor = getColor;
    protected readonly shorten = shorten;
    protected readonly getMatchClass = getMatchClass;
    protected readonly matchExplanation = matchExplanation;
}
