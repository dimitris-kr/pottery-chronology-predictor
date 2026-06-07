import {Injectable, inject, signal} from '@angular/core';
import {finalize} from 'rxjs';
import {ApiPredictions} from './api-predictions';

/**
 * Shared, app-wide source of truth for the count of predictions awaiting expert
 * feedback (status === 'pending').
 *
 * Used by both the sidebar (menu badge) and the predictions page panel, so
 * the count is fetched once and stays in sync everywhere.
 * Call `refresh()` whenever something changes the pending count:
 * - a new prediction is created (+1)
 * - a pending prediction is resolved via feedback / deleted (−1).
 */
@Injectable({
  providedIn: 'root',
})
export class PendingPredictions {
    private readonly predictionsApi = inject(ApiPredictions);

    private readonly _count = signal(0);
    private readonly _loading = signal(false);

    readonly count = this._count.asReadonly();
    readonly loading = this._loading.asReadonly();

    refresh(): void {
        this._loading.set(true);
        this.predictionsApi.getPendingPredictionCount().pipe(
            finalize(() => this._loading.set(false))
        ).subscribe({
            next: pendingPredictions => this._count.set(pendingPredictions.count),
        });
    }
}
