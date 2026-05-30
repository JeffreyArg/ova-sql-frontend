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
