import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ExerciseComponent } from './exercise.component';
import { ExerciseService } from '../../core/services/exercise.service';
import { Exercise, EvaluationResult } from '../../core/models/exercise.model';

const mockExercise: Exercise = {
  id: 'abc-123',
  title: 'JOIN entre empleados y departamentos',
  description: 'Muestra el nombre de cada empleado junto con su departamento.',
  difficulty: 'medium',
  hint: 'Usa INNER JOIN ... ON',
  orderMatters: false,
  tables: [
    {
      id: '1',
      tableName: 'employees',
      createStatement: 'CREATE TABLE employees (id INT, name TEXT, dept_id INT);',
      insertStatement: "INSERT INTO employees VALUES (1, 'Alice', 1);",
      displayOrder: 0,
    },
  ],
};

const mockCorrectResult: EvaluationResult = {
  correct: true,
  feedback: '¡Correcto! Tu query retornó los resultados esperados.',
  userResult: { columns: ['name'], rows: [['Alice']] },
  expectedResult: { columns: ['name'], rows: [['Alice']] },
  executionError: null,
};

describe('ExerciseComponent', () => {
  let fixture: ComponentFixture<ExerciseComponent>;
  let exerciseService: { getRandom: ReturnType<typeof vi.fn>, evaluate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    exerciseService = {
      getRandom: vi.fn().mockReturnValue(of(mockExercise)),
      evaluate: vi.fn().mockReturnValue(of(mockCorrectResult)),
    };

    await TestBed.configureTestingModule({
      imports: [ExerciseComponent],
      providers: [
        provideRouter([]),
        { provide: ExerciseService, useValue: exerciseService },
        { provide: Location, useValue: { getState: vi.fn().mockReturnValue({ difficulty: 'medium' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('calls getRandom with the difficulty from router state', () => {
    expect(exerciseService.getRandom).toHaveBeenCalledWith('medium');
  });

  it('displays the exercise title', () => {
    expect(fixture.nativeElement.textContent).toContain('JOIN entre empleados y departamentos');
  });

  it('displays the exercise description', () => {
    expect(fixture.nativeElement.textContent).toContain('Muestra el nombre de cada empleado');
  });

  it('shows the medium difficulty badge', () => {
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('Medio');
  });

  it('submit() calls evaluate with exerciseId and userQuery', () => {
    fixture.componentInstance.userQuery.set('SELECT * FROM employees');
    fixture.detectChanges();
    fixture.componentInstance.submit();
    expect(exerciseService.evaluate).toHaveBeenCalledWith('abc-123', 'SELECT * FROM employees');
  });
});
