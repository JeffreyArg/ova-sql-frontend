import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Exercise, EvaluationResult } from '../../core/models/exercise.model';
import { ExerciseService } from '../../core/services/exercise.service';
import { ThemeService } from '../../core/services/theme.service';
import { SqlEditorComponent } from '../../shared/components/sql-editor/sql-editor.component';
import { ResultTableComponent } from '../../shared/components/result-table/result-table.component';
import { SchemaViewerComponent } from '../../shared/components/schema-viewer/schema-viewer.component';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [RouterLink, SqlEditorComponent, ResultTableComponent, SchemaViewerComponent],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
})
export class ExerciseComponent implements OnInit {
  @ViewChild(SqlEditorComponent) private sqlEditor?: SqlEditorComponent;

  private location = inject(Location);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  themeService = inject(ThemeService);

  exercise = signal<Exercise | null>(null);
  loading = signal(false);
  userQuery = signal('');
  evaluationResult = signal<EvaluationResult | null>(null);
  hintVisible = signal(false);
  difficulty = signal<string>('easy');

  ngOnInit(): void {
    const state = this.location.getState() as { difficulty?: string };
    if (!state?.difficulty) {
      this.router.navigate(['/']);
      return;
    }
    this.difficulty.set(state.difficulty);
    this.loadExercise();
  }

  private loadExercise(): void {
    this.loading.set(true);
    this.evaluationResult.set(null);
    this.userQuery.set('');
    this.hintVisible.set(false);
    this.sqlEditor?.clear();
    this.exerciseService.getRandom(this.difficulty()).subscribe({
      next: ex => {
        this.exercise.set(ex);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onQueryChange(query: string): void {
    this.userQuery.set(query);
  }

  submit(): void {
    if (!this.exercise() || !this.userQuery().trim()) return;
    this.loading.set(true);
    this.exerciseService.evaluate(this.exercise()!.id, this.userQuery()).subscribe({
      next: result => {
        this.evaluationResult.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  nextExercise(): void {
    this.loadExercise();
  }

  toggleHint(): void {
    this.hintVisible.set(!this.hintVisible());
  }

  get difficultyBadgeClass(): string {
    const map: Record<string, string> = {
      easy: 'bg-success',
      medium: 'bg-warning text-dark',
      hard: 'bg-danger',
    };
    return map[this.difficulty()] ?? 'bg-secondary';
  }

  get difficultyLabel(): string {
    const map: Record<string, string> = {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
    };
    return map[this.difficulty()] ?? this.difficulty();
  }
}
