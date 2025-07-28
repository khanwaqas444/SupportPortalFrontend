import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentLoginComponent } from './component-login.component';

describe('ComponentLoginComponent', () => {
  let component: ComponentLoginComponent;
  let fixture: ComponentFixture<ComponentLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
