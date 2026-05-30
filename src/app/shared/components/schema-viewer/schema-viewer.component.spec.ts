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
