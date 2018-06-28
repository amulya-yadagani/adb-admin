import { async, ComponentFixture, TestBed, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule, XHRBackend } from '@angular/http';

import { RolesComponent } from './roles.component';
import { AppStateService } from '../../state/app-state.service';
import { AccountDetailsService } from '../account-details.service';
import { USER_ROLES, USER_ROLES_RESULT, USER_GRID, USER_RESULT_DATA_CLEAR } from '../../state/actions';

describe('Account Details Component - Roles Tab Component', () => {
  let fixture;
  let comp;
  let de;
  let elm;
  let appStateService;
  let accDetailService;
  describe('Initial Roles Component Test', () => {
    beforeEach(async(() => { // async allows you to get component with binded template & css...
      TestBed.configureTestingModule({
        declarations: [RolesComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },  // auto compiles the component...
          AppStateService,
          AccountDetailsService
        ],
        imports: [HttpModule],
        schemas: [NO_ERRORS_SCHEMA]  // ensures custome element is skipped from throwing error...
      })
      .compileComponents(); // compile template and css
    }));
    beforeEach(async(() => {
      fixture = TestBed.createComponent(RolesComponent);
      appStateService = TestBed.get(AppStateService);
      accDetailService = TestBed.get(AccountDetailsService);
      comp = fixture.componentInstance;
    }));
    it('On ngOninit should call funtion of gridInitLoader()', () => {
      const spyGridInitLoader = spyOn(comp, 'gridInitLoader');

      comp.ngOnInit();

      expect(spyGridInitLoader).toHaveBeenCalled();
      expect(spyGridInitLoader).toHaveBeenCalledTimes(1);
    });
  });
  describe('Post Roles Component Test', () => {
    beforeEach(async(() => { // async allows you to get component with binded template & css...
      TestBed.configureTestingModule({
        declarations: [RolesComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },  // auto compiles the component...
          AppStateService,
          AccountDetailsService
        ],
        imports: [HttpModule],
        schemas: [NO_ERRORS_SCHEMA]  // ensures custome element is skipped from throwing error...
      })
      .compileComponents(); // compile template and css
    }));
    beforeEach(async(() => {
      fixture = TestBed.createComponent(RolesComponent);
      appStateService = TestBed.get(AppStateService);
      accDetailService = TestBed.get(AccountDetailsService);
      comp = fixture.componentInstance;
    }));
    it('Check functionality of gridDataLoader, when gridInfo filled with data', () => {
      expect(comp.gridDataSource).toBeUndefined();
      const mockGridInfo = {
          roles : [
            {
              application: 'SSRS',
              description: 'Marketing',
              roleId: 277,
              roleName: 'Marketing',
              source: 'Inherited',
              sourceAccount: 'GLOBAL-NYCIT-TCM-ALL'
            }
          ]
        };

        comp.gridDataLoader(mockGridInfo);
        expect(comp.gridDataSource).toBeDefined();
        expect(comp.gridDataSource.length).toBeGreaterThan(0);
      });
      it('Check functionality of gridDataLoader, when gridInfo with null', () => {
        expect(comp.gridDataSource).toBeUndefined();
        const mockGridInfo = null;
        comp.gridDataLoader(mockGridInfo);

        expect(comp.gridDataSource).toBeDefined();
        expect(comp.gridDataSource.length).toBe(0);
      });
  });
});
