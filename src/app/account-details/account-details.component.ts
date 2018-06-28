import { Component, OnInit, DoCheck, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, RoutesRecognized  } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { AppStateService } from '../state/app-state.service';

import {
    ACCOUNT_SELECT,
    USER_ACCOUNT_RESULT,
    USER_SEARCH_NEW_RESULT,
    USER_MEMBERSHIP,
    USER_MEMBERSHIP_RESULT,
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
    USER_SEARCH_RESULT,
    TOGGLE_COMMAND_COLUMN,
    AFTER_SAVE_ALL_RESET,
    ADD_NEW_ACCOUNT } from '../state/actions';
import {
    USERACCOUNT_URL,
    USERMEMBERSHIP_URL,
    USERROLES_URL,
    USERAUTHORIZATIONS_URL,
    USERIMPERSONATIONS_URL,
    ADDED} from '../utils/constants';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import '@progress/kendo-ui/js/kendo.grid.js';

import { AccountDetailsService } from './account-details.service';

let $ = null;

@Component({
    selector: 'app-account-details',
    templateUrl: './account-details.component.html',
    styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit, AfterViewInit {
    // ---Component constants---
    STRING_POST: string = <string>'POST';
    STRING_GET: string = <string>'GET';
    STRING_SETPATH: string = <string>'SETPATH';
    STRING_GETPATH: string = <string>'GETPATH';
    STRING_ADACCTYPE: string = <string>'AD';
    STRING_ADBACCTYPE: string = <string>'ADB';
    STRING_PERSONACCTYPE: string = <string>'Person';
    STRING_JQuery: string = <string>'jQuery';
    STRING_EMPTY: string = <string>'';
    STRING_USER: string = <string>'user';
    STRING_GROUP: string = <string>'groups';
    STRING_MEMBER: string = <string>'members';
    STRING_ROLE: string = <string>'roles';
    STRING_AUTHORIZATION: string = <string>'authorizations';
    STRING_IMPERSONATION: string = <string>'impersonations';
    STRING_SPLITELEMENT: string = <string>'vertical';
    STRING_NAV_GROUP: string = <string> '/accountDetails/groups';
    STRING_NAV_MEMBER: string = <string> '/accountDetails/members';
    // ---Component Variables---
    usrFormMembership = false;
    usrFormSearched: boolean = <boolean>false;
    usrFormAdd: boolean = <boolean>false;
    refreshMembershipClicked: boolean = false;
    user: any = {};
    activeMemberTab: boolean = <boolean>true;
    activeImpersonationTab: boolean = <boolean>true;
    activePath: string = <string>this.STRING_EMPTY;
    currentPath: string = <string>this.STRING_EMPTY;
    accountTitle: string = <string>this.STRING_EMPTY;

    constructor(
        private el: ElementRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private accountDetailsService: AccountDetailsService,
        private appStateService: AppStateService) {
        const self = this;
        $ = window[this.STRING_JQuery];
        const locationURLPath =  window.location.href;
        this.activePath = (locationURLPath).slice((locationURLPath.split(this.STRING_EMPTY).lastIndexOf('/') + 1));
        const appStateServiceInformation = this.appStateService.getAccountTabDetails();
        this.usrFormSearched = appStateServiceInformation.searched; // default searched Info is false...
        if (this.usrFormSearched) {
            // account already searched and data exists, fetch from appState Service
            this.user = JSON.parse(JSON.stringify(appStateServiceInformation.selectedAccount.user));
        }else {
            this.user = JSON.parse(JSON.stringify(appStateServiceInformation._initialForm.usrIndividual));
        }
        this.router.events.filter((event: any) => {
          // We just listen to NavigationEnd event, to get current path activated on reload as well as route change...
          return event instanceof NavigationEnd;
        })
        .subscribe((route: any) => {
            // If route has info for child route, the urlParts.length will be > 2
            let urlParts = '';
            if (route.urlAfterRedirects.toLowerCase().indexOf('accountdetails') > 0) {
                urlParts = route.urlAfterRedirects.split('/');
            }
            if (urlParts.length > 2) {
              // self.currentPath will be one of the child routes members,groups,roles,authorizations or impersonations
              self.currentPath = self.activePath = urlParts[urlParts.length - 1];
              this.appStateService.setResourceLocatorPath(self.currentPath);
              self.accountRequests(self.currentPath);
            }
        });
        this.appStateService.subscribe(USER_SEARCH_RESULT, this.onResponseUserAccount.bind(this));
        this.appStateService.subscribe(USER_SEARCH_NEW_RESULT, this.onResponseNewAccount.bind(this));
        this.appStateService.subscribe(USER_MEMBERSHIP_RESULT, this.onResponseMemberShip.bind(this));
        this.appStateService.subscribe(ACCOUNT_SELECT, this.onSelectionValidateAccount.bind(this));
        this.appStateService.subscribe(AFTER_SAVE_ALL_RESET, this.resetAccount.bind(this));
    }

    ngOnInit(): void {
        $('#' + this.STRING_SPLITELEMENT).kendoSplitter({
            orientation: 'vertical',
            panes: [
                { collapsible: true, min: 160},
                { collapsible: false, size: '70%'}
            ]
        });
    }

    ngAfterViewInit(): void {
      // Initial render doesnot take the size correctly. So doing it once again
      $('#' + this.STRING_SPLITELEMENT).data('kendoSplitter').size('.k-pane:first', '160px');
    }

    reqAPIServices(): void {
        this.accountRequests(this.currentPath);
    }

    updateUsrStateService(): void {
        // stores boolean value for account searched by user
        this.appStateService.updateAccountSearch(this.usrFormSearched);
    }

    userAccount(userObj): void {
        if (userObj !== undefined) {
          /*
          Since we want to persist the changes for each account to provide multi-edit functionality
          the following code is commented - Jasmine
          */
            /* for (const key in userObj) {
                if (this.user[key] !== undefined) {
                    if ((key === 'accountName') && (userObj['accountId'] < 0)) {
                        this.user[key] = this.accountTitle;
                    } else {
                        this.user[key] = userObj[key];
                    }
                }
            } */
            this.user = userObj;
            this.user.type = userObj.accountType;
            if(userObj.accountType != this.STRING_PERSONACCTYPE) {
              this.user.type += " Group";
            }
        }
        this.usrFormSearched = true;
        this.updateUsrStateService();
    }

    accountRequests(currentPath): void {
        if (this.usrFormSearched) { // ensure whether user searched an account
            const accountDetails = this.appStateService.getSelectedAccountInformation();
            switch (currentPath) {
                case this.STRING_GROUP:
                    if ((accountDetails.user) && (this.accountDetailsService.getStateGroupsSearched() === false)) {
                        this.appStateService.dispatch({
                            type: USER_GROUPS,
                            reqType: this.STRING_POST,
                            payload: {
                                classify: 'ACC_SEARCH_GROUP',
                                // url : '', there is not url for groups
                                query : this.accountTitle
                            }
                        });
                        // this.generateActions(USER_GROUPS, '', this.accountTitle, this.STRING_GET);
                        this.accountDetailsService.setStateGroupsSearched(true);
                    }
                break;
                case this.STRING_MEMBER :
                    //Now that we are persisting data for new group, we need to make request
                    if ((accountDetails.user) && (this.accountDetailsService.getStateMembersSearched() === false)) {
                        this.appStateService.dispatch({
                            type: USER_MEMBERS,
                            reqType: this.STRING_POST,
                            payload: {
                                classify: 'ACC_SEARCH_MEMBER',
                                // url : '', there is not url for members
                                query : this.accountTitle
                            }
                        });
                        // this.generateActions(USER_MEMBERS, '', this.accountTitle, this.STRING_GET);
                        this.accountDetailsService.setStateMembersSearched(true);
                    }
                break;
                case this.STRING_ROLE :
                    if (!(accountDetails.user)) {
                        this.clearEachEntity(this.STRING_USER, 'clear');
                    } else if (accountDetails.user.status.toLowerCase() === 'new') {
                        // check whether account is new account
                    } else if ((accountDetails.user) && (accountDetails.roles === undefined)) {
                        this.appStateService.dispatch({
                            type: USER_ROLES,
                            reqType: this.STRING_POST,
                            payload: {
                                classify: 'ACC_SEARCH_ROLE',
                                url : USERROLES_URL,
                                query : this.accountTitle
                            }
                        });
                        // this.generateActions(USER_ROLES, USERROLES_URL, this.accountTitle, this.STRING_GET);
                    } else if ((accountDetails.user) && (accountDetails.roles)) {
                        this.accountDetailsService.nextActionDispatcher(USER_ROLES_RESULT, {['roles']: accountDetails.roles});
                    }
                break;
                case this.STRING_AUTHORIZATION :
                    if (!(accountDetails.user)) {
                        this.clearEachEntity(this.STRING_USER, 'clear');
                    } else if (accountDetails.user.status.toLowerCase() === 'new') {
                        // check whether account is new account
                    } else if ((accountDetails.user) && (accountDetails.application === undefined)) {
                        this.appStateService.dispatch({
                            type: USER_AUTHORIZATION,
                            reqType: this.STRING_POST,
                            payload: {
                                classify: 'ACC_SEARCH_AUTHORIZATION',
                                url : USERAUTHORIZATIONS_URL,
                                query : this.accountTitle
                            }
                        });
                        // this.generateActions(USER_AUTHORIZATION, USERAUTHORIZATIONS_URL, this.accountTitle, this.STRING_GET);
                    } else if ((accountDetails.user) && (accountDetails.application)) {
                        this.accountDetailsService.nextActionDispatcher(USER_AUTHORIZATION_RESULT, {['application']: accountDetails.application});
                    }
                break;
                case this.STRING_IMPERSONATION :
                    if (!(accountDetails.user)) {
                        this.clearEachEntity(this.STRING_USER, 'clear');
                    } else if (accountDetails.user.status.toLowerCase() === 'new') {
                        // check whether account is new account
                    } else if ((accountDetails.user) && (accountDetails.impersonations === undefined)) {
                        this.appStateService.dispatch({
                            type: USER_IMPERSONATIONS,
                            reqType: this.STRING_POST,
                            payload: {
                                classify: 'ACC_SEARCH_IMPERSONATION',
                                url : USERIMPERSONATIONS_URL,
                                query : this.accountTitle
                            }
                        });
                        // this.generateActions(USER_IMPERSONATIONS, USERIMPERSONATIONS_URL, this.accountTitle, this.STRING_GET);
                    } else if ((accountDetails.user) && (accountDetails.impersonations)) {
                        this.accountDetailsService.nextActionDispatcher(USER_IMPERSONATIONS_RESULT, {['impersonation']: accountDetails.impersonations});
                    }
                break;
                default :
                break;
            }
        }
    }

    clearEachEntity(entity: any, operation: string): Array<any> {
        // if (operation === this.STRING_USER && entity !== undefined) {
        //     for (const key in entity) {
        //         if (entity.hasOwnProperty(key)) {
        //             entity[key] = this.STRING_EMPTY;
        //         }
        //     }
        // }else if (entity !== undefined) {
        //     entity = [];
        // }
        entity
        return entity;
    }

    clearUsrAccountOnKeyPress(event: Event) {
        /* Instead of using this.user.accountName,  event.currentTarget is used to get the input value - Jasmine*/
        if ((event as any).keyCode === 46 || event.currentTarget["value"].length === 0) {
            this.clearUsrAccount();
            this.routeDefault();
        }
    }

    routeDefault() {
        this.router.navigate([this.STRING_NAV_MEMBER]);
    }

    clearUsrAccount(): void {
        const userAccountDetails = this.appStateService.getAccountTabDetails();
        const selectedAccount = userAccountDetails.selectedAccount;
        this.activeMemberTab = true;
        this.activeImpersonationTab = true;
        // this.router.navigate([this.STRING_NAV_MEMBER]);
        // reset the searched field to false and update in appStateService as well...
        this.usrFormSearched = false;
        //this.usrFormAdd = false;
        this.enableAddBtn(false);
        this.accountTitle = this.STRING_EMPTY;
        this.appStateService.updateAccountSearch(this.usrFormSearched);
        this.appStateService.resetSelectedAccount();
        this.user = JSON.parse(JSON.stringify(userAccountDetails._initialForm.usrIndividual));
        // this clears the data...
        this.accountDetailsService.clearFetchedData();
        this.enableMembershipBtn(false);//this.usrFormMembership = false;
        this.refreshMembershipClicked = false;
        //this.dispatchAllowSave(false);
    }

    generateActions(type, url, query, reqType): void {
        const path = url + query;
        const action = {
            type: type,
            reqType: reqType,
            payload: {
                url : path,
                query : query
            }
        };
        this.appStateService.dispatch(action);
    }

    refreshMembership(): void {
        const { accountName } = this.user;
        this.enableMembershipBtn(false);
        if (accountName.length > 0) {
            this.appStateService.dispatch({
                type: USER_MEMBERSHIP,
                reqType: this.STRING_POST,
                payload: {
                    classify: 'ACC_SEARCH_MEMBERSHIP',
                    url : USERMEMBERSHIP_URL,
                    query : accountName
                }
            });
            // const url = USERMEMBERSHIP_URL;
            // this.generateActions(USER_MEMBERSHIP, url, accountName, this.STRING_GET);
            this.refreshMembershipClicked = true;
        }
    }

    onFieldSearchValidateAccount(e): void {
        const keyword = e.currentTarget.value.trim();
        if (!keyword) {
          return;
        }
        this.accountDetailsService.setStateMembersSearched(false);
        this.accountDetailsService.setStateGroupsSearched(false);
        this.enableMembershipBtn(true);
        //Clear previously selected account so that the data for tabs in loaded correctly
        //This fixes the following issue
        //1) Select a person account from AccountPanel. Navigate to all tabs
        //2) Now search for a valid person account. The data for none of the tabs (except first one) is not loaded
        this.appStateService.resetSelectedAccount();
        this.accountDetailsService.clearFetchedData();
        this.accountTitle = keyword;
        this.appStateService.dispatch({
            type: USER_SEARCH,
            reqType: this.STRING_POST,
            payload: {
                classify: 'ACC_SEARCH',
                url : USERACCOUNT_URL,
                query : this.accountTitle
            }
        });
        // this.generateActions(USER_SEARCH, USERACCOUNT_URL, this.accountTitle, this.STRING_POST);
    }
    onSelectionValidateAccount(action): void {
        this.accountDetailsService.setStateMembersSearched(false);
        this.accountDetailsService.setStateGroupsSearched(false);
        this.accountDetailsService.clearFetchedData();
        if (action) {
            // when user clicks on left panel account list
            this.clearUsrAccount();
            this.routeDefault();
            this.accountTitle = action.payload.query.accountName;
            this.userAccount(action.payload.query);
            this.appStateService.dispatch({
                type: USER_SEARCH,
                reqType: this.STRING_POST,
                payload: {
                    classify: 'ACC_SEARCH',
                    url : USERACCOUNT_URL,
                    query : this.accountTitle
                }
            });
            // this.generateActions(USER_SEARCH, USERACCOUNT_URL, this.accountTitle, this.STRING_POST);
        }
    }

    addAccount(): void {
        if (this.usrFormAdd  /* && this.user.accountName.length > 3 */) {
          // user account Name is entered, will be able to add groups or fetch account information...
          // this.accountDetailsService.addAccountADBGroup(this.user);
          this.enableMembershipBtn(false);//this.usrFormMembership = false;
          //this.usrFormAdd = false;
          this.enableAddBtn(false);
          this.appStateService.enableSaveAllBtn(true);

          this.user.state = ADDED;
          //add new account so that the search result in AccountPanelComponent & MembersComponent also populates new accounts
          this.appStateService.addNewAccount(this.user);

          let action = {
            type: ADD_NEW_ACCOUNT,
            payload: this.user
          };

          this.appStateService.dispatch(action);
        }
    }

    onResponseNewAccount(action): void {
        const newAccountType = action.payload.data.accountType;
        this.userAccount(action.payload.data);
        this.enableMembershipBtn(false);
        this.enableAddBtn(true);
        this.activeMemberTab = newAccountType != 'Person';
        this.accountDetailsService.clearFetchedData(); // Clear child tabs
        const routeNav = (newAccountType === 'ADB') ? this.STRING_NAV_MEMBER : this.STRING_NAV_GROUP;
        this.router.navigate([routeNav]).then(() => {
            this.appStateService.dispatch({
                type: TOGGLE_COMMAND_COLUMN,
                payload: {
                    showColumn: this.user.accountType === this.STRING_ADBACCTYPE
                }
            });
        });
    }

    onResponseUserAccount(action): void {
        // const userName: string = <string>this.accountTitle;
        const userName: string = <string>action.payload.data.accountName;
        const storedUsers = this.appStateService.getAcccountInformation(userName);
        if ((storedUsers !== undefined) && (storedUsers.user !== undefined)) {
            // router navigate makes dynamica decision based on account type...
            // also solves router reuse strategy non instantiated component, making desired route possible.
            this.usrFormSearched = true;
            if (storedUsers.user.accountType === this.STRING_PERSONACCTYPE) {
                this.activeMemberTab = false;
                this.activeImpersonationTab = true;
                this.router.navigate([this.STRING_NAV_GROUP]).then(() => {
                    this.accountDetailsService.setStateGroupsSearched(false);
                    this.accountTitle = action.payload.data.accountName;
                    this.accountRequests(this.STRING_GROUP);
                });
            }else if (storedUsers.user.accountType === this.STRING_ADACCTYPE || storedUsers.user.accountType === this.STRING_ADBACCTYPE) {
                this.activeMemberTab = true;
                this.activeImpersonationTab = false;
                this.router.navigate([this.STRING_NAV_MEMBER]).then(() => {
                    this.accountTitle = action.payload.data.accountName;
                    this.accountRequests(this.STRING_MEMBER);
                    this.appStateService.dispatch({
                      type: TOGGLE_COMMAND_COLUMN,
                      payload: {
                        showColumn: storedUsers.user.accountType === this.STRING_ADBACCTYPE
                      }
                    });
                });
            }
            const storedResp = storedUsers.user;
            //this.usrFormAdd = false;
            this.enableAddBtn(false);
            //this.usrFormMembership = storedUsers.user.accountType === this.STRING_ADACCTYPE || storedUsers.user.accountType === this.STRING_PERSONACCTYPE;
            let result = storedUsers.user.accountType === this.STRING_ADACCTYPE || storedUsers.user.accountType === this.STRING_PERSONACCTYPE;
            //Now we only enable Refresh Membership button if the account is active as well
            //this.usrFormMembership = this.usrFormMembership && storedUsers.user.isActive;
            result = result && storedUsers.user.isActive;
            this.enableMembershipBtn(result);
            this.userAccount(storedResp);
        }
    }

    onResponseMemberShip(action): void {
        // fn handles 2 scenarios...
        // account type recieved as response....
        // 1) new/current of person account
        // 2) new/current of ad account
        const userAccountInfo = action.payload.data;
        const { accountType } = userAccountInfo.user;
        const { status } = userAccountInfo.user;
        this.accountTitle = userAccountInfo.user.accountName;
        this.userAccount(userAccountInfo.user);
        //This is used when saving data
        this.user.refreshMembershipClicked = this.refreshMembershipClicked;

        if (status.toLowerCase() === 'new') {
          this.enableAddBtn(true);//this.usrFormAdd = true;
        } else if (status.toLowerCase() === 'current') {
          this.enableAddBtn(false);//this.usrFormAdd = false;
        }
        this.appStateService.enableSaveAllBtn(true);

        if (accountType === this.STRING_ADACCTYPE || accountType === this.STRING_ADBACCTYPE) {
            this.accountDetailsService.setStateMembersSearched(false);
            this.activeMemberTab = true;
            this.activeImpersonationTab = false;
            this.router.navigate([this.STRING_NAV_MEMBER]).then(() => {
              this.accountRequests(this.STRING_MEMBER);
              this.appStateService.dispatch({
                type: TOGGLE_COMMAND_COLUMN,
                payload: {
                  showColumn: accountType === this.STRING_ADBACCTYPE
                }
              });
          });
       }
    }

    onEmailInput(form) {
      if (form.invalid) {//Disable save button if email is invalid - Jasmine
        this.appStateService.enableSaveAllBtn(false);
      }
    }

    onFormChange(e, form) {
      let el = e.target;
      let edited = el.name == "company" || el.name == "email" || el.name == "phone";
      if(this.user.accountName && edited && this.user.status != "New") {
        //Do not enable save button if form (email) is invalid - Jasmine
        this.appStateService.enableSaveAllBtn(true && !form.invalid);
        this.user.state = "Modified";
      }
    }

    onInValidAccount(): void {
        this.user.isActive = false;
        this.appStateService.enableSaveAllBtn(true);
    }

    enableAddBtn(value) {
      //Impersonator role, add button will always be disabled
      if(this.appStateService.isImpersonatorRole) {
        value = false;
      }
      this.usrFormAdd = value;
    }

    enableMembershipBtn(value) {
      //Impersonator role, refresh membership button will always be disabled
      if(this.appStateService.isImpersonatorRole) {
        value = false;
      }
      this.usrFormMembership = value;
    }

    resetAccount() {
        // Object.keys(this.user).map((eachField, index) => {
        //     if (eachField) {
        //         this.user[eachField] = this.STRING_EMPTY;
        //     }
        // });
        this.clearUsrAccount();
    }
    /* phoneFieldValidate(phoneNo) {
        // 3 scenario will handle
        // *) If usr enter +1 with 10 digit = +1 999 999 9999
        // *) If usr enter + with 10 digit = +1 999 999 9999
        // *) If usr enter 10 digit = +1 999 999 9999
        const elemPhn = (<HTMLInputElement>document.getElementById("phoneField"));
        const elemErrorMsg = document.getElementById("phoneErrorMsg");
        const phoneReg = new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/);
        let valPhnNum = elemPhn.value.trim().split(" ").join("");
        if (valPhnNum.indexOf('+') === 0 && valPhnNum.indexOf('1') === 1 ) {
            const preFixVal = valPhnNum.split("").splice(0,2).join("");
            valPhnNum = (valPhnNum as any).split("").splice(2,valPhnNum.length).join("");
            if (phoneReg.test(valPhnNum) && valPhnNum.length === 10) {
                valPhnNum = preFixVal + " " + valPhnNum.slice(0,3) + " " + valPhnNum.slice(3,6) + " " + valPhnNum.slice(6,10);
                elemPhn.classList.remove('ng-invalid');
                elemErrorMsg.style.display = "none";
                elemPhn.value = valPhnNum;
            } else {
                elemPhn.classList.add('ng-invalid');
                elemErrorMsg.style.display = "inline-block";
            }
        } else if (valPhnNum.indexOf('+') === 0 && valPhnNum.indexOf('1') === -1) {
            const preFixVal = (elemPhn.value as any).split("").splice(0,1)
            valPhnNum = (valPhnNum as any).split("").splice(1,valPhnNum.length).join("");
            if (phoneReg.test(valPhnNum) && valPhnNum.length === 10) {
                valPhnNum = (valPhnNum as any).split("").splice(1,valPhnNum.length).join("");
                valPhnNum = preFixVal + '1 ' + valPhnNum.slice(0,3) + " " + valPhnNum.slice(3,6) + " " + valPhnNum.slice(6,10);
                elemPhn.classList.remove('ng-invalid');
                elemErrorMsg.style.display = "none";
                elemPhn.value = valPhnNum;
            } else {
                elemPhn.classList.add('ng-invalid');
                elemErrorMsg.style.display = "inline-block";
            }
        } else if (valPhnNum.indexOf('+') === -1 && valPhnNum.indexOf('1') === -1) {
            valPhnNum = (valPhnNum as any).split("").splice(0,valPhnNum.length).join("");
            if (phoneReg.test(valPhnNum) && valPhnNum.length === 10) {
                valPhnNum = (valPhnNum as any).split("").splice(0,valPhnNum.length).join("");
                valPhnNum = '+1 ' + valPhnNum.slice(0,3) + " " + valPhnNum.slice(3,6) + " " + valPhnNum.slice(6,10);
                elemPhn.classList.remove('ng-invalid');
                elemErrorMsg.style.display = "none";
                elemPhn.value = valPhnNum;
            } else {
                elemPhn.classList.add('ng-invalid');
                elemErrorMsg.style.display = "inline-block";
            }
        }
    } */
}
