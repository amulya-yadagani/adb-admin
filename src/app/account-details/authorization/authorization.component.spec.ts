import { async, TestBed, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AuthorizationComponent } from './authorization.component';

import { AccountDetailsService } from '../account-details.service';
import { AppStateService } from '../../state/app-state.service';
import { AccountDetailsComponent } from 'app/account-details/account-details.component';

describe('Testing Authorization Component', () => {
  let fixture;
  let comp;
  let de;
  let elm;
  describe('Initial State of the Authorization Component', () => {
    beforeEach(async(() => { // async allows you to get component with binded template & css...
      TestBed.configureTestingModule({
        declarations: [AuthorizationComponent], // declaration of the component...
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true }, // auto compiles the component...
          AccountDetailsService,
          AppStateService
        ],
        imports: [HttpModule]
      })
      .compileComponents();  // compile template and css
      fixture = TestBed.createComponent(AuthorizationComponent);
      comp = fixture.componentInstance;
    }));
    it('Authorization Component to be present', () => {
      expect(comp).toBeTruthy;
    });
    it('Authorization Component : onResponseClearInfo functionality -> clear array data', () => {
      const mockArray = [{key: '1'}];

      // comp.treeView.dataSource.data(mockArray);
      // comp.onResponseClearInfo();

      // expect(comp.treeView.dataSource._data.length).toEqual(0);
    });
    it('Authorization Component : onResponseAuthorizations functionality check', () => {
      const appStateService = TestBed.get(AppStateService);
      const spyAppStateService = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        user: {accountName: 'GLOBAL-NYCIT-CMAS-ALL'}
      });
      const mockApplicationResource  = {
        payload : {
          data: {
            application: [
              {'resourceMappingId':0, 'applicationId':1,'name':'JobTracker','resourceID':0,'parentResourceMappingid':null,'resourceTypeName':null,'imageFile':null,'description':'JobTracker','state':'Original','isExcluded':false},
              {'resourceMappingId':0,'applicationId':4,'name':'SSRS','resourceID':0,'parentResourceMappingid':null,'resourceTypeName':null,'imageFile':null,'description':'SSRS','state':'Original','isExcluded':false}
            ]
          }
        }
      };

      comp.onResponseAuthorizations(mockApplicationResource);

      expect(comp.treeView.dataSource._data.length).toBeGreaterThan(0);
      expect(comp.treeView.dataSource._data.length).toBeCloseTo(2);
    });
    it('Authorization Component : onResponseAuthorizationsChild functionality check', () => {
      const appStateService = TestBed.get(AppStateService);
      const spyAppStateService = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        user: {accountName: 'GLOBAL-NYCIT-CMAS-ALL'}
      });
      const mockApplicationResource  = {
        payload : {
          data: {
            application: [
              {'resourceMappingId':0, 'applicationId':1,'name':'JobTracker','resourceID':0,'parentResourceMappingid':null,'resourceTypeName':null,'imageFile':null,'description':'JobTracker','state':'Original','isExcluded':false},
              {'resourceMappingId':0,'applicationId':4,'name':'SSRS','resourceID':0,'parentResourceMappingid':null,'resourceTypeName':null,'imageFile':null,'description':'SSRS','state':'Original','isExcluded':false}
            ]
          }
        }
      };
      const mockChildResource = {
        payload: {
          data : [
            {'resourceMappingId':108,'applicationId':1,'name':'ALL TITLES','resourceID':24,'parentResourceMappingid':1,'resourceTypeName':'Cluster','imageFile':'cluster.png','description':'ALL TITLES - ALL TITLES','state':null,'isExcluded':false}
          ]
        }
      };

      comp.onResponseAuthorizations(mockApplicationResource);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        comp.onResponseAuthorizationsChild(mockChildResource);
        const childEleExistance = comp.treeView.dataSource._data[0].children._data;

        expect(childEleExistance).toBeDefined();
        expect(childEleExistance.length).toBeGreaterThan(0);
      });
    });
    it('Authorization Component : onExpandResource functionality, when expand is enabled', () => {
      const appStateService = TestBed.get(AppStateService);
      const accDetailsService = TestBed.get(AccountDetailsService);
      const mockEventData = {
        node: {
          'spriteCssClass': 'application nonExcludedAccount',
          'account': 'SSRS',
          'text': 'SSRS',
          'resourceId': 0,
          'resourceTypeName': null,
          'applicationId': 4,
          'imageFile': null,
          'state': 'Original',
          'description': 'SSRS',
          'expandable': true,
          'items': [],
          'index': 0,
          'expanded': true
        }
      };
      const spyTreeView = spyOn((comp.treeView), 'dataItem').and.returnValue((function(){
        return mockEventData.node;
      })());
      const spyAppStateService = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        user : {
          accountName : 'akaplan1271'
        }
      });
      const spyFetchAuthorizationChildren = spyOn(accDetailsService, 'fetchAuthorizationChildren');

      comp.onExpandResource(mockEventData);

      expect(spyTreeView).toHaveBeenCalled();
      expect(spyTreeView).toHaveBeenCalledTimes(1);

      expect(spyAppStateService).toHaveBeenCalled();
      expect(spyAppStateService).toHaveBeenCalledTimes(1);

      expect(spyFetchAuthorizationChildren).toHaveBeenCalled();
      expect(spyFetchAuthorizationChildren).toHaveBeenCalledTimes(1);
    });
    it('Authorization Component : onExpandResource functionality, when expand is false', () => {
      const appStateService = TestBed.get(AppStateService);
      const accDetailsService = TestBed.get(AccountDetailsService);
      const mockEventData = {
        node: {
          'spriteCssClass': 'application nonExcludedAccount',
          'account': 'SSRS',
          'text': 'SSRS',
          'resourceId': 0,
          'resourceTypeName': null,
          'applicationId': 4,
          'imageFile': null,
          'state': 'Original',
          'description': 'SSRS',
          'expandable': false,
          'items': [],
          'index': 0,
          'expanded': true
        }
      };
      const spyTreeView = spyOn((comp.treeView), 'dataItem').and.returnValue((function(){
        return mockEventData.node;
      })());
      const spyAppStateService = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        user : {
          accountName : 'akaplan1271'
        }
      });
      const spyFetchAuthorizationChildren = spyOn(accDetailsService, 'fetchAuthorizationChildren');

      comp.onExpandResource(mockEventData);

      expect(spyTreeView).toHaveBeenCalled();
      expect(spyTreeView).toHaveBeenCalledTimes(1);

      expect(spyAppStateService).toHaveBeenCalled();
      expect(spyAppStateService).toHaveBeenCalledTimes(1);
    });
    it('', () => {
      //comp.onResponseClearInfo();
    });
  });
  describe('Post Initial State of the Authorization Component', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [AuthorizationComponent], // declaration of the component...
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },
          AccountDetailsService,
          AppStateService
        ],
        imports: [HttpModule]
      })
      .compileComponents();  // compile template and css
    }));
  });
});
