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

  private buildEditor(theme: 'light' | 'dark', initialDoc = ''): void {
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
      state: EditorState.create({ doc: initialDoc, extensions }),
      parent: this.editorHost.nativeElement,
    });
  }

  private rebuildEditor(theme: 'light' | 'dark'): void {
    if (!this.view) return;
    const doc = this.view.state.doc.toString();
    this.view.destroy();
    this.editorHost.nativeElement.innerHTML = '';
    this.buildEditor(theme, doc);
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
