import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { SharedGridComponent } from './shared-grid.component';
import { AccountDetailsService } from '../account-details.service';
import { AppStateService } from '../../state/app-state.service';

xdescribe('Shared Grid Component', () => {
  describe('Initial Grid Test', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [SharedGridComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },  // auto compiles the component...
          AccountDetailsService,
          AppStateService
        ]
      })
      .compileComponents();
    });
  });
  describe('Post Grid Test', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [SharedGridComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },  // auto compiles the component...
          AccountDetailsService,
          AppStateService
        ]
      })
      .compileComponents();
    });
  });
});
