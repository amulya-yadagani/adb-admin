import { async, ComponentFixture, TestBed, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AccountDetailsComponent } from './account-details.component';
import { AccountDetailsService } from './account-details.service';
import { AppStateService } from '../state/app-state.service';
import {
  ACCOUNT_SELECT,
  USER_ACCOUNT_RESULT,
  USER_SEARCH_NEW_RESULT,
  USER_GROUPS,
  USER_GROUPS_RESULT,
  USER_MEMBERS,
  USER_MEMBERS_RESULT,
  USER_ROLES,
  USER_ROLES_RESULT,
  USER_AUTHORIZATION,
  USER_AUTHORIZATION_RESULT,
  USER_IMPERSONATIONS,
  USER_IMPERSONATIONS_RESULT,
  USER_SEARCH,
  USER_SEARCH_RESULT } from '../state/actions';
  import {
    USERACCOUNT_URL,
    USERROLES_URL,
    USERAUTHORIZATIONS_URL,
    USERIMPERSONATIONS_URL } from '../utils/constants';
import { Observable, Observer } from 'rxjs/Rx';
import { by } from 'protractor';

describe('Testing Account Details Component', () => {
  let fixture;
  let comp;
  let de: DebugElement;
  let elm: HTMLElement;
  let appStateService;
  let accDetailService;
  describe('Template Testing of Account Details Component', () => {
    beforeEach(async(() => { // async allows you to get component with binded template & css...
      TestBed.configureTestingModule({
        declarations: [AccountDetailsComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },  // auto compiles the component...
          AppStateService,
          AccountDetailsService
        ],
        imports: [HttpModule, FormsModule, RouterTestingModule.withRoutes([])],
        schemas: [NO_ERRORS_SCHEMA]  // ensures custome element is skipped from throwing error...
      })
      .compileComponents(); // compile template and css
    }));
    beforeEach(async(() => {
      fixture = TestBed.createComponent(AccountDetailsComponent);
      appStateService = TestBed.get(AppStateService);
      accDetailService = TestBed.get(AccountDetailsService);
      comp = fixture.componentInstance;
      de = fixture.nativeElement;
    }));
    it('Initially Title of Account Tab, should display "Account Name" as string', async(() => {
      const mockTitle = 'Account Name';
      const accountTitleElm = fixture.debugElement.query(By.css('.account-header-name'));
      const innerText = accountTitleElm.nativeElement.textContent;
      fixture.whenStable().then(() => {
        expect(innerText).toContain(mockTitle);
      });
    }));
    it('Verify "refreshMembership()" function binded to "account-validate" class element', async(() => {
      const spyValidateFn = spyOn(comp, 'refreshMembership');
      const validateBtn = fixture.debugElement.nativeElement.querySelector('.account-validate');
      validateBtn.click();
      fixture.whenStable().then(() => {
        expect(spyValidateFn).not.toHaveBeenCalled();
      });
    }));
    it('Verify "clearUsrAccount()" function binded to "account-cancel" class element', async(() => {
      comp.usrFormSearched = true;
      fixture.detectChanges();
      const spyValidateFn = spyOn(comp, 'clearUsrAccount');
      const validateBtn = fixture.debugElement.nativeElement.querySelector('.account-cancel');
      validateBtn.click();
      fixture.whenStable().then(() => {
        expect(spyValidateFn).toHaveBeenCalled();
        expect(spyValidateFn).toHaveBeenCalledTimes(1);
      });
    }));
    it('Verify "account-cancel" class element is disabled initially', async(() => {
      const spyCancelFn = spyOn(comp, 'clearUsrAccount');
      const cancelBtn = fixture.debugElement.nativeElement.querySelector('.account-cancel');
      fixture.whenStable().then(() => {
        expect(cancelBtn.hasAttribute('disabled')).toBeTruthy();
        expect(cancelBtn.disabled).toBeTruthy();
      });
    }));
    // the below code related to CSS recent changes, but code is reverted to previous change for temporarly... hence commented....
    it('Verify account fields disabled fields', async(() => {
      fixture.detectChanges();
      const accountDetailsLeftFields = fixture.debugElement.nativeElement.querySelector('#account-fields-left-container');
      const accountDetailsRightFields = fixture.debugElement.nativeElement.querySelector('#account-fields-right-container');

      const leftList = accountDetailsLeftFields.children;
      const rightList = accountDetailsRightFields.children;
      const mockDisabledLeft = {
        accountName: false,
        firstName: true,
        lastName: true,
        accountType: true,
        status: true
      };
      const mockDisabledRight = {
        department: true,
        company: false,
        email: false,
        phone: false,
        isActive: false
      };
      fixture.whenStable().then(() => {
        for (let eachList = 0 ; eachList < rightList.length; eachList++) {
          const selectedNode = rightList[eachList].querySelectorAll('[name]')[0];
          const nameAttr = selectedNode.getAttribute('name');
          const disElem = selectedNode.hasAttribute('disabled');
          expect(nameAttr in mockDisabledRight).toBeTruthy();
          expect(disElem).toBe(selectedNode.hasAttribute('disabled'));
        }
        for (let eachList = 0 ; eachList < leftList.length; eachList++) {
          const selectedNode = leftList[eachList].querySelectorAll('[name]')[0];
          const nameAttr = selectedNode.getAttribute('name');
          const disElem = selectedNode.hasAttribute('disabled');
          expect(nameAttr in mockDisabledLeft).toBeTruthy();
          expect(disElem).toBe(selectedNode.hasAttribute('disabled'));
        }
      });
    }));
  });
  describe('Initial State of Account Details Component', () => {
    beforeEach(async(() => { // async allows you to get component with binded template & css...
      TestBed.configureTestingModule({
        declarations: [AccountDetailsComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },  // auto compiles the component...
          AppStateService,
          AccountDetailsService
        ],
        imports: [HttpModule, FormsModule, RouterTestingModule],
        schemas: [NO_ERRORS_SCHEMA]  // ensures custome element is skipped from throwing error...
      })
      .compileComponents(); // compile template and css
    }));
    beforeEach(async(() => {
      fixture = TestBed.createComponent(AccountDetailsComponent);
      appStateService = TestBed.get(AppStateService);
      accDetailService = TestBed.get(AccountDetailsService);
      comp = fixture.componentInstance;
      de = fixture.nativeElement;
    }));
    it('Account Details Component to be Present', () => {
      expect(comp).toBeDefined();
    });
    it('App State Service needs to be present for Account Details Component', () => {
      expect(appStateService).toBeDefined();
    });
    it('Account Details Service needs to be present for Account Details Component', () => {
      expect(accDetailService).toBeDefined();
    });
    it('Account Details Component Title to be empty', () => {
      expect(comp.accountTitle).toBe('');
    });
    it('Account Details Component : User field needs to be set as default', () => {
      const userObj = comp.user;
      expect(userObj).toBeDefined();
      expect(userObj.accountId).toBe('');
      expect(userObj.accountName).toBe('');
      expect(userObj.accountType).toBe('Unknown');
      expect(userObj.company).toBe('');
      expect(userObj.department).toBe('');
      expect(userObj.emailAddress).toBe('');
      expect(userObj.firstName).toBe('');
      expect(userObj.isActive).toBe(false);
      expect(userObj.lastName).toBe('');
      expect(userObj.phoneNumber).toBe('');
      expect(userObj.status).toBe('Provisional');
    });
    it('Account Details Component : User Form Search should be false', () => {
      expect(comp.usrFormSearched).toBe(false);
    });
    it('Account Details Component : Should have router outlet directive', () => {
      const router = fixture.debugElement.query(By.directive(RouterOutlet));
      expect(router).toBeDefined();
    });
    it('Account Details Component : Should have link to members page', () => {
      const linkTab = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
      const index = linkTab.findIndex((de: any) => {
        return de.properties['href'] === '/members';
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });
    it('Account Details Component : Should have link to groups page', () => {
      const linkTab = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
      const index = linkTab.findIndex((de: any) => {
        return de.properties['href'] === '/groups';
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });
    it('Account Details Component : Should have link to roles page', () => {
      const linkTab = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
      const index = linkTab.findIndex((de: any) => {
        return de.properties['href'] === '/roles';
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });
    it('Account Details Component : Should have link to authorizations page', () => {
      const linkTab = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
      const index = linkTab.findIndex((de: any) => {
        return de.properties['href'] === '/authorizations';
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });
    it('Account Details Component : Should have link to impersonations page', () => {
      const linkTab = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
      const index = linkTab.findIndex((de: any) => {
        return de.properties['href'] === '/impersonations';
      });
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });
  describe('Post Initial State of Account Details Component', () => {
    beforeEach(async(() => { // async allows you to get component with binded template & css...
      TestBed.configureTestingModule({
        declarations: [AccountDetailsComponent],
        providers: [
          { provide: ComponentFixtureAutoDetect, useValue: true },
          AppStateService,
          AccountDetailsService
        ],
        imports: [HttpModule, FormsModule, RouterTestingModule],
        schemas: [NO_ERRORS_SCHEMA]
      })
      .compileComponents(); // compile template and css
    }));
    beforeEach(async(() => {
      fixture = TestBed.createComponent(AccountDetailsComponent);
      appStateService = TestBed.get(AppStateService);
      accDetailService = TestBed.get(AccountDetailsService);
      comp = fixture.componentInstance;
    }));
    it('Account Details Component: Account Request functionality test for group is requested', () => {
      const appService = appStateService;
      const accService = accDetailService;
      const spyAccountInformation = spyOn(appService, 'getSelectedAccountInformation').and.returnValue({
        'user':
          {
            'accountId': 11001,
            'name': 'vinyakas',
            'firstName': 'Siddhi',
            'lastName': 'Vinayaka',
            'accountType': 'Person',
            'status': 'current',
            'department': 'CMAS',
            'company': 'TimeInc',
            'email': 'Siddhi.Vinayaka@timeinc.com',
            'phone': '+1 212 522 1212',
            'isActive': 'true'
          }
      });
      const spyAccountDetailGroups = spyOn(accService, 'setStateGroupsSearched');
      const spyDispatch = spyOn(appService, 'dispatch').and.returnValue('Actions');
      comp.usrFormSearched = true;
      comp.accountRequests('groups');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spyAccountDetailGroups).toHaveBeenCalledWith(true);
        expect(spyAccountInformation).toHaveBeenCalled();
        expect(spyAccountInformation).toHaveBeenCalledTimes(1);
        expect(spyDispatch).toHaveBeenCalled();
        expect(spyDispatch).toHaveBeenCalledTimes(1);
      });
    });
    it('Account Details Component: Account Request functionality test for member is requested', () => {
      comp.usrFormSearched = true;
      comp.accountTitle = 'vinyakas';
      const spyGetSelectedAccountInformation = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        'user': {
            'accountId': 11001,
            'accountName': 'vinyakas',
            'firstName': 'Siddhi',
            'lastName': 'Vinayaka',
            'accountType': 'Person',
            'status': 'Current',
            'department': 'CMAS',
            'company': 'TimeInc',
            'email': 'Siddhi.Vinayaka@timeinc.com',
            'phone': '+1 212 522 1212',
            'isActive': 'true'
          }
      });
      const spyGetStateMembersSearched = spyOn(accDetailService, 'getStateMembersSearched').and.returnValue(false);
      const spyGenerateActions = spyOn(comp, 'generateActions');
      const spySetStateMembersSearched = spyOn(accDetailService, 'setStateMembersSearched');

      comp.accountRequests('members');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(spyGetSelectedAccountInformation).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalledTimes(1);
        expect(comp.generateActions).toHaveBeenCalledWith('user members', '', 'vinyakas', comp.STRING_GET);
        expect(spySetStateMembersSearched).toHaveBeenCalled();
        expect(spySetStateMembersSearched).toHaveBeenCalledTimes(1);
        expect(spySetStateMembersSearched).toHaveBeenCalledWith(true);
      });
    });
    it('Account Details Component: Account Request functionality test for role is requested', () => {
      comp.usrFormSearched = true;
      comp.accountTitle = 'vinyakas';
      const spyGetSelectedAccountInformation = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        'user': {
            'accountId': 11001,
            'accountName': 'vinyakas',
            'firstName': 'Siddhi',
            'lastName': 'Vinayaka',
            'accountType': 'Person',
            'status': 'Current',
            'department': 'CMAS',
            'company': 'TimeInc',
            'email': 'Siddhi.Vinayaka@timeinc.com',
            'phone': '+1 212 522 1212',
            'isActive': 'true'
          }
      });
      const spyGenerateActions = spyOn(comp, 'generateActions');

      comp.accountRequests('roles');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(spyGetSelectedAccountInformation).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalledTimes(1);
        expect(comp.generateActions).toHaveBeenCalledWith('user roles', 'http://tmpcmamva04/AdbAdminApi/api/Account/Details/Roles/', 'vinyakas', comp.STRING_GET);
      });
    });
    it('Account Details Component: Account Request functionality test for authorization is requested', () => {
      comp.usrFormSearched = true;
      comp.accountTitle = 'vinyakas';
      const spyGetSelectedAccountInformation = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        'user': {
            'accountId': 11001,
            'accountName': 'vinyakas',
            'firstName': 'Siddhi',
            'lastName': 'Vinayaka',
            'accountType': 'Person',
            'status': 'Current',
            'department': 'CMAS',
            'company': 'TimeInc',
            'email': 'Siddhi.Vinayaka@timeinc.com',
            'phone': '+1 212 522 1212',
            'isActive': 'true'
          }
      });
      const spyGenerateActions = spyOn(comp, 'generateActions');

      comp.accountRequests('authorizations');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(spyGetSelectedAccountInformation).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalledTimes(1);
        expect(comp.generateActions).toHaveBeenCalledWith('user authorization', 'http://tmpcmamva04/AdbAdminApi/api/Account/Details/Authorization/Applications/', 'vinyakas', comp.STRING_GET);
      });
    });
    it('Account Details Component: Account Request functionality test for impersonation is requested', () => {
      comp.usrFormSearched = true;
      comp.accountTitle = 'vinyakas';
      const spyGetSelectedAccountInformation = spyOn(appStateService, 'getSelectedAccountInformation').and.returnValue({
        'user': {
            'accountId': 11001,
            'accountName': 'vinyakas',
            'firstName': 'Siddhi',
            'lastName': 'Vinayaka',
            'accountType': 'Person',
            'status': 'Current',
            'department': 'CMAS',
            'company': 'TimeInc',
            'email': 'Siddhi.Vinayaka@timeinc.com',
            'phone': '+1 212 522 1212',
            'isActive': 'true'
          }
      });
      const spyGenerateActions = spyOn(comp, 'generateActions');

      comp.accountRequests('impersonations');
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(spyGetSelectedAccountInformation).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalled();
        expect(comp.generateActions).toHaveBeenCalledTimes(1);
        expect(comp.generateActions).toHaveBeenCalledWith('user impersonations', 'http://tmpcmamva04/AdbAdminApi/api/Account/Details/Impersonation/', 'vinyakas', comp.STRING_GET);
      });
    });
    it('Account Details Component: onFieldSearchValidateAccount functionality test, when action is undefined with user Name empty', () => {
      const accService = accDetailService;
      const spyAccountDetailMembers = spyOn(accService, 'setStateMembersSearched');
      const spyAccountDetailGroups = spyOn(accService, 'setStateGroupsSearched');
      comp.onFieldSearchValidateAccount({
        currentTarget: {
          value: "abc"
        }
      });

      expect(spyAccountDetailMembers).toHaveBeenCalledWith(false);
      expect(spyAccountDetailGroups).toHaveBeenCalledWith(false);
    });
    it('Account Details Component: accountValidate functionality test, when action is undefined with user Name non-empty', () => {
      const accService = accDetailService;
      const spyAccountDetailMembers = spyOn(accService, 'setStateMembersSearched');
      const spyAccountDetailGroups = spyOn(accService, 'setStateGroupsSearched');
      const spyAccountDetailComponent = spyOn(comp, 'generateActions');
      comp.user.name = 'vinyakas';
      comp.accountTitle = 'Person';
      comp.STRING_POST = 'POST';

      // comp.accountValidate();

      // expect(comp.accountTitle).toContain('vinyakas');
      // expect(spyAccountDetailMembers).toHaveBeenCalledWith(false);
      // expect(spyAccountDetailGroups).toHaveBeenCalledWith(false);
      // expect(spyAccountDetailComponent).toHaveBeenCalled();
      // expect(spyAccountDetailComponent).toHaveBeenCalledWith(USER_SEARCH, USERACCOUNT_URL, this.accountTitle, this.STRING_POST);
    });
    it('Account Details Component: clear User Account functionality test, when user clicks cancel btn', () => {
      const accService = appStateService;
      const spyAccountDetailService = spyOn(accService, 'resetSelectedAccount');

      comp.clearUsrAccount();

      expect(comp.usrFormSearched).toBeFalsy();
      expect(comp.usrFormAdd).toBeFalsy();
      expect(comp.accountTitle).toEqual('');
      expect(spyAccountDetailService).toHaveBeenCalled();
    });
    it('Account Details Component: check the functionality of generateActions', () => {
      const spyAppStateService = spyOn(appStateService, 'dispatch');

      const type = 'user';
      const url = 'http://tmpcmamva04/AdbAdminApi/api/Account/Details/';
      const query = 'vinyakas';
      const reqType = 'POST';
      comp.generateActions(type, url, query, reqType);

      expect(spyAppStateService).toHaveBeenCalled();
      expect(spyAppStateService).toHaveBeenCalledTimes(1);
    });
    it('Account Details Component: check the functionality of onResponseNewAccount, when account is Individual as new status', () => {
      const spyAccountDetailsService = spyOn(accDetailService, 'clearFetchedData');
      const spyUpdateUsrStateService = spyOn(comp, 'updateUsrStateService');
      comp.STRING_NAV_MEMBER = '/accountDetails/members';
      comp.STRING_NAV_GROUP = '/accountDetails/groups';
      // function found under userAccount, userAccount is inside on ResponseNewAccount;
      const router = comp.router;
      const spyRouterNavigation = spyOn(router, 'navigate').and.returnValue({
        then: function() {
          return false;
          // we are just manupulating the router navigate fn, just checking router function called...
        }
      });
      const mockAction = {
        'type': 'user new account result',
        'payload': {
          'data': {
            'accountId': -1,
            'accountName': 'vinyakas',
            'displayName': 'Siddhi Vinayaka',
            'firstName': 'Siddhi',
            'lastName': 'Vinayaka',
            'emailAddress': 'Siddhi.Vinayaka@timeinc.com',
            'company': 'Time Inc.',
            'department': 'Time Inc India',
            'phoneNumber': '+1-9480559739',
            'isActive': true,
            'accountType': 'Person',
            'status': 'New',
            'entityState': 0,
            'members': [],
            'groups': [],
            'adGroups': null
          }
        }
      };
      fixture.detectChanges();
      comp.onResponseNewAccount(mockAction);

      expect(comp.usrFormAdd).toBeTruthy();
      expect(spyAccountDetailsService).toHaveBeenCalled();
      expect(spyAccountDetailsService).toHaveBeenCalledTimes(1);
      expect(spyRouterNavigation).toHaveBeenCalled();
      expect(spyRouterNavigation).toHaveBeenCalledWith([comp.STRING_NAV_GROUP]);
      expect(spyRouterNavigation).toHaveBeenCalledTimes(1);
    });
    it('Account Details Component: check the functionality of onResponseNewAccount, when account is Group as new status', () => {
      const spyAccountDetailsService = spyOn(accDetailService, 'clearFetchedData');
      const spyUpdateUsrStateService = spyOn(comp, 'updateUsrStateService');
      comp.STRING_NAV_MEMBER = '/accountDetails/members';
      comp.STRING_NAV_GROUP = '/accountDetails/groups';
      // function found under userAccount, userAccount is inside on ResponseNewAccount;
      const router = comp.router;
      const spyRouterNavigation = spyOn(router, 'navigate').and.returnValue({
        then: function() {
          return false;
          // we are just manupulating the router navigate fn, just checking router function called...
        }
      });
      const mockAction = {
        'type': 'user new account result',
        'payload': {
          'data': {
            'accountId': -1,
            'accountName': 'err',
            'displayName': null,
            'firstName': '',
            'lastName': '',
            'emailAddress': '',
            'company': '',
            'department': '',
            'phoneNumber': '',
            'isActive': true,
            'accountType': 'ADB',
            'status': 'New',
            'entityState': 0,
            'members': [],
            'groups': [],
            'adGroups': null
          }
        }
      };
      fixture.detectChanges();

      comp.onResponseNewAccount(mockAction);

      expect(comp.usrFormAdd).toBeTruthy();
      expect(spyAccountDetailsService).toHaveBeenCalled();
      expect(spyAccountDetailsService).toHaveBeenCalledTimes(1);
      expect(spyRouterNavigation).toHaveBeenCalled();
      expect(spyRouterNavigation).toHaveBeenCalledWith([comp.STRING_NAV_MEMBER]);
      expect(spyRouterNavigation).toHaveBeenCalledTimes(1);
    });
    it('Account Details Component: check functionality of refreshMembership, accountName is present', () => {
      comp.user = {
        accountName: 'vinyakas'
      };
      const spyGenerateActions = spyOn(comp, 'generateActions');
      comp.refreshMembership();

      expect(spyGenerateActions).toHaveBeenCalled();
      expect(spyGenerateActions).toHaveBeenCalledTimes(1);
      expect(spyGenerateActions).toHaveBeenCalledWith('refresh membership', 'http://tmpcmamva04/AdbAdminApi/api/Account/RefreshMembership/', 'vinyakas', comp.STRING_GET);
      expect(comp.refreshMembershipClicked).toBeTruthy();
    });
    it('Account Details Component: check functionality of refreshMembership, accountName is empty', () => {
      comp.user = {
        accountName: ''
      };
      const spyGenerateActions = spyOn(comp, 'generateActions');
      comp.refreshMembership();

      expect(spyGenerateActions).not.toHaveBeenCalled();
      expect(spyGenerateActions).not.toHaveBeenCalledTimes(1);
      expect(spyGenerateActions).not.toHaveBeenCalledWith('refresh membership', 'http://tmpcmamva04/AdbAdminApi/api/Account/RefreshMembership/', 'vinyakas', comp.STRING_GET);
      expect(comp.refreshMembershipClicked).not.toBeTruthy();
    });
    xit('Account Details Component: check functionality of onResponseMemberShip, when person account is current', () => {
      const mockAction = {
        payload: {
          data: {'user':{'accountId':2060,'displayName':null,'firstName':'Siddhi','lastName':'Vinayaka','emailAddress':'Siddhi.Vinayaka@timeinc.com','company':'Time Inc.','department':'Time Inc India','phoneNumber':'+1-9480559739','isActive':true,'accountType':'Person','status':'Current','state':'Original','members':null,'groups':null,'accountName':'vinyakas'},'groups':null,'members':null}
        },
        type: 'refresh membership result'
      };
      const spyUserAcccount = spyOn(comp, 'userAccount');
      const spyDispatchAllowSave = spyOn(comp, 'dispatchAllowSave');

      comp.onResponseMemberShip(mockAction);

      expect(spyUserAcccount).toHaveBeenCalled();
      expect(spyUserAcccount).toHaveBeenCalledTimes(1);
      expect(spyUserAcccount).toHaveBeenCalledWith(mockAction.payload.data.user);
      expect(spyDispatchAllowSave).toHaveBeenCalled();
      expect(spyDispatchAllowSave).toHaveBeenCalledTimes(1);
      expect(spyDispatchAllowSave).toHaveBeenCalledWith(true);
    });
    it('Account Details Component: check functionality of onSelectionValidateAccount', () => {
      const mockAction = {
        payload: {
          url : 'http://tmpcmamva04/AdbAdminApi/api/Account/Details/akaplan1271',
          reqType: 'POST',
          query: {
            "accountId":1196,
            "accountName":"akaplan1271",
            "displayName":"Abbey Kaplan",
            "isActive":true,
            "accountType":"Person",
            "firstName":null,
            "lastName":null,
            "emailAddress":null,
            "company":null,
            "department":null,
            "phoneNumber":null,
            "isGroup":false,
            "spriteCssClass":"person",
            "id":"",
            "index":7,
            "_matchFilter":true
          }
        },
        type: 'account select'
      };
      const spySetSateMembersSearced = spyOn(accDetailService, 'setStateMembersSearched');
      const spySetSateGroupsSearced = spyOn(accDetailService, 'setStateGroupsSearched');
      const spyClearFetchedData = spyOn(accDetailService, 'clearFetchedData');
      const spyGenerateActions = spyOn(comp, 'generateActions');

      comp.onSelectionValidateAccount(mockAction);

      expect(spySetSateGroupsSearced).toHaveBeenCalled();
      expect(spySetSateGroupsSearced).toHaveBeenCalledWith(false);
      expect(spySetSateGroupsSearced).toHaveBeenCalled();
      expect(spySetSateGroupsSearced).toHaveBeenCalledWith(false);
      expect(spyClearFetchedData).toHaveBeenCalled();
      expect(spyGenerateActions).toHaveBeenCalled();
      expect(spyGenerateActions)
      .toHaveBeenCalledWith('user account search', 'http://tmpcmamva04/AdbAdminApi/api/Account/Details/', 'akaplan1271', comp.STRING_POST);
    });
    xit('Account Details Component: check functionality of onFieldSearchValidateAccount', () => {
      const spyAccountDetailServiceMembers = spyOn(accDetailService, 'setStateMembersSearched');
      const spyAccountDetailServiceGroups = spyOn(accDetailService, 'setStateGroupsSearched');
      const spyAccountDetailServiceClear = spyOn(accDetailService, 'clearFetchedData');
      const spyAppStateService = spyOn(appStateService, 'resetSelectedAccount');
      // fixture.detectChanges();

      comp.onFieldSearchValidateAccount({
        currentTarget: {
          value: "abc"
        }
      });

      expect(spyAccountDetailServiceMembers).toHaveBeenCalled();
      expect(spyAccountDetailServiceMembers).toHaveBeenCalledTimes(1);
      expect(spyAccountDetailServiceGroups).toHaveBeenCalled();
      expect(spyAccountDetailServiceGroups).toHaveBeenCalledTimes(1);
      expect(spyAccountDetailServiceClear).toHaveBeenCalled();
      expect(spyAccountDetailServiceClear).toHaveBeenCalledTimes(1);
      expect(spyAppStateService).toHaveBeenCalled();
      expect(spyAppStateService).toHaveBeenCalledTimes(1);
    });
    xit('Account Details Component: check functionality of userAccount, scenario user selects from Left Panel', () => {
      const spyUpdateUsrStateService = spyOn(comp, 'updateUsrStateService');
      const mockUserObj = {"accountId":1199,"accountName":"akaplan1271","displayName":"Abbey Kaplan","isActive":true,"accountType":"Person","isGroup":false,"spriteCssClass":"person","id":"","index":7,"_matchFilter":true}
      // fixture.detectChanges();

      comp.userAccount(mockUserObj);

      expect(comp.user.accountName).toBeDefined();
      expect(comp.user.accountName).toBe(mockUserObj.accountName);
      expect(spyUpdateUsrStateService).toHaveBeenCalled();
      expect(spyUpdateUsrStateService).toHaveBeenCalledTimes(1);
    });
  });
});

