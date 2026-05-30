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
