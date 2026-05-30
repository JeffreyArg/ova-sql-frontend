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
