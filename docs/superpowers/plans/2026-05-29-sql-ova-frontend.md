# SQL OVA Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Angular 21 SQL-practice OVA where users pick a difficulty, get a random exercise, write a query in a CodeMirror editor, and receive instant feedback with result comparison.

**Architecture:** Two-route Angular 21 app (standalone components + signals). `HomeComponent` at `/` shows difficulty cards; `ExerciseComponent` at `/exercise` renders a Bootstrap split-panel layout. Three shared components (`SqlEditorComponent`, `ResultTableComponent`, `SchemaViewerComponent`) plus two services (`ExerciseService`, `ThemeService`).

**Tech Stack:** Angular 21, Bootstrap 5 + Bootstrap Icons, CodeMirror 6 (`codemirror`, `@codemirror/lang-sql`, `@codemirror/theme-one-dark`), Vitest (already configured).

---

## File Map

| Action | File |
|--------|------|
| Modify | `angular.json` |
| Modify | `src/styles.css` |
| Create | `src/app/core/models/exercise.model.ts` |
| Create | `src/app/core/services/theme.service.ts` |
| Create | `src/app/core/services/theme.service.spec.ts` |
| Create | `src/app/core/services/exercise.service.ts` |
| Create | `src/app/core/services/exercise.service.spec.ts` |
| Create | `src/app/shared/components/result-table/result-table.component.ts` |
| Create | `src/app/shared/components/result-table/result-table.component.html` |
| Create | `src/app/shared/components/result-table/result-table.component.css` |
| Create | `src/app/shared/components/result-table/result-table.component.spec.ts` |
| Create | `src/app/shared/components/schema-viewer/schema-viewer.component.ts` |
| Create | `src/app/shared/components/schema-viewer/schema-viewer.component.html` |
| Create | `src/app/shared/components/schema-viewer/schema-viewer.component.css` |
| Create | `src/app/shared/components/schema-viewer/schema-viewer.component.spec.ts` |
| Create | `src/app/shared/components/sql-editor/sql-editor.component.ts` |
| Create | `src/app/shared/components/sql-editor/sql-editor.component.html` |
| Create | `src/app/shared/components/sql-editor/sql-editor.component.css` |
| Create | `src/app/shared/components/sql-editor/sql-editor.component.spec.ts` |
| Create | `src/app/pages/home/home.component.ts` |
| Create | `src/app/pages/home/home.component.html` |
| Create | `src/app/pages/home/home.component.css` |
| Create | `src/app/pages/home/home.component.spec.ts` |
| Create | `src/app/pages/exercise/exercise.component.ts` |
| Create | `src/app/pages/exercise/exercise.component.html` |
| Create | `src/app/pages/exercise/exercise.component.css` |
| Create | `src/app/pages/exercise/exercise.component.spec.ts` |
| Modify | `src/app/app.routes.ts` |
| Modify | `src/app/app.config.ts` |
| Modify | `src/app/app.ts` |
| Modify | `src/app/app.html` |

---

## Task 1: Install dependencies and configure Angular

**Files:**
- Modify: `angular.json`
- Modify: `src/styles.css`

- [ ] **Step 1: Install npm packages**

```bash
npm install bootstrap bootstrap-icons codemirror @codemirror/lang-sql @codemirror/theme-one-dark
```

Expected: packages installed under `node_modules/`.

- [ ] **Step 2: Add Bootstrap and Bootstrap Icons to angular.json styles/scripts**

Open `angular.json`. Find the `"styles"` array under `projects.ova-sql-frontend.architect.build.options` and replace it. Also add a `"scripts"` array in the same `options` object:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

- [ ] **Step 3: Add global CSS to src/styles.css**

Replace the entire content of `src/styles.css`:

```css
.schema-code {
  font-size: 0.8rem;
  white-space: pre;
  overflow-x: auto;
  margin: 0;
}

.cm-wrapper {
  border-radius: 0.375rem;
  overflow: hidden;
}
```

- [ ] **Step 4: Verify the build compiles**

```bash
npm run build -- --configuration development
```

Expected: build succeeds with no errors (warnings about bundle size are OK).

- [ ] **Step 5: Commit**

```bash
git add angular.json src/styles.css package.json package-lock.json
git commit -m "feat: install Bootstrap 5, Bootstrap Icons and CodeMirror 6"
```

---

## Task 2: Data models

**Files:**
- Create: `src/app/core/models/exercise.model.ts`

These are pure TypeScript interfaces — no runtime behavior, no tests needed.

- [ ] **Step 1: Create the models file**

Create `src/app/core/models/exercise.model.ts`:

```typescript
export interface ExerciseTable {
  id: string;
  tableName: string;
  createStatement: string;
  insertStatement: string;
  displayOrder: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  orderMatters: boolean;
  tables: ExerciseTable[];
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
}

export interface EvaluationResult {
  correct: boolean;
  feedback: string;
  userResult: QueryResult | null;
  expectedResult: QueryResult | null;
  executionError: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/core/models/exercise.model.ts
git commit -m "feat: add exercise data model interfaces"
```

---

## Task 3: ThemeService

**Files:**
- Create: `src/app/core/services/theme.service.ts`
- Create: `src/app/core/services/theme.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/core/services/theme.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  function createService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
    TestBed.resetTestingModule();
  });

  it('defaults to light when localStorage is empty', () => {
    const service = createService();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('reads persisted theme from localStorage on init', () => {
    localStorage.setItem('theme', 'dark');
    const service = createService();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('toggles from light to dark', () => {
    const service = createService();
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('toggles from dark back to light', () => {
    const service = createService();
    service.toggle();
    service.toggle();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `ThemeService` not found / cannot read `theme`.

- [ ] **Step 3: Implement ThemeService**

Create `src/app/core/services/theme.service.ts`:

```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  );

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    const next: 'light' | 'dark' = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem('theme', next);
    this.applyTheme(next);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 4 ThemeService tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/theme.service.ts src/app/core/services/theme.service.spec.ts
git commit -m "feat: add ThemeService with Bootstrap dark mode toggle"
```

---

## Task 4: ExerciseService

**Files:**
- Create: `src/app/core/services/exercise.service.ts`
- Create: `src/app/core/services/exercise.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/core/services/exercise.service.spec.ts`:

```typescript
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
    service.getRandom().subscribe(e => expect(e).toEqual(mockExercise));
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
    service.evaluate('abc-123', 'SELECT * FROM t').subscribe(r => expect(r).toEqual(mockResult));
    const req = httpMock.expectOne(`${API_BASE}/evaluation`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ exerciseId: 'abc-123', userQuery: 'SELECT * FROM t' });
    req.flush(mockResult);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `ExerciseService` not found.

- [ ] **Step 3: Implement ExerciseService**

Create `src/app/core/services/exercise.service.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 3 ExerciseService tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/exercise.service.ts src/app/core/services/exercise.service.spec.ts
git commit -m "feat: add ExerciseService with getRandom and evaluate methods"
```

---

## Task 5: ResultTableComponent

**Files:**
- Create: `src/app/shared/components/result-table/result-table.component.ts`
- Create: `src/app/shared/components/result-table/result-table.component.html`
- Create: `src/app/shared/components/result-table/result-table.component.css`
- Create: `src/app/shared/components/result-table/result-table.component.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/shared/components/result-table/result-table.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultTableComponent } from './result-table.component';

describe('ResultTableComponent', () => {
  let fixture: ComponentFixture<ResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ResultTableComponent);
  });

  it('shows empty message when data is null', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Sin resultados');
  });

  it('renders a column header for each column', () => {
    fixture.componentRef.setInput('data', {
      columns: ['name', 'age'],
      rows: [['Alice', 30]],
    });
    fixture.detectChanges();
    const ths = fixture.nativeElement.querySelectorAll('th');
    expect(ths.length).toBe(2);
    expect(ths[0].textContent.trim()).toBe('name');
    expect(ths[1].textContent.trim()).toBe('age');
  });

  it('renders a row for each data row', () => {
    fixture.componentRef.setInput('data', {
      columns: ['name'],
      rows: [['Alice'], ['Bob']],
    });
    fixture.detectChanges();
    const trs = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(trs.length).toBe(2);
    expect(trs[0].textContent.trim()).toBe('Alice');
    expect(trs[1].textContent.trim()).toBe('Bob');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `ResultTableComponent` not found.

- [ ] **Step 3: Create ResultTableComponent**

Create `src/app/shared/components/result-table/result-table.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { QueryResult } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-result-table',
  standalone: true,
  templateUrl: './result-table.component.html',
  styleUrl: './result-table.component.css',
})
export class ResultTableComponent {
  data = input<QueryResult | null>(null);
}
```

Create `src/app/shared/components/result-table/result-table.component.html`:

```html
@if (data()) {
  <div class="table-responsive">
    <table class="table table-bordered table-sm table-hover mb-0">
      <thead class="table-dark">
        <tr>
          @for (col of data()!.columns; track col) {
            <th>{{ col }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of data()!.rows; track $index) {
          <tr>
            @for (cell of row; track $index) {
              <td>{{ cell }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  </div>
} @else {
  <p class="text-muted small mb-0">Sin resultados.</p>
}
```

Create `src/app/shared/components/result-table/result-table.component.css`:

```css
/* intentionally empty — Bootstrap utilities handle all styling */
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 3 ResultTableComponent tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/components/result-table/
git commit -m "feat: add ResultTableComponent"
```

---

## Task 6: SchemaViewerComponent

**Files:**
- Create: `src/app/shared/components/schema-viewer/schema-viewer.component.ts`
- Create: `src/app/shared/components/schema-viewer/schema-viewer.component.html`
- Create: `src/app/shared/components/schema-viewer/schema-viewer.component.css`
- Create: `src/app/shared/components/schema-viewer/schema-viewer.component.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/shared/components/schema-viewer/schema-viewer.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchemaViewerComponent } from './schema-viewer.component';
import { ExerciseTable } from '../../../core/models/exercise.model';

const mockTables: ExerciseTable[] = [
  {
    id: '1',
    tableName: 'employees',
    createStatement: 'CREATE TABLE employees (id INT, name TEXT);',
    insertStatement: "INSERT INTO employees VALUES (1, 'Alice');",
    displayOrder: 0,
  },
  {
    id: '2',
    tableName: 'departments',
    createStatement: 'CREATE TABLE departments (id INT, name TEXT);',
    insertStatement: "INSERT INTO departments VALUES (1, 'Engineering');",
    displayOrder: 1,
  },
];

describe('SchemaViewerComponent', () => {
  let fixture: ComponentFixture<SchemaViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaViewerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SchemaViewerComponent);
  });

  it('renders one nav-link tab per table', () => {
    fixture.componentRef.setInput('tables', mockTables);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.nav-link');
    expect(tabs.length).toBe(2);
    expect(tabs[0].textContent).toContain('employees');
    expect(tabs[1].textContent).toContain('departments');
  });

  it('shows the first table content by default', () => {
    fixture.componentRef.setInput('tables', mockTables);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CREATE TABLE employees');
  });

  it('switches content when a different tab is clicked', () => {
    fixture.componentRef.setInput('tables', mockTables);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.nav-link')[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CREATE TABLE departments');
    expect(fixture.nativeElement.textContent).not.toContain('CREATE TABLE employees');
  });

  it('renders nothing when tables array is empty', () => {
    fixture.componentRef.setInput('tables', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-tabs')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `SchemaViewerComponent` not found.

- [ ] **Step 3: Create SchemaViewerComponent**

Create `src/app/shared/components/schema-viewer/schema-viewer.component.ts`:

```typescript
import { Component, input, signal, computed } from '@angular/core';
import { ExerciseTable } from '../../../core/models/exercise.model';

@Component({
  selector: 'app-schema-viewer',
  standalone: true,
  templateUrl: './schema-viewer.component.html',
  styleUrl: './schema-viewer.component.css',
})
export class SchemaViewerComponent {
  tables = input<ExerciseTable[]>([]);
  activeTab = signal(0);

  sortedTables = computed(() =>
    [...this.tables()].sort((a, b) => a.displayOrder - b.displayOrder)
  );

  selectTab(index: number): void {
    this.activeTab.set(index);
  }
}
```

Create `src/app/shared/components/schema-viewer/schema-viewer.component.html`:

```html
@if (sortedTables().length > 0) {
  <ul class="nav nav-tabs mb-2">
    @for (table of sortedTables(); track table.id; let i = $index) {
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          [class.active]="activeTab() === i"
          (click)="selectTab(i)">
          <i class="bi bi-table me-1"></i>{{ table.tableName }}
        </button>
      </li>
    }
  </ul>

  @let active = sortedTables()[activeTab()];
  <div>
    <small class="text-muted fw-semibold text-uppercase d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em;">Estructura</small>
    <pre class="schema-code bg-body-secondary rounded p-2">{{ active.createStatement }}</pre>
    <small class="text-muted fw-semibold text-uppercase d-block mb-1 mt-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">Datos de ejemplo</small>
    <pre class="schema-code bg-body-secondary rounded p-2">{{ active.insertStatement }}</pre>
  </div>
}
```

Create `src/app/shared/components/schema-viewer/schema-viewer.component.css`:

```css
/* intentionally empty — Bootstrap utilities handle all styling */
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 4 SchemaViewerComponent tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/components/schema-viewer/
git commit -m "feat: add SchemaViewerComponent with Bootstrap nav-tabs"
```

---

## Task 7: SqlEditorComponent

**Files:**
- Create: `src/app/shared/components/sql-editor/sql-editor.component.ts`
- Create: `src/app/shared/components/sql-editor/sql-editor.component.html`
- Create: `src/app/shared/components/sql-editor/sql-editor.component.css`
- Create: `src/app/shared/components/sql-editor/sql-editor.component.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/shared/components/sql-editor/sql-editor.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SqlEditorComponent } from './sql-editor.component';

describe('SqlEditorComponent', () => {
  let fixture: ComponentFixture<SqlEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlEditorComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SqlEditorComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('mounts the CodeMirror editor in the DOM', () => {
    const cmEditor = fixture.nativeElement.querySelector('.cm-editor');
    expect(cmEditor).not.toBeNull();
  });

  it('emits queryChange when text is dispatched', () => {
    const emitted: string[] = [];
    fixture.componentInstance.queryChange.subscribe((q: string) => emitted.push(q));

    const view = (fixture.componentInstance as any).view;
    view.dispatch({ changes: { from: 0, insert: 'SELECT 1' } });

    expect(emitted).toContain('SELECT 1');
  });

  it('clear() removes all text from the editor', () => {
    const view = (fixture.componentInstance as any).view;
    view.dispatch({ changes: { from: 0, insert: 'SELECT * FROM t' } });
    fixture.componentInstance.clear();
    expect(view.state.doc.toString()).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `SqlEditorComponent` not found.

- [ ] **Step 3: Create SqlEditorComponent**

Create `src/app/shared/components/sql-editor/sql-editor.component.ts`:

```typescript
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-sql-editor',
  standalone: true,
  templateUrl: './sql-editor.component.html',
  styleUrl: './sql-editor.component.css',
})
export class SqlEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  readonly = input<boolean>(false);
  queryChange = output<string>();

  private themeService = inject(ThemeService);
  private view: EditorView | null = null;
  private initialized = false;

  constructor() {
    effect(() => {
      const theme = this.themeService.theme();
      if (this.initialized) {
        this.rebuildEditor(theme);
      }
    });
  }

  ngAfterViewInit(): void {
    this.buildEditor(this.themeService.theme());
    this.initialized = true;
  }

  private buildEditor(theme: 'light' | 'dark'): void {
    const extensions = [
      basicSetup,
      sql(),
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          this.queryChange.emit(update.state.doc.toString());
        }
      }),
      EditorView.editable.of(!this.readonly()),
    ];
    if (theme === 'dark') extensions.push(oneDark);

    this.view = new EditorView({
      state: EditorState.create({ doc: '', extensions }),
      parent: this.editorHost.nativeElement,
    });
  }

  private rebuildEditor(theme: 'light' | 'dark'): void {
    if (!this.view) return;
    const doc = this.view.state.doc.toString();
    this.view.destroy();
    this.editorHost.nativeElement.innerHTML = '';
    this.buildEditor(theme);
    if (doc) {
      this.view!.dispatch({ changes: { from: 0, insert: doc } });
    }
  }

  clear(): void {
    if (!this.view) return;
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length },
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }
}
```

Create `src/app/shared/components/sql-editor/sql-editor.component.html`:

```html
<div #editorHost class="cm-wrapper"></div>
```

Create `src/app/shared/components/sql-editor/sql-editor.component.css`:

```css
:host {
  display: block;
}

.cm-wrapper {
  min-height: 160px;
}

.cm-wrapper .cm-editor {
  min-height: 160px;
}

.cm-wrapper .cm-scroller {
  min-height: 160px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.875rem;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 3 SqlEditorComponent tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/components/sql-editor/
git commit -m "feat: add SqlEditorComponent wrapping CodeMirror 6 with SQL support"
```

---

## Task 8: HomeComponent

**Files:**
- Create: `src/app/pages/home/home.component.ts`
- Create: `src/app/pages/home/home.component.html`
- Create: `src/app/pages/home/home.component.css`
- Create: `src/app/pages/home/home.component.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/pages/home/home.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders three difficulty cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('[data-testid="difficulty-card"]');
    expect(cards.length).toBe(3);
  });

  it('navigates to /exercise with easy difficulty state when easy card is clicked', () => {
    const spy = vi.spyOn(router, 'navigate');
    fixture.nativeElement.querySelector('[data-key="easy"]').click();
    expect(spy).toHaveBeenCalledWith(['/exercise'], { state: { difficulty: 'easy' } });
  });

  it('navigates with medium difficulty when medium card is clicked', () => {
    const spy = vi.spyOn(router, 'navigate');
    fixture.nativeElement.querySelector('[data-key="medium"]').click();
    expect(spy).toHaveBeenCalledWith(['/exercise'], { state: { difficulty: 'medium' } });
  });

  it('navigates with hard difficulty when hard card is clicked', () => {
    const spy = vi.spyOn(router, 'navigate');
    fixture.nativeElement.querySelector('[data-key="hard"]').click();
    expect(spy).toHaveBeenCalledWith(['/exercise'], { state: { difficulty: 'hard' } });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `HomeComponent` not found.

- [ ] **Step 3: Create HomeComponent**

Create `src/app/pages/home/home.component.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

interface DifficultyOption {
  key: 'easy' | 'medium' | 'hard';
  label: string;
  description: string;
  colorClass: string;
  borderClass: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private router = inject(Router);
  themeService = inject(ThemeService);

  difficulties: DifficultyOption[] = [
    {
      key: 'easy',
      label: 'Fácil',
      description: 'SELECT básico, filtros simples con WHERE.',
      colorClass: 'text-success',
      borderClass: 'border-success',
      icon: 'bi-star',
    },
    {
      key: 'medium',
      label: 'Medio',
      description: 'JOINs, GROUP BY, funciones de agregación.',
      colorClass: 'text-warning',
      borderClass: 'border-warning',
      icon: 'bi-star-half',
    },
    {
      key: 'hard',
      label: 'Difícil',
      description: 'Subconsultas, CTEs, lógica compleja.',
      colorClass: 'text-danger',
      borderClass: 'border-danger',
      icon: 'bi-star-fill',
    },
  ];

  start(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.router.navigate(['/exercise'], { state: { difficulty } });
  }
}
```

Create `src/app/pages/home/home.component.html`:

```html
<div class="min-vh-100 d-flex flex-column">
  <nav class="navbar border-bottom px-4">
    <span class="navbar-brand fw-bold fs-5">
      <i class="bi bi-database-fill-gear me-2 text-primary"></i>SQL OVA
    </span>
    <div class="ms-auto">
      <button class="btn btn-outline-secondary btn-sm" (click)="themeService.toggle()">
        <i
          class="bi"
          [class.bi-sun-fill]="themeService.theme() === 'dark'"
          [class.bi-moon-fill]="themeService.theme() === 'light'"></i>
      </button>
    </div>
  </nav>

  <main class="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-3 py-5">
    <div class="text-center mb-5">
      <h1 class="fw-bold mb-2">Practica SQL</h1>
      <p class="text-muted fs-5 mb-0">Selecciona una dificultad para comenzar</p>
    </div>

    <div class="row g-4 w-100" style="max-width: 860px;">
      @for (d of difficulties; track d.key) {
        <div class="col-12 col-md-4">
          <div
            class="card h-100 border-start border-4 shadow-sm"
            [class]="d.borderClass"
            data-testid="difficulty-card"
            [attr.data-key]="d.key"
            style="cursor: pointer; transition: box-shadow 0.2s;"
            (click)="start(d.key)"
            (keydown.enter)="start(d.key)"
            (mouseenter)="$event.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'"
            (mouseleave)="$event.currentTarget.style.boxShadow=''"
            tabindex="0"
            role="button">
            <div class="card-body d-flex flex-column gap-2 p-4">
              <i class="bi fs-2" [class]="d.icon + ' ' + d.colorClass"></i>
              <h5 class="card-title fw-bold mb-0" [class]="d.colorClass">{{ d.label }}</h5>
              <p class="card-text text-muted small mb-0">{{ d.description }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  </main>
</div>
```

Create `src/app/pages/home/home.component.css`:

```css
/* intentionally empty */
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 4 HomeComponent tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/home/
git commit -m "feat: add HomeComponent with difficulty card selector"
```

---

## Task 9: ExerciseComponent

**Files:**
- Create: `src/app/pages/exercise/exercise.component.ts`
- Create: `src/app/pages/exercise/exercise.component.html`
- Create: `src/app/pages/exercise/exercise.component.css`
- Create: `src/app/pages/exercise/exercise.component.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/app/pages/exercise/exercise.component.spec.ts`:

```typescript
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

const mockWrongResult: EvaluationResult = {
  correct: false,
  feedback: 'Tu query se ejecutó pero los resultados no coinciden.',
  userResult: { columns: ['id'], rows: [[1]] },
  expectedResult: { columns: ['name'], rows: [['Alice']] },
  executionError: null,
};

function setup(difficulty = 'medium') {
  return TestBed.configureTestingModule({
    imports: [ExerciseComponent],
    providers: [
      provideRouter([]),
      {
        provide: ExerciseService,
        useValue: {
          getRandom: vi.fn().mockReturnValue(of(mockExercise)),
          evaluate: vi.fn().mockReturnValue(of(mockCorrectResult)),
        },
      },
      {
        provide: Location,
        useValue: { getState: vi.fn().mockReturnValue({ difficulty }) },
      },
    ],
  }).compileComponents();
}

describe('ExerciseComponent', () => {
  let fixture: ComponentFixture<ExerciseComponent>;
  let exerciseService: ExerciseService;

  beforeEach(async () => {
    await setup();
    fixture = TestBed.createComponent(ExerciseComponent);
    exerciseService = TestBed.inject(ExerciseService);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('calls getRandom with the difficulty from router state', () => {
    expect(exerciseService.getRandom).toHaveBeenCalledWith('medium');
  });

  it('displays the exercise title and description', () => {
    expect(fixture.nativeElement.textContent).toContain('JOIN entre empleados y departamentos');
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

  it('redirects to / when no difficulty in router state', async () => {
    TestBed.resetTestingModule();
    await setup(undefined as any);
    TestBed.overrideProvider(Location, {
      useValue: { getState: vi.fn().mockReturnValue({}) },
    });
    const f = TestBed.createComponent(ExerciseComponent);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    f.detectChanges();
    await f.whenStable();
    expect(spy).toHaveBeenCalledWith(['/']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `ExerciseComponent` not found.

- [ ] **Step 3: Create ExerciseComponent**

Create `src/app/pages/exercise/exercise.component.ts`:

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
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
```

Create `src/app/pages/exercise/exercise.component.html`:

```html
<div class="d-flex flex-column vh-100">

  <!-- Header -->
  <nav class="navbar border-bottom px-4 flex-shrink-0">
    <a class="navbar-brand fw-bold fs-6" routerLink="/">
      <i class="bi bi-database-fill-gear me-2 text-primary"></i>SQL OVA
    </a>
    <div class="ms-3">
      <span class="badge" [class]="difficultyBadgeClass">{{ difficultyLabel }}</span>
    </div>
    <div class="ms-auto d-flex align-items-center gap-2">
      <a class="btn btn-outline-secondary btn-sm" routerLink="/">
        <i class="bi bi-arrow-left me-1"></i>Inicio
      </a>
      <button class="btn btn-outline-secondary btn-sm" (click)="themeService.toggle()">
        <i
          class="bi"
          [class.bi-sun-fill]="themeService.theme() === 'dark'"
          [class.bi-moon-fill]="themeService.theme() === 'light'"></i>
      </button>
    </div>
  </nav>

  <!-- Loading state (initial) -->
  @if (loading() && !exercise()) {
    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando ejercicio...</span>
      </div>
    </div>
  }

  <!-- Split layout -->
  @if (exercise()) {
    <div class="d-flex flex-grow-1 overflow-hidden flex-column flex-md-row">

      <!-- Left panel: description + schema -->
      <aside class="panel-left border-end p-3 flex-shrink-0 overflow-y-auto" style="width: 100%; max-width: 100%;">
        <h5 class="fw-bold mb-2">{{ exercise()!.title }}</h5>
        <p class="text-muted mb-3">{{ exercise()!.description }}</p>

        @if (exercise()!.hint) {
          <div class="mb-3">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="toggleHint()">
              <i class="bi bi-lightbulb me-1"></i>
              {{ hintVisible() ? 'Ocultar pista' : 'Ver pista' }}
            </button>
            @if (hintVisible()) {
              <div class="alert alert-info mt-2 mb-0 py-2 small">{{ exercise()!.hint }}</div>
            }
          </div>
        }

        <hr class="my-3">
        <p class="text-muted fw-semibold text-uppercase mb-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">
          <i class="bi bi-table me-1"></i>Tablas disponibles
        </p>
        <app-schema-viewer [tables]="exercise()!.tables" />
      </aside>

      <!-- Right panel: editor + results -->
      <main class="panel-right flex-grow-1 p-3 d-flex flex-column gap-3 overflow-y-auto">

        <div class="flex-shrink-0">
          <p class="text-muted fw-semibold text-uppercase mb-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">
            <i class="bi bi-code-square me-1"></i>Tu query SQL
          </p>
          <div class="cm-wrapper border rounded">
            <app-sql-editor [readonly]="loading()" (queryChange)="onQueryChange($event)" />
          </div>
          <div class="mt-2">
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="loading() || !userQuery().trim()"
              (click)="submit()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              } @else {
                <i class="bi bi-play-fill me-1"></i>
              }
              Ejecutar query
            </button>
          </div>
        </div>

        @if (evaluationResult()) {
          <div class="flex-shrink-0">

            <!-- Feedback banner -->
            <div
              class="alert d-flex align-items-start gap-2 mb-3"
              [class.alert-success]="evaluationResult()!.correct"
              [class.alert-danger]="!evaluationResult()!.correct">
              <i
                class="bi fs-5 flex-shrink-0"
                [class.bi-check-circle-fill]="evaluationResult()!.correct"
                [class.bi-x-circle-fill]="!evaluationResult()!.correct"></i>
              <span>{{ evaluationResult()!.feedback }}</span>
            </div>

            <!-- SQL execution error -->
            @if (evaluationResult()!.executionError) {
              <div class="mb-3">
                <small class="text-muted fw-semibold text-uppercase d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em;">
                  Error SQL
                </small>
                <pre class="schema-code bg-danger bg-opacity-10 border border-danger rounded p-2 text-danger">{{ evaluationResult()!.executionError }}</pre>
              </div>
            }

            <!-- User result table -->
            @if (evaluationResult()!.userResult) {
              <div class="mb-3">
                <small class="text-muted fw-semibold text-uppercase d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em;">
                  Tu resultado
                </small>
                <app-result-table [data]="evaluationResult()!.userResult" />
              </div>
            }

            <!-- Expected result table (only when wrong and no syntax error) -->
            @if (!evaluationResult()!.correct && !evaluationResult()!.executionError && evaluationResult()!.expectedResult) {
              <div class="mb-3">
                <small class="text-muted fw-semibold text-uppercase d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em;">
                  Resultado esperado
                </small>
                <app-result-table [data]="evaluationResult()!.expectedResult" />
              </div>
            }

            <button type="button" class="btn btn-outline-primary btn-sm" (click)="nextExercise()">
              <i class="bi bi-arrow-right-circle me-1"></i>Siguiente ejercicio
            </button>
          </div>
        }
      </main>

    </div>
  }

</div>
```

Create `src/app/pages/exercise/exercise.component.css`:

```css
.panel-left {
  overflow-y: auto;
}

@media (min-width: 768px) {
  .panel-left {
    width: 40% !important;
    max-width: 40% !important;
  }
}

.panel-right {
  overflow-y: auto;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all 5 ExerciseComponent tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/exercise/
git commit -m "feat: add ExerciseComponent with split layout"
```

---

## Task 10: Wire up routes, app config and cleanup

**Files:**
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.config.ts`
- Modify: `src/app/app.ts`
- Modify: `src/app/app.html`

- [ ] **Step 1: Update app.routes.ts with lazy-loaded routes**

Replace the entire content of `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'exercise',
    loadComponent: () =>
      import('./pages/exercise/exercise.component').then(m => m.ExerciseComponent),
  },
  { path: '**', redirectTo: '' },
];
```

- [ ] **Step 2: Add provideHttpClient to app.config.ts**

Replace the entire content of `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

- [ ] **Step 3: Strip the boilerplate from app.ts**

Replace the entire content of `src/app/app.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
```

- [ ] **Step 4: Simplify app.html**

Replace the entire content of `src/app/app.html`:

```html
<router-outlet />
```

- [ ] **Step 5: Delete app.css (now unused)**

```bash
rm src/app/app.css
```

Remove the `styleUrl: './app.css'` line from `src/app/app.ts` if it exists (it shouldn't after Step 3 above, since the template is inline).

- [ ] **Step 6: Run the full test suite**

```bash
npm test
```

Expected: all tests across all spec files PASS with no failures.

- [ ] **Step 7: Start the dev server and verify visually**

```bash
npm start
```

Open `http://localhost:4200` in a browser. Verify:
- [ ] Home page shows three cards (Fácil / Medio / Difícil)
- [ ] Dark/light toggle works and persists across navigation
- [ ] Clicking a card navigates to `/exercise`
- [ ] Exercise loads and shows title, description, table schemas
- [ ] "Ver pista" toggle shows/hides the hint
- [ ] CodeMirror editor accepts SQL input
- [ ] "Ejecutar query" sends the request (check Network tab — if backend is not running, a network error is expected)
- [ ] Back button / "Inicio" link returns to home

- [ ] **Step 8: Final commit**

```bash
git add src/app/app.routes.ts src/app/app.config.ts src/app/app.ts src/app/app.html
git commit -m "feat: wire up routes, provideHttpClient, and clean up app shell"
```

---

## Verification Checklist

Before declaring done, confirm:

- [ ] `npm test` — all tests pass
- [ ] `npm run build` — build succeeds with no errors
- [ ] Home page renders three colored difficulty cards
- [ ] Dark/light mode toggle works in both Home and Exercise views
- [ ] Exercise split layout visible on desktop (≥ 768px)
- [ ] Schema viewer tabs switch between tables
- [ ] CodeMirror editor renders and accepts SQL
- [ ] Submit button disables while loading
- [ ] Correct answer shows green `alert-success` banner + user result table
- [ ] Wrong answer shows red `alert-danger` banner + both result tables
- [ ] SQL error shows the error text in a red pre block
- [ ] "Siguiente ejercicio" loads a new exercise and clears the editor
- [ ] Navigating directly to `/exercise` without a difficulty redirects to `/`
