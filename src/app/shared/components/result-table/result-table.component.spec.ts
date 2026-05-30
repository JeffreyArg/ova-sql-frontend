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
