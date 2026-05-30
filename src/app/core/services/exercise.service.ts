import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise, EvaluationResult } from '../models/exercise.model';

const API_BASE = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private http = inject(HttpClient);

  getRandom(difficulty?: string): Observable<Exercise> {
    let params = new HttpParams();
    if (difficulty) params = params.set('difficulty', difficulty);
    return this.http.get<Exercise>(`${API_BASE}/exercises/random`, { params });
  }

  evaluate(exerciseId: string, userQuery: string): Observable<EvaluationResult> {
    return this.http.post<EvaluationResult>(`${API_BASE}/evaluation`, {
      exerciseId,
      userQuery,
    });
  }
}
