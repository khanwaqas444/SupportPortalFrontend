import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentUserComponent } from './component-user.component';

describe('ComponentUserComponent', () => {
  let component: ComponentUserComponent;
  let fixture: ComponentFixture<ComponentUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
