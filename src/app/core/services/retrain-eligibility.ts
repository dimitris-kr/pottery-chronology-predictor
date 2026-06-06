import {Injectable, computed, inject, signal} from '@angular/core';
import {ApiModelsRetrain} from './api-models-retrain';
import {Eligibility} from '../models/model-retrain';
import {finalize} from 'rxjs';

/**
 * Shared, app-wide source of truth for retrain eligibility.
 *
 * Consumed by both the sidebar (menu badge) and the retrain panel, so the
 * count is fetched once and stays in sync everywhere. Call `refresh()` whenever
 * something changes the count of newly validated items (a successful retrain, or
 * a new labeled pottery item created via prediction feedback).
 */
@Injectable({
  providedIn: 'root',
})
export class RetrainEligibility {
    private readonly retrainApi = inject(ApiModelsRetrain);

    private readonly _eligibility = signal<Eligibility | null>(null);
    private readonly _loading = signal(false);

    readonly eligibility = this._eligibility.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly eligible = computed(() => this._eligibility()?.eligible ?? false);
    readonly newItemsCount = computed(() => this._eligibility()?.new_items_count ?? 0);
    readonly recommendedThreshold = computed(() => this._eligibility()?.recommended_threshold ?? 0);

    refresh(): void {
        this._loading.set(true);
        this.retrainApi.getEligibility().pipe(
            finalize(() => this._loading.set(false))
        ).subscribe({
            next: eligibility => {
                this._eligibility.set(eligibility);
                // this._eligibility.set({eligible: false, new_items_count: 0, recommended_threshold: 86});
            },
        });
    }
}
