import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessedFilesComponent } from './processed-files.component';

describe('ProcessedFilesComponent', () => {
  let component: ProcessedFilesComponent;
  let fixture: ComponentFixture<ProcessedFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessedFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
