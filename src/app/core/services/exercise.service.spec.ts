import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExerciseService } from './exercise.service';
import { Exercise, EvaluationResult } from '../models/exercise.model';

const API_BASE = 'http://localhost:3000/api/v1';

const mockExercise: Exercise = {
  id: 'abc-123',
  title: 'Test exercise',
  description: 'Desc',
  difficulty: 'easy',
  hint: 'Hint',
  orderMatters: false,
  tables: [],
};

describe('ExerciseService', () => {
  let service: ExerciseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExerciseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getRandom without difficulty hits the correct URL', () => {
    service.getRandom().subscribe((e: Exercise) => expect(e).toEqual(mockExercise));
    const req = httpMock.expectOne(`${API_BASE}/exercises/random`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExercise);
  });

  it('getRandom with difficulty appends the query param', () => {
    service.getRandom('easy').subscribe();
    const req = httpMock.expectOne(`${API_BASE}/exercises/random?difficulty=easy`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExercise);
  });

  it('evaluate sends correct POST body', () => {
    const mockResult: EvaluationResult = {
      correct: true,
      feedback: '¡Correcto!',
      userResult: null,
      expectedResult: null,
      executionError: null,
    };
    service.evaluate('abc-123', 'SELECT * FROM t').subscribe((r: EvaluationResult) => expect(r).toEqual(mockResult));
    const req = httpMock.expectOne(`${API_BASE}/evaluation`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ exerciseId: 'abc-123', userQuery: 'SELECT * FROM t' });
    req.flush(mockResult);
  });
});
