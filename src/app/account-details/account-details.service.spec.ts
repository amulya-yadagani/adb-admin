import { Injectable } from '@angular/core';
import { async, TestBed, inject } from '@angular/core/testing';
import { HttpModule, Http, Jsonp } from '@angular/http';
import { AccountDetailsService } from './account-details.service';
import { AppStateService } from '../state/app-state.service';
import { AccountDetailsComponent } from 'app/account-details/account-details.component';

describe('Isolate Testing: Account Details Service', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        AccountDetailsService,
        AppStateService
      ]
    });
  }));
  it('Account Details Service : validate constants values',
    async(inject([AccountDetailsService], (service: AccountDetailsService) => {
      expect(service.STRING_USER).toBe('user');
      expect(service.STRING_GROUPS).toBe('groups');
      expect(service.STRING_MEMBERS).toBe('members');
      expect(service.STRING_ROLES).toBe('roles');
      expect(service.STRING_AUTHORIZATIONS).toBe('application');
      expect(service.STRING_IMPERSONATIONS).toBe('impersonations');
    })
  ));
  it('Account Details Service, check whether objHandlerProperty functionality removes members property',
  async( inject([ AccountDetailsService], (service: AccountDetailsService) => {
    const mockMemberAccount = {
      'accountId': 1132,
      'accountName': 'GLOBAL-NYCIT-CMAS-ALL',
      'displayName': null,
      'firstName': null,
      'lastName': null,
      'emailAddress': null,
      'company': null,
      'department': null,
      'phoneNumber': null,
      'isActive': true,
      'accountType': 'AD',
      'status': 'Current',
      'entityState': 0,
      'members': [
        {
          'accountId': 1122,
          'name': 'GLOBAL-NYCIT-CMAS-MID',
          'firstName': null,
          'lastName': null,
          'emailAddress': null,
          'department': null,
          'phoneNumber': null,
          'isActive': true,
          'accountType': 'AD',
          'lastLoginDate': 'No Login',
          'status': 'Current',
          'entityState': 0
        },
        {
          'accountId': 1123,
          'name': 'GLOBAL-NYCIT-CMAS-MID',
          'firstName': null,
          'lastName': null,
          'emailAddress': null,
          'department': null,
          'phoneNumber': null,
          'isActive': true,
          'accountType': 'AD',
          'lastLoginDate': 'No Login',
          'status': 'Current',
          'entityState': 0
        },
      ],
      'groups': [],
      'adGroups': null
    };
    const modResponse = service.objHandlerProperty(mockMemberAccount, 'members');
    expect(modResponse.members).toBeUndefined();
  })));
  it('Account Details Service, check whether objHandlerProperty functionality removes groups property',
  async(inject([AccountDetailsService], (service: AccountDetailsService) => {
    const mockGroupAccount = {
      'accountId': 1132,
      'accountName': 'GLOBAL-NYCIT-CMAS-ALL',
      'displayName': null,
      'firstName': null,
      'lastName': null,
      'emailAddress': null,
      'company': null,
      'department': null,
      'phoneNumber': null,
      'isActive': true,
      'accountType': 'AD',
      'status': 'Current',
      'entityState': 0,
      'members': [],
      'groups': [
        {
          'groupId': 952,
          'groupName': '@Time Customer Service',
          'groupType': 'ADB',
          'status': 'Current',
          'entityState': 0,
          'isActive': false
        },
        {
          'groupId': 2086,
          'groupName': 'CircmanTestGroup',
          'groupType': 'ADB',
          'status': 'Current',
          'entityState': 0,
          'isActive': false
        }
      ]
    };
    const modResponse = service.objHandlerProperty(mockGroupAccount, 'groups');
    expect(modResponse.groups).toBeUndefined();
  })));
});
