import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AppStateService } from '../state/app-state.service';
import { LoggerService } from '../utils/logger.service';
import { getErrorAction } from '../utils/parser-util';
import { USERACCOUNT_URL } from '../utils/constants';
import {
    DialogService,
    DialogRef,
    DialogCloseResult } from '@progress/kendo-angular-dialog';
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
    USER_IMPERSONATIONS,
    USER_IMPERSONATIONS_RESULT,
    USER_AUTHORIZATION,
    USER_AUTHORIZATION_RESULT,
    USER_AUTHORIZATION_CHILD_RESULT,
    USER_SEARCH,
    USER_SEARCH_RESULT,
    USER_GRID,
    USER_GRID_RESULT,
    USER_RESULT_DATA_CLEAR,
    NOTIFICATION,
    SEARCH_ERROR } from '../state/actions';
import {
    USERAUTHORIZATIONS_RESOURCES_URL,
    USERMEMBERSHIP_URL } from '../utils/constants';
// import 'rxjs/Rx';

@Injectable()
export class AccountDetailsService {
    // component constants
    STRING_POST: string = <string>'POST';
    STRING_GET: string = <string>'GET';
    STRING_USER: string = <string>'user';
    STRING_GROUPS: string = <string>'groups';
    STRING_MEMBERS: string = <string>'members';
    STRING_ROLES: string = <string>'roles';
    STRING_AUTHORIZATIONS: string = <string>'application';
    STRING_IMPERSONATIONS: string = <string>'impersonations';
    STRING_EXTRACT: string = <string>'extract';
    STRING_REMOVE: string = <string>'remove';

    private _membersSearched: boolean = <boolean>false; // will make component to fetch data if exists in appState...
    private _groupsSearched: boolean = <boolean>false;

    constructor(private http: Http, private appStateService: AppStateService, private _dialogService: DialogService) {
        appStateService.subscribe(USER_SEARCH, this.searchAccount.bind(this));
        appStateService.subscribe(USER_MEMBERSHIP, this.membershipAccount.bind(this));
        appStateService.subscribe(USER_GROUPS, this.groupAccount.bind(this));
        appStateService.subscribe(USER_MEMBERS, this.memberAccount.bind(this));
        appStateService.subscribe(USER_ROLES, this.roleAccount.bind(this));
        appStateService.subscribe(USER_AUTHORIZATION, this.authorizationAccount.bind(this));
        appStateService.subscribe(USER_IMPERSONATIONS, this.impersonationAccount.bind(this));
        appStateService.subscribe(USER_GRID, this.userGridSearch.bind(this));
    }

    onNewAccountResponseHandler(actions, type, accountName, resp): void {
        // either ADB new account or new person account
        const response = resp;
        accountName = actions.payload.query.toLowerCase();
        //Do not make accountName lower case as user may want to create account with capital letters as well - Jasmine
        //response.accountName = accountName;
        this.appStateService.setAccountInformation(accountName, type, response);
        if (response.hasOwnProperty(this.STRING_GROUPS) && response.hasOwnProperty(this.STRING_MEMBERS)) {
            response[this.STRING_GROUPS] = (response[this.STRING_GROUPS]) ? response[this.STRING_GROUPS] : [];
            response[this.STRING_MEMBERS] = (response[this.STRING_MEMBERS]) ? response[this.STRING_MEMBERS] : [];
            this.appStateService.setAccountInformation(accountName, this.STRING_GROUPS, response);
            this.appStateService.setAccountInformation(accountName, this.STRING_MEMBERS, response);
            this.nextActionDispatcher(USER_SEARCH_NEW_RESULT, response);
        }
    }

    onAccountDetailsAccountResponse(type, accountName, response): void {
        // handles already account present user searching for it...
        let groupList, memberList;
        // TODO fix issues related to groups & members getting added to user account, which needs to be removed...
        this.appStateService.setAccountInformation(accountName, type, response);
        // As we are recieving members and groups, we handle both simentenously...
        if (response.hasOwnProperty(this.STRING_GROUPS) && response.hasOwnProperty(this.STRING_MEMBERS)) {
            const userName = this.appStateService.getAccountTabDetails().selectedAccount.user.accountName.toLowerCase();
            this.appStateService.setAccountInformation(userName, this.STRING_GROUPS, response);
            this.appStateService.setAccountInformation(userName, this.STRING_MEMBERS, response);
            groupList = { STRING_GROUPS : response[this.STRING_GROUPS] };
            memberList = { STRING_MEMBERS : response[this.STRING_MEMBERS] };
            response = this.objHandlerProperty(response, this.STRING_GROUPS);
            response = this.objHandlerProperty(response, this.STRING_MEMBERS);
            this.nextActionDispatcher(USER_SEARCH_RESULT, response);
        }
    }

    onAccountDetailsTabResponse(nextActionType, actions, type, accountName, resp): void {
        // when user navigates from one tab to another tab under account details tab...
        // const response = resp;
        const response = {};
        response[type] = resp;
        accountName = actions.payload.query;
        // response[type] = response.model;
        // const response[ type ] = resp;
        // this.objHandlerProperty(response, 'model');
        const userName = this.appStateService.getAccountTabDetails().selectedAccount.user.accountName.toLowerCase();
        // this.appStateService.setAccountInformation(userName, type, response);
        this.nextActionDispatcher(nextActionType, response);
    }

    onMemberShipResponse(resp) {
        const response = { user: resp.model };
        const { groups = [] } = response.user;
        const { members = [] } = response.user;
        const { status } = response.user;
        if ('name' in response.user) {
            response.user.accountName = response.user.name;
            this.objHandlerProperty(response.user, 'name');
        }
        const userAccName = response.user.accountName.toLowerCase();
        const { accountType } = response.user;
        if (response.user.hasOwnProperty(this.STRING_GROUPS) && response.user.hasOwnProperty(this.STRING_MEMBERS)) {
            response[this.STRING_GROUPS] = groups;
            response[this.STRING_MEMBERS] = members;
            if (status.toLowerCase() === 'new') {
                this.appStateService.setSelectedAccountInformation(response);
            }else if (status.toLocaleLowerCase() === 'current') {
                this.appStateService.setAccountInformation(userAccName, this.STRING_USER, response.user);
                this.appStateService.setAccountInformation(userAccName, this.STRING_GROUPS, response);
                this.appStateService.setAccountInformation(userAccName, this.STRING_MEMBERS, response);
            }
        }
        this.nextActionDispatcher(USER_MEMBERSHIP_RESULT, response);
    }

    reqAccountService(actions, nextActionType?, type?): void {
        const compContext = this;
        let accountName: string = actions.payload.query;
        const classify: string = actions.payload.classify;
        const url: string = actions.payload.url;
        if (actions.reqType === this.STRING_POST) {
            switch (classify) {
                case 'ACC_SEARCH' :
                    this.appStateService.showLoader(true);
                    this.http.post(url, {keyword: accountName})
                    .map((res: any) => {
                        return res.json();
                    })
                    .catch(this.ErrorHandler.bind(this))
                    .subscribe((resp) => {
                        this.appStateService.showLoader(false);
                        if (resp.model !== undefined) {
                            const response = resp.model;
                            response.accountName = ('name' in response) ? response.name : response.accountName;
                            accountName = response.accountName.toLowerCase();
                            (resp.model.accountId > 0) ?
                                // handles account with new status
                                this.onAccountDetailsAccountResponse(type, accountName, response) :
                                // handles account with current status
                                this.onNewAccountResponseHandler(actions, type, accountName, response);
                        }
                    });
                    break;
                case 'ACC_SEARCH_ROLE' :
                    this.appStateService.showLoader(true);
                    this.http.post(url, {keyword: accountName}).map((res: any) => {
                        return res.json();
                    })
                    .catch(this.ErrorHandler.bind(this))
                    .subscribe((resp) => {
                        this.appStateService.showLoader(false);
                        if (resp.model !== undefined && actions.payload.query !== undefined) {
                            this.appStateService.setAccountInformation(accountName.toLowerCase(), type, {[type]: resp.model}); // newly changed...
                            this.onAccountDetailsTabResponse(nextActionType, actions, type, accountName, resp.model);
                        }
                    });
                    break;
                case 'ACC_SEARCH_AUTHORIZATION' :
                    this.appStateService.showLoader(true);
                    this.http.post(url, {keyword: accountName}).map((res: any) => {
                        return res.json();
                    })
                    .catch(this.ErrorHandler.bind(this))
                    .subscribe((resp) => {
                        this.appStateService.showLoader(false);
                        if (resp.model !== undefined && actions.payload.query !== undefined) {
                            this.appStateService.setAccountInformation(accountName.toLowerCase(), type, {[type]: resp.model}); // newly changed...
                            this.onAccountDetailsTabResponse(nextActionType, actions, type, accountName, resp.model);
                        }
                    });
                    break;
                case 'ACC_SEARCH_IMPERSONATION' :
                    this.appStateService.showLoader(true);
                    this.http.post(url, {keyword: accountName}).map((res: any) => {
                        return res.json();
                    })
                    .catch(this.ErrorHandler.bind(this))
                    .subscribe((resp) => {
                        this.appStateService.showLoader(false);
                        if (resp.model !== undefined && actions.payload.query !== undefined) {
                            this.appStateService.setAccountInformation(accountName.toLowerCase(), type, {[type]: resp.model}); // newly changed...
                            this.onAccountDetailsTabResponse(nextActionType, actions, type, accountName, resp.model);
                        }
                    });
                    break;
                case 'ACC_SEARCH_MEMBERSHIP' :
                    this.appStateService.showLoader(true);
                    this.http.post(url, {keyword: accountName}).map((res: any) => {
                        return res.json();
                    })
                    .catch(this.ErrorHandler.bind(this))
                    .subscribe((resp) => {
                        this.appStateService.showLoader(false);
                        if (resp.model) {
                            this.onMemberShipResponse(resp);
                        } else if (resp.errorCode === 200) {
                            const dialogPopUp = compContext._dialogService.open({
                                title: 'Information',
                                content: resp.message || 'Membership is up to date.',
                                actions: [
                                    {text: 'Okay'}
                                ]
                            });
                        } else if ((!resp.errorMessage) && (!resp.model)) {
                            const retrieveInformation = this.appStateService.getAcccountInformation(accountName.toLowerCase());
                            resp.model = retrieveInformation.user;
                            resp.model['groups'] = retrieveInformation.groups;
                            resp.model['members'] = retrieveInformation.members;
                            resp.model.isActive = false;
                            this.onMemberShipResponse(resp);
                            this.appStateService.enableSaveAllBtn(true);
                        }
                    });
                    break;
                default :
                    break;
            }
        }
    }

    ErrorHandler(error: any, caught): void {
        let errorReqURL: string;
        this.appStateService.showLoader(false);
        const errorURL = error._body.currentTarget.__zone_symbol__xhrURL;
        if ((errorURL.indexOf('members') > -1) === true && ((errorURL.indexOf('groups') > -1) === true)) {
            errorReqURL = 'members/groups failed!';
        }  else if ((errorURL.indexOf('Roles') > -1) === true) {
            errorReqURL = 'Roles failed!';
        } else if ((errorURL.indexOf('Authorization') > -1) === true) {
            errorReqURL = 'Authorization failed!';
        } else if ((errorURL.indexOf('Impersonation') > -1) === true) {
            errorReqURL = 'Impersonation failed!';
        }
        const errorMsg = `An error occured at Account Details: requested service for ${errorReqURL}`;
        const nAction = {
            type: NOTIFICATION,
            payload: {msg: `${errorMsg}`}
        };
        this.appStateService.dispatch(nAction);
        const errAction = getErrorAction(error, 'AccounDetails', 'account-details.service.ts');
        this.appStateService.dispatch(errAction);
    }

    objHandlerProperty(response, property): any {
        delete (response[property]);
        return response;
    }

    nextActionDispatcher(nextActionType, resp): void {
        const action = {
            type: nextActionType,
            payload: {
                data: resp
            }
        };
        this.appStateService.dispatch(action);
    }

    membershipAccount(actions): void {
        this.reqAccountService(actions);
    }

    searchAccount(actions): void {
        const accountInfo = this.appStateService.getAccountTabDetails();
        const accountName = (actions.payload.query).toLowerCase();
        if (accountInfo.accountDetailsMap[accountName] !== undefined) {
            // checks already account is stored, fetches if exist, along storing it in selectedAccount for later use...
            // accountInfo.selectedAccount.user = accountInfo.accountDetailsMap[accountName].user; newly changed testing...
            accountInfo.selectedAccount = accountInfo.accountDetailsMap[accountName];
            const userResp = accountInfo.selectedAccount.user;
            this.nextActionDispatcher(USER_SEARCH_RESULT, userResp);
        }else {
            this.appStateService.resetSelectedAccountInformation();
            this.reqAccountService(actions, USER_SEARCH_RESULT, this.STRING_USER);
        }
    }

    groupAccount(actions): void {
        const accountInfo = this.appStateService.getAccountTabDetails();
        const accountName = (actions.payload.query).toLowerCase();
        //Added an undefined check. Issue was after data for person account type was saved,
        //there was a run time error as we are resetting accountDetailsMap after save
        if (accountName in accountInfo.accountDetailsMap && accountInfo.accountDetailsMap[accountName].groups !== undefined) {
            accountInfo.selectedAccount.groups = accountInfo.accountDetailsMap[accountName].groups;
            const groupResp = {groups: accountInfo.selectedAccount.groups};
            this.nextActionDispatcher(USER_GROUPS_RESULT, groupResp);
        }else {
            this.reqAccountService(actions, USER_GROUPS_RESULT, this.STRING_GROUPS);
        }
    }

    memberAccount(actions): void {
        const accountInfo = this.appStateService.getAccountTabDetails();
        const accountName = (actions.payload.query).toLowerCase();
        if (accountName in accountInfo.accountDetailsMap && accountInfo.accountDetailsMap[accountName].members !== undefined) {
            accountInfo.selectedAccount.members = accountInfo.accountDetailsMap[accountName].members;
            const memberResp = {members: accountInfo.selectedAccount.members};
            this.nextActionDispatcher(USER_MEMBERS_RESULT, memberResp);
        }else {
            this.reqAccountService(actions, USER_MEMBERS_RESULT, this.STRING_MEMBERS);
        }
    }

    roleAccount(actions): void {
        const accountInfo = this.appStateService.getAccountTabDetails();
        const accountName = (actions.payload.query).toLowerCase();
        if (accountInfo.accountDetailsMap[accountName].roles !== undefined) {
            accountInfo.selectedAccount.roles = accountInfo.accountDetailsMap[accountName].roles;
            const roleResp = {roles: accountInfo.selectedAccount.roles};
            this.nextActionDispatcher(USER_ROLES_RESULT, roleResp);
        } else {
            this.reqAccountService(actions, USER_ROLES_RESULT, this.STRING_ROLES);
        }
    }

    impersonationAccount(actions): void {
        const accountInfo = this.appStateService.getAccountTabDetails();
        const accountName = (actions.payload.query).toLowerCase();
        if (accountInfo.accountDetailsMap[accountName].impersonations !== undefined) {
            accountInfo.selectedAccount.impersonations = accountInfo.accountDetailsMap[accountName].impersonations;
            const impersonationResp = {impersonations: accountInfo.selectedAccount.impersonations};
            this.nextActionDispatcher(USER_IMPERSONATIONS_RESULT, impersonationResp);
        } else {
            // this.reqRespService(actions, USER_IMPERSONATIONS_RESULT, this.STRING_IMPERSONATIONS);
            this.reqAccountService(actions, USER_IMPERSONATIONS_RESULT, this.STRING_IMPERSONATIONS);
        }
    }

    authorizationAccount(actions): void {
        const accountInfo = this.appStateService.getAccountTabDetails();
        const accountName = (actions.payload.query).toLowerCase();
        if (accountInfo.accountDetailsMap[accountName].application !== undefined) {
            accountInfo.selectedAccount.application = accountInfo.accountDetailsMap[accountName].application;
            const applicationResp = {application: accountInfo.selectedAccount.application};
            this.nextActionDispatcher(USER_AUTHORIZATION_RESULT, applicationResp);
        } else {
            // this.reqRespService(actions, USER_AUTHORIZATION_RESULT, this.STRING_AUTHORIZATIONS);
            this.reqAccountService(actions, USER_AUTHORIZATION_RESULT, this.STRING_AUTHORIZATIONS);
        }
    }

    fetchAuthorizationChildren(accountName, nodeDataItem): void {
        const url = USERAUTHORIZATIONS_RESOURCES_URL;
        const accName = accountName;
        const appID = nodeDataItem.applicationId;
        const resourceID = nodeDataItem.resourceId;
        this.http.post(url, {
            accountName: accName,
            applicationId: appID,
            parentResourceMappingId: resourceID
        })
        .map((resp) => {
            return resp.json();
        })
        .catch(this.ErrorHandler.bind(this))
        .subscribe((resp) => {
            if (resp.model) {
                const response = resp.model;
                this.nextActionDispatcher(USER_AUTHORIZATION_CHILD_RESULT, response);
            }
        });
    }

    userGridSearch(actions): void {
    }

    addAccountADBGroup(data): void {
        //alert('Added Account');
    }

    clearFetchedData(): void {
        const actions = {
            payload: {
                data: []
            }
        };
        this.nextActionDispatcher(USER_RESULT_DATA_CLEAR, []);
    }

    setStateMembersSearched(toggleBool: boolean) {
        this._membersSearched = toggleBool;
    }

    setStateGroupsSearched(toggleBool: boolean) {
        this._groupsSearched = toggleBool;
    }

    getStateMembersSearched() {
        return this._membersSearched;
    }

    getStateGroupsSearched() {
        return this._groupsSearched;
    }
}
