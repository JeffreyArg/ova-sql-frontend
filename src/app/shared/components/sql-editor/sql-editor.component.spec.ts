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
