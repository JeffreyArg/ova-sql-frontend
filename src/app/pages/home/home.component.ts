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

  onCardHover(event: MouseEvent, elevation: boolean): void {
    const element = event.currentTarget as HTMLElement;
    if (elevation) {
      element.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
    } else {
      element.style.boxShadow = '';
    }
  }
}
