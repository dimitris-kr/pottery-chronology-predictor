import {Injectable} from '@angular/core';
import {getApiUrl} from '../utils/request';
import {HttpClient} from '@angular/common/http';
import {RequestParams} from '../models/request-params';
import {map, Observable} from 'rxjs';
import {PaginatedResponse} from '../models/paginated-response';
import {cleanParams} from '../utils/helpers';
import {
    Model,
    ModelFilters,
    ModelVersion,
    ModelVersionFilters,
    ModelVersionSortBy,
    TargetScores
} from '../models/model';
import {parseBackendDate} from '../utils/dates';

@Injectable({
    providedIn: 'root',
})
export class ApiModels {
    private readonly url = getApiUrl('models');

    constructor(private http: HttpClient) {
    }

    getAll(
        params: RequestParams<ModelVersionSortBy, ModelFilters>
    ): Observable<PaginatedResponse<ModelVersion>> {
        return this.http
            .get<any>(this.url, {params: {...params.page, ...params.sort, ...cleanParams(params.filters)}})
            .pipe(
                map(res => ({
                    items: res.items.map((raw: any) => this.normalize(raw)),
                    total: res.total,
                    limit: res.limit,
                    offset: res.offset,
                }))
            );
    }

    getAllVersions(
        params: RequestParams<ModelVersionSortBy, ModelVersionFilters>
    ): Observable<PaginatedResponse<ModelVersion>> {
        return this.http
            .get<any>(`${this.url}/versions`, {params: {...params.page, ...params.sort, ...cleanParams(params.filters)}})
            .pipe(
                map(res => ({
                    items: res.items.map((raw: any) => this.normalize(raw)),
                    total: res.total,
                    limit: res.limit,
                    offset: res.offset,
                }))
            );
    }

    getSingle(id: number): Observable<Model> {
        return this.http
            .get<Model>(`${this.url}/${id}`);
    }


    getSingleVersions(id: number): Observable<ModelVersion[]> {
        return this.http
            .get<any>(`${this.url}/${id}/versions`)
            .pipe(
                map(items => (items.map((raw: any) => this.normalize(raw))))
            );
    }

    getSingleScores(id: number): Observable<TargetScores[]> {
        return this.http
            .get<TargetScores[]>(`${this.url}/${id}/scores`);
    }

    private normalize(raw: any): ModelVersion {
        return {
            ...raw,
            created_at: parseBackendDate(raw.created_at),
        };
    }
}
