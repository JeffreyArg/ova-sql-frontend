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
