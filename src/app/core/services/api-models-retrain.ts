import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {getApiUrl} from '../utils/request';
import {parseBackendDate} from '../utils/dates';
import {Eligibility, JobStatus, RetrainStarted, TrainingRun, RunStatus} from '../models/model-retrain';

@Injectable({
    providedIn: 'root',
})
export class ApiModelsRetrain {
    private readonly url = getApiUrl('models/retrain');

    constructor(private http: HttpClient) {
    }

    getEligibility(): Observable<Eligibility> {
        return this.http.get<Eligibility>(`${this.url}/eligibility`);
    }

    trigger(): Observable<RetrainStarted> {
        return this.http
            .post<any>(`${this.url}/trigger`, {})
            .pipe(
                map(raw => ({
                    ...raw,
                    new_training_run: this.normalize(raw.new_training_run),
                }))
            );
    }

    getStatus(jobId: string): Observable<JobStatus> {
        return this.http.get<JobStatus>(`${this.url}/status/${jobId}`);
    }

    getRunStatus(trainingRunId: number): Observable<RunStatus> {
        return this.http.get<RunStatus>(`${this.url}/run-status/${trainingRunId}`);
    }

    private normalize(raw: any): TrainingRun {
        return  {
            ...raw,
            created_at: parseBackendDate(raw.created_at),
        };
    }
}
