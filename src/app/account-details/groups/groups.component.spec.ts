import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';

import { GroupsComponent } from './groups.component';
import { AccountDetailsService } from "../account-details.service";
import { AppStateService } from '../../state/app-state.service';

xdescribe("Group Component: Testing", () => {
  describe("Isolation Testing", () => {
    let groupsComponent: GroupsComponent;
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [GroupsComponent],
        schemas: [ NO_ERRORS_SCHEMA ]
      })
      .overrideComponent(GroupsComponent, {
        set: {
          providers : [
            {provide: AccountDetailsService, useClass: MockAccountdetailsService},
            {provide: AppStateService, useClass: MockAppStateService}
          ]
        }
      });
      groupsComponent = TestBed.createComponent(GroupsComponent).componentInstance;
    });
    it('', () => {
      groupsComponent;
    });
  });
  class MockAppStateService{

  }
  class MockAccountdetailsService {

  }
  describe('Integration Testing', () => {
    let component: GroupsComponent;
    let fixture: ComponentFixture<GroupsComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ GroupsComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(GroupsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});