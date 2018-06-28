import { Injectable, EventEmitter } from '@angular/core';
import { initialAppState, ADDED, MODIFIED, DELETED, ROLE_IMPERSONATOR, ROLE_ADMIN } from "../utils/constants";
import { LOADER, ALLOW_SAVE, ADD_NEW_APP_ENABLE, ACCOUNT_STATE_CHANGED } from "./actions";

@Injectable()
export class AppStateService {

  private state: any;
  private dispatcherMap: Object = {};
  private count = 0;
  private deleteStatus = false;

  constructor() {
    this.state = initialAppState;
  }

  dispatch(action) {
    if (action.type && this.dispatcherMap.hasOwnProperty(action.type)) {
      let subject = this.dispatcherMap[action.type];
      subject.emit(action);
    }
  }

  subscribe(actionType, nextFn, errFn = null) {
    if (!this.dispatcherMap.hasOwnProperty(actionType)) {
      this.dispatcherMap[actionType] = new EventEmitter();
    }

    if (!errFn)
      errFn = (err) => { console.log(`Error handled in AppStateService: ${err}`) }

    let subscription = this.dispatcherMap[actionType].subscribe(nextFn, errFn);
    return subscription;
  }

  showLoader(value) {
    this.dispatch({
      type: LOADER,
      payload: {
        show: value
      }
    });
  }

  enableSaveAllBtn(enable) {
    let action = {
      type: ALLOW_SAVE,
      payload: {
        enableSave: enable
      }
    }

    this.dispatch(action);
  }

  enableAddAppBtn(enable){
    let action = {
      type: ADD_NEW_APP_ENABLE,
      payload: {
        enableNewApp: enable
      }
    }

    this.dispatch(action);
  }

  set addAppBtnState(value){
    this.state.newAppState = value;
  }

  get addAppBtnState(){
    return this.state.newAppState;
  }

  set userInfo(value) {
    if (value) {
      this.state.userInfo = value;
    }
  }

  get userInfo() {
    return this.state.userInfo;
  }

  get isAdminRole() {
    return this.userInfo.role.toLowerCase() == ROLE_ADMIN;
  }

  get isImpersonatorRole() {
    return this.userInfo.role.toLowerCase() == ROLE_IMPERSONATOR;
  }

  get accountsTree(): Array<any> {
    return this.state.accountsTree;
  }

  public getAccountTabDetails() {
      return this.state.accountPanel;
  }

  public getAcccountInformation(accountName) {
    return this.state.accountPanel.accountDetailsMap[accountName.toLowerCase()];
  }

  get accountDetailsMap() {
    return this.state.accountPanel.accountDetailsMap;
  }

  get impersonationObject() {
    return this.state.impersonation;
  }

  resetAccountDetailsMap() {
    this.state.accountPanel.accountDetailsMap = {}
  }

  public resetSelectedAccountInformation() {
    this.state.accountPanel.selectedAccount = {};
  }

  public getSelectedAccountInformation() {
    return this.state.accountPanel.selectedAccount;
  }

  public setSelectedAccountInformation(userAccountInfo: any): void {
    this.state.accountPanel.selectedAccount = userAccountInfo;
  }

  public updateAccountSearch(searched: any) {  //user form is searched in accounttab or not...
    this.state.accountPanel.searched = searched;
  }
  public resetSelectedAccount() {
    this.state.accountPanel.selectedAccount = {};
  }

  public setSelectedAccountTabDetails(cateType, resp) { //reset/flush selected Account on cancel btn
    this.state.accountPanel.selectedAccount[cateType] = resp;
  }

  addNewAccount(account) {
    if (!account) {
      return;
    }

    this.state.accountPanel.newAccounts.push(account);
  }

  getNewAccounts() {
    return this.state.accountPanel.newAccounts;
  }

  clearNewAccounts() {
    this.state.accountPanel.newAccounts = [];
  }

  addAuthAccount(dataItem, state) {
    if (!dataItem && !state) {
      return;
    }

    let authAccounts = this.state.appResourceTab.authAccounts;
    let ac = authAccounts.find(element => {
      /**
       * If the same account is added to a node and then removed,
       * then we remove that account and dont save as it indicates no operation happened
       */
      let remove = element.applicationId == dataItem.applicationId && element.accountId == dataItem.accountId;
      remove = remove && element.parentResourceMappingid == dataItem.parentResourceMappingid;
      if (state == ADDED) remove = remove && element.state == DELETED;
      if (state == DELETED && element.state != MODIFIED) remove = remove && element.state == ADDED;

      return remove;
    });

    let resetExclude = false, updateState = false;
    if(ac && ac.authorizationId > 0) {
      //If an excluded account was deleted and the same account was added again
      resetExclude = ac.state == DELETED && ac.isExclude;
      //If account is excluded first and then deleted
      updateState = ac.state == MODIFIED && state == DELETED;
    }

    if(resetExclude) {
      ac.isExclude =  "isExclude" in dataItem ? dataItem.isExclude : false,
      ac.state = MODIFIED;
      //Since we are modifying, return and do not add it to authAccounts again
      return;
    }

    //This handles the scenario where user excluded the account first and then deleted it
    if(updateState) {
      ac.isExclude = false;//reset as it is deleted
      ac.state = DELETED;
      return;
    }

    if (ac) {
      authAccounts.splice(authAccounts.indexOf(ac), 1);
      let account = {
        accountId: dataItem.accountId,
        parentResourceMappingid: dataItem.parentResourceMappingid,
        state: state
      }
      this.dispatch({
        type: ACCOUNT_STATE_CHANGED,
        account: account
      })
      return;
    }

    let account = {
      authorizationId: state == ADDED ? 0 : dataItem.authorizationId,
      accountId: dataItem.accountId,
      accountName: dataItem.accountName,
      parentResourceMappingid: dataItem.parentResourceMappingid,
      applicationId: dataItem.applicationId,
      accountType: dataItem.accountType,
      isExclude: dataItem.isExclude,
      state: state
    }

    this.dispatch({
      type: ACCOUNT_STATE_CHANGED,
      account: account
    });
    
    authAccounts.push(account);
  }

  updateAuthAccount(dataItem) {
    if (!dataItem) {
      return;
    }

    let authAccounts = this.state.appResourceTab.authAccounts;
    let parentNode = dataItem.parentNode();
    let originalAuths = parentNode._childrenOptions.data.items;
    let originalAcc = null;

    let ac = authAccounts.find(element => {
      let contains = element.applicationId == dataItem.applicationId && element.accountId == dataItem.accountId;
      contains = contains && element.parentResourceMappingid == dataItem.parentResourceMappingid;
      return contains;
    });

    if(originalAuths) {
      originalAcc = originalAuths.find(item => item.accountId == dataItem.accountId);
    }

    if(ac) {//If already present, update
      ac.isExclude = dataItem.isExclude;
    }
    //This handles two usecases
    //1) Excluding existing authorization
    //2) If authorization was already present earlier then removed and then added and excluded
    else if(originalAcc) {
      let account = this.dataItemToNewAuth(originalAcc);
      account.authorizationId = originalAcc.authorizationId;
      account.isExclude = dataItem.isExclude;
      account.state = MODIFIED;

      /* authAccounts.push({
        authorizationId: originalAcc.authorizationId,
        isExclude: dataItem.isExclude,
        accountId: originalAcc.accountId,
        accountName: originalAcc.accountName,
        parentResourceMappingid: originalAcc.parentResourceMappingid,
        applicationId: originalAcc.applicationId,
        accountType: originalAcc.accountType,
        state: MODIFIED
      }); */
      authAccounts.push(account);
    }
    //Need to remove this else as it wont be executed because of new else if above
    else {//Add
      let account = this.dataItemToNewAuth(dataItem);
      account.authorizationId = dataItem.authorizationId > 0 ? dataItem.authorizationId : 0;
      account.state = dataItem.authorizationId > 0 ? MODIFIED : ADDED;
      /* {
        authorizationId: dataItem.authorizationId > 0 ? dataItem.authorizationId : 0,
        accountId: dataItem.accountId,
        accountName: dataItem.accountName,
        parentResourceMappingid: dataItem.parentResourceMappingid,
        applicationId: dataItem.applicationId,
        accountType: dataItem.accountType,
        isExclude: dataItem.isExclude,
        state: dataItem.authorizationId > 0 ? MODIFIED : ADDED
      } */

      authAccounts.push(account);
    }
  }

  dataItemToNewAuth(dataItem) {
    return {
      authorizationId: 0,
      accountId: dataItem.accountId,
      accountName: dataItem.accountName,
      parentResourceMappingid: dataItem.parentResourceMappingid,
      applicationId: dataItem.applicationId,
      accountType: dataItem.accountType,
      isExclude: dataItem.isExclude,
      state: ADDED
    }
  }

  get authAccounts() {
    return this.state.appResourceTab.authAccounts;
  }

  resetAuthAccounts() {
    this.state.appResourceTab.authAccounts = [];
  }

  addResourceType(resourceType) {
    if (!resourceType) {
      return;
    }
    if (resourceType.state == "Added") {
      let addedStateExists = this.state.appResourceTab.appResourceTypes.findIndex(item => item.state == "Added" && item.resourceTypeId == resourceType.resourceTypeId);
      let deletedStateExists = this.state.appResourceTab.appResourceTypes.findIndex(item => item.state == "Deleted" && resourceType.resourceTypeId < 0 && item.name == resourceType.name)
      if (addedStateExists > -1) {
        this.state.appResourceTab.appResourceTypes.splice(addedStateExists, 1);
        if(deletedStateExists > -1){
           this.state.appResourceTab.appResourceTypes[deletedStateExists].state = "Modified"
           this.state.appResourceTab.appResourceTypes[deletedStateExists].imageFile = resourceType.imageFile;        
        } else {
          this.state.appResourceTab.appResourceTypes.push(resourceType);
        }
      } else {
        if(deletedStateExists > -1){
          this.state.appResourceTab.appResourceTypes[deletedStateExists].state = "Modified";
          this.state.appResourceTab.appResourceTypes[deletedStateExists].imageFile = resourceType.imageFile;         
        } else {
          this.state.appResourceTab.appResourceTypes.push(resourceType);
        }
      }
    } else if (resourceType.state == "Modified") {
      let modifiedStateExists = this.state.appResourceTab.appResourceTypes.findIndex(item => item.state == "Modified" && item.resourceTypeId == resourceType.resourceTypeId);
      let deletedStateExists = this.state.appResourceTab.appResourceTypes.findIndex(item => item.state == "Deleted" && resourceType.resourceTypeId < 0 &&  item.name == resourceType.name)
      if (modifiedStateExists > -1) {
        this.state.appResourceTab.appResourceTypes.splice(modifiedStateExists, 1);
        this.state.appResourceTab.appResourceTypes.push(resourceType);
      } else {
        this.state.appResourceTab.appResourceTypes.push(resourceType);
      }
    } else {
      let addedStateExists = this.state.appResourceTab.appResourceTypes.findIndex(item => item.state == "Added" && item.resourceTypeId == resourceType.resourceTypeId);
      let exists = this.state.appResourceTab.appResourceTypes.findIndex(item => item.resourceTypeId == resourceType.resourceTypeId);
      if (exists > -1) {
        if (addedStateExists > -1) {
          this.state.appResourceTab.appResourceTypes.splice(addedStateExists, 1);
        } else {
          this.state.appResourceTab.appResourceTypes.splice(exists, 1);
          this.state.appResourceTab.appResourceTypes.push(resourceType);
        }
      } else {
        this.state.appResourceTab.appResourceTypes.push(resourceType);
      }
    }
  }

  get resourceTypeData() {
    return this.state.appResourceTab.appResourceTypes;
  }

  clearResourceType() {
    this.state.appResourceTab.appResourceTypes = [];
  }

  addResources(resources) {
    if (!resources) {
      return;
    }

    if (resources.state == "Added") {
      let addedStateExists = this.state.appResourceTab.appResourcesData.findIndex(item => item.state == "Added" && item.resourceId == resources.resourceId);
      let deletedStateExists = this.state.appResourceTab.appResourcesData.findIndex(item => item.state == "Deleted"
       && resources.resourceId < 0 && item.imageFile == resources.imageFile && item.name == resources.name)
      if (addedStateExists > -1) {
        this.state.appResourceTab.appResourcesData.splice(addedStateExists, 1);
        if(deletedStateExists > -1){
           this.state.appResourceTab.appResourcesData[deletedStateExists].state = "Modified"
           this.state.appResourceTab.appResourcesData[deletedStateExists].description = resources.description
        } else {
          this.state.appResourceTab.appResourcesData.push(resources);
        }        
      } else {
        if(deletedStateExists > -1){
           this.state.appResourceTab.appResourcesData[deletedStateExists].state = "Modified"
           this.state.appResourceTab.appResourcesData[deletedStateExists].description = resources.description
        } else {
          this.state.appResourceTab.appResourcesData.push(resources);
        }
      }
    } else if (resources.state == "Modified") {
      let modifiedStateExists = this.state.appResourceTab.appResourcesData.findIndex(item => item.state == "Modified" && item.resourceId == resources.resourceId);
      if (modifiedStateExists > -1) {
        this.state.appResourceTab.appResourcesData.splice(modifiedStateExists, 1);
        this.state.appResourceTab.appResourcesData.push(resources);
      } else {
        this.state.appResourceTab.appResourcesData.push(resources);
      }
    } else {
      let addedStateExists = this.state.appResourceTab.appResourcesData.findIndex(item => item.state == "Added" && item.resourceId == resources.resourceId);
      let exists = this.state.appResourceTab.appResourcesData.findIndex(item => item.resourceId == resources.resourceId);
      if (exists > -1) {
        if (addedStateExists > -1) {
          this.state.appResourceTab.appResourcesData.splice(addedStateExists, 1);
        } else {
          this.state.appResourceTab.appResourcesData.splice(exists, 1);
          this.state.appResourceTab.appResourcesData.push(resources);
        }
      } else {
        this.state.appResourceTab.appResourcesData.push(resources);
      }
    }
  }

  get resourcesData() {
    return this.state.appResourceTab.appResourcesData;
  }

  clearResources() {
    this.state.appResourceTab.appResourcesData = [];
  }

  addResourceTypeMapping(mapping) {
    if (!mapping) {
      return;
    }   
    this.state.appResourceTab.appResourceTypeMap = mapping.slice();    
  }

  get ResourceTypeMapping() {
    return this.state.appResourceTab.appResourceTypeMap;
  }

  clearResourceTypeMapping() {
    this.state.appResourceTab.appResourceTypeMap = [];
  }

  addAppResources(applicationResource) {
    if (!applicationResource) {
      return;
    }
    let duplicates = this.state.appResourceTab.applicationResources.findIndex(item => ((item.resourceID == applicationResource.resourceID) && (item.parentResourceMappingid == applicationResource.parentResourceMappingid)))
    if (duplicates > -1) {
      this.state.appResourceTab.applicationResources.splice(duplicates, 1)
    } else {
      this.state.appResourceTab.applicationResources.push(applicationResource);
    }
  }

  get appResourcesData() {
    return this.state.appResourceTab.applicationResources;
  }

  clearAppResources() {
    this.state.appResourceTab.applicationResources = [];
  }


  public setAccountInformation(accountName, cateType, resp) {
    if (cateType === 'user') {
      this.state.accountPanel.accountDetailsMap[accountName] = {};
      this.state.accountPanel.accountDetailsMap[accountName][cateType] = resp;
      this.state.accountPanel.selectedAccount[cateType] = resp;
    } else {
      this.state.accountPanel.accountDetailsMap[accountName][cateType] = resp[cateType];
      this.state.accountPanel.selectedAccount[cateType] = resp[cateType];
    }
  }

  public setResourceLocatorPath(path: string): void {
    this.state.accountPanel.routedLink = path;
  }

  public getResourceLocatorPath() {
    return this.state.accountPanel.routedLink;
  }

  getGroupChildren(accountId: any): Array<any> {
    var map = this.state.groupChildrenMap;
    var result = null;

    if (accountId && map.hasOwnProperty(accountId)) {
      result = map[accountId];
    }

    return result;
  }

  setGroupChidren(accountId, children) {
    var map = this.state.groupChildrenMap;

    if (accountId && children) {
      map[accountId] = children;
    }
  }

  resetGroupChildrenMap() {
    this.state.groupChildrenMap = {};
  }

  set appResources(value) {
    this.state.appResourceTab.appResources = value;
  }

  get appResources() {
    return this.state.appResourceTab.appResources;
  }

  set resources(value) {
    this.state.appResourceTab.resources = value;
  }

  get resources() {
    return this.state.appResourceTab.resources;
  }

  set resourceTypes(value) {
    this.state.appResourceTab.resourceTypes = value;
  }

  get resourceTypes() {
    return this.state.appResourceTab.resourceTypes;
  }

  set resourceTypeTargets(value) {
    this.state.appResourceTab.resourceTypeTargets = value;
  }

  get resourceTypeTargets() {
    return this.state.appResourceTab.resourceTypeTargets;
  }

  cacheAppDetails(appId, details) {
    if (!appId) {
      return;
    }

    this.state.appResourceTab.appResourceMap[appId] = details;
  }

  getAppDetails(appId) {
    let result = null;

    if (appId in this.state.appResourceTab.appResourceMap) {
      result = this.state.appResourceTab.appResourceMap[appId];
    }

    return result;
  }

  get counter() {
    return --this.count;
  }

  set applicationId(appId) {
    this.state.applicationId = appId
  }

  get applicationId() {
    return this.state.applicationId;
  }

  get parentGroupMap() {
    return this.state.appResourceTab.parentGroupMap;
  }
}