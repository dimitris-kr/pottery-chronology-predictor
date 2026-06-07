import {Injectable} from '@angular/core';
import {
    ClassificationPrediction, PendingPredictionCount,
    Prediction,
    PredictionFilters,
    PredictionSortBy,
    RegressionPredictionResult
} from '../models/prediction';
import {parseBackendDate} from '../utils/dates';
import {getApiUrl} from '../utils/request';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {PaginatedResponse} from '../models/paginated-response';
import {RequestParams} from '../models/request-params';
import {cleanParams} from '../utils/helpers';
import {PotteryItemCreateFromPredictionRequest} from '../models/pottery-item';

@Injectable({
    providedIn: 'root',
})
export class ApiPredictions {

    private readonly url = getApiUrl('predictions');

    constructor(private http: HttpClient) {
    }

    /*getAll(
        limit = 25,
        offset = 0,
        sort_by: 'created_at' | 'id' = 'created_at',
        order: 'asc' | 'desc' = 'desc'
    ): Observable<PaginatedResponse<Prediction>> {
        return this.http
            .get<any>(this.url, {params: {limit, offset, sort_by, order}})
            .pipe(
                map(res => ({
                    items: res.items.map((raw: any) => this.normalizePrediction(raw)),
                    total: res.total,
                    limit: res.limit,
                    offset: res.offset,
                }))
            );
    }*/

    getAll(
        params: RequestParams<PredictionSortBy, PredictionFilters>
    ): Observable<PaginatedResponse<Prediction>> {
        return this.http
            .get<any>(this.url, {params: {...params.page, ...params.sort, ...cleanParams(params.filters)}})
            .pipe(
                map(res => ({
                    items: res.items.map((raw: any) => this.normalizePrediction(raw)),
                    total: res.total,
                    limit: res.limit,
                    offset: res.offset,
                }))
            );
    }

    getSingle(id: number): Observable<Prediction> {
        return this.http
            .get(`${this.url}/${id}`)
            .pipe(map(raw => this.normalizePrediction(raw)));
    }

    create(formData: FormData): Observable<Prediction> {
        return this.http
            .post<any>(this.url, formData)
            .pipe(
                map(raw => this.normalizePrediction(raw))
            );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }

    getPendingPredictionCount(): Observable<PendingPredictionCount> {
        return this.http.get<PendingPredictionCount>(`${this.url}/pending`);
    }

    private normalizePrediction(raw: any): Prediction {
        const base = {
            ...raw,
            created_at: parseBackendDate(raw.created_at),
        };

        if (raw.historical_period) {
            return {
                ...base,
                task: 'classification',
            } as ClassificationPrediction;
        }

        return {
            ...base,
            task: 'regression',
        } as RegressionPredictionResult;
    }

    giveFeedbackConnect(
        predictionId: number,
        potteryItemId: number
    ): Observable<Prediction> {
        return this.http.post<Prediction>(
            `${this.url}/${predictionId}/feedback/connect`,
            {pottery_item_id: potteryItemId}
        );
    }

    giveFeedbackCreate(
        predictionId: number,
        payload: PotteryItemCreateFromPredictionRequest
    ): Observable<Prediction> {
        return this.http.post<Prediction>(
            `${this.url}/${predictionId}/feedback/create`,
            payload,
        );
    }

}
