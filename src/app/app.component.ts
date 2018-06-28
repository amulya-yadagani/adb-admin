import { Component, OnInit, AfterViewInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { jQuery as $ } from "@progress/kendo-ui/js/kendo.core.js";
import "@progress/kendo-ui/js/kendo.splitter.js";

import { AppService } from "./app.service";
import { AppStateService } from "./state/app-state.service";
import { AccountService } from "./accounts/accounts.service";
import { AppUsersService } from "./app-users/app-users.service"
import { AppResourcesService } from "./app-resources/app-resources.service";
import { NotificationService } from "./utils/notification.service";
import { LoaderService } from "./utils/loader.service";
import { AccountDetailsService } from "./account-details/account-details.service";
import { ImpersonationService } from "./impersonation/impersonation.service";

import { ADD_NEW_APP, ALLOW_SAVE, SAVE_DATA, SAVE_DATA_RESULT, ACCOUNT_SELECT, AFTER_SAVE_ALL_RESET, ADD_NEW_APP_ENABLE } from "./state/actions";
import { USERACCOUNT_URL, ORIGINAL, ADDED, MODIFIED, ROLE_IMPERSONATOR } from "./utils/constants";
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';

//Expose jquery as kendo ui library uses it
window['jQuery'] = $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  accountPanelAccess = true;
  user = null;
  enableSave:boolean = false;
  enableNewApp: boolean = true;
  saveSub = null;
  name = "";
  description = "";
  validator;
  dialog;
  tabs = [
    {
      link: "/resources",
      title: "Application Resources"
    },
    {
      link: "/accountDetails",
      title: "Account Details"
    },
    {
      link: "/impersonation",
      title: "Impersonation"
    },
    {
      link: "/users",
      title: "Application Users"
    },
    {
      link: "/auditLog",
      title: "Audit Log"
    }
  ]
  // We need an instance for the services to be created.
  // So the AppStateService works as expected when requesting data through services that make http calls
  constructor(private router: Router,
              private appStateService: AppStateService,
              private appService: AppService,
              private as: AccountService,
              private au: AppUsersService,
              private ns: NotificationService,
              private ars: AppResourcesService,
              private ls: LoaderService,
              private is: ImpersonationService,
              private ads: AccountDetailsService,
              private dialogService: DialogService) {
                appStateService.subscribe(ALLOW_SAVE, this.toggleSaveBtn.bind(this));
                appStateService.subscribe(SAVE_DATA_RESULT, this.onSaveData.bind(this));
                appStateService.subscribe(ADD_NEW_APP_ENABLE, this.toggleNewAppBtn.bind(this));
                //we get the user info after login from main.ts
                this.user = window["getUserInfo"]();
                this.appStateService.userInfo = this.user;

                this.accountPanelAccess = !this.appStateService.isImpersonatorRole;

                //For Impersonation role, hide Account Panel and App Resources tab
                if(!this.accountPanelAccess) {
                  let config = this.router.config;
                  config.shift();
                  let catchAllConfig = config[config.length-1];
                  //Change the default url to accountDetails
                  catchAllConfig.redirectTo = "accountDetails";

                  this.router.resetConfig(config);

                  //Remove App Resources tab/link
                  this.tabs.shift();
                }
              }

  ngOnInit() {
    $("li#newApp").removeClass("k-state-disabled")
    let acPanelConfig = {
      id: "accounts",
      collapsed: !this.accountPanelAccess,
      collapsible: this.accountPanelAccess,
      size: 270,
      scrollable: false,
      min: 270
    };

    let tabsConfig:any = {
      id: "tabs",
      scrollable: false
    };

    //Update size in tabsConfig if the account panel is not allowed access
    if(!this.accountPanelAccess) {
      tabsConfig.size = window.innerWidth;
      tabsConfig.min = window.innerWidth;
    }

    let dynamibTabConfig = {
      id : "resource-manager",
      collapsed: true,
      scrollable: false,
      collapsedSize: 5
    };

    $("#divided-box").kendoSplitter({
        panes: [
          acPanelConfig,
          tabsConfig,
          dynamibTabConfig
        ]
    });

    if(!this.appStateService.isImpersonatorRole) {
      this.initActionsMenu();
    }
  }

  ngAfterViewInit() {
    //Initial render does not set the size correctly. So again setting it after view init
    $("#divided-box").data("kendoSplitter").size(".k-pane:first","270px");
  }

  private initActionsMenu() {
    const self = this;
    const $actionsBtn = $("#actions-btn");
    const $actionsMenu = $("#actions");
    const $li = $("#actions-item");

    $actionsBtn.on("mouseenter",(e) => {
      if(e.buttons == 1) {
        //If left mouse button is down, i.e when drag is in process, do not show the menu
        return;
      }

      self.toggleActionsMenu(true);
    });

    $actionsMenu.on("click","li", (e) => {
      self.toggleActionsMenu(false);
    });

    $li.on("mouseleave", (e) => {
      self.toggleActionsMenu(false);
    });
  }

  toggleActionsMenu(show) {
    const $actionsMenu = $("#actions");
    $actionsMenu.css("display", show ? "block" : "none");
  }

  toggleSaveBtn(action) {
    let { enableSave } = action.payload;
    this.enableSave = enableSave;
  }

  toggleNewAppBtn(action) {
    let { enableNewApp } = action.payload;
    if(!enableNewApp){
      $("li#newApp").addClass("k-state-disabled")
    } else {
      $("li#newApp").removeClass("k-state-disabled")
    }
  }

  onSaveAll() {

    let body = {
      accountDetailList: this.prepareAccountDetails(),
      applicationTree: {
        resourceTypes: this.prepareResourceTypeData(),
        resourceTypeTargets: this.prepareResourceMappingData(),
        resources: this.prepareResourcesData(),
        applicationResources: this.prepareAppResourcesData(),
        authorizedAccounts: this.prepareAuthorizedAcData()
      },
      impersonationDetailList: this.prepareImpersonationData()
    }

    console.log(JSON.stringify(body))

    let saveAction = {
      type: SAVE_DATA,
      payload: body
    }

    this.appStateService.dispatch(saveAction);
    //this.appStateService.enableAddAppBtn(false);
  }

  prepareImpersonationData() {
    let impersonationSaveBatch = this.appStateService.impersonationObject.batch;
    let applicationIds: any[] = [];
    let impersonationSaveList = [];

    for(let imperseKey in impersonationSaveBatch) {
      let saveData = impersonationSaveBatch[imperseKey]["saveData"];
      if(saveData.length) {
        for(let sd of saveData) {
          impersonationSaveList.push(sd);
        }
      }
    }

    return impersonationSaveList;

  }

  prepareAccountDetails() {
    let accountDetailsMap = this.appStateService.accountDetailsMap;
    let accountDetailList = [];

    for(let accountName in accountDetailsMap) {
      let { user, members, deletedMembers } = accountDetailsMap[accountName];
      let ac = null;

      if(user.state == ADDED || user.state == MODIFIED || user.refreshMembershipClicked) {
        ac = {
          accountId: user.accountId,
          name: user.accountName,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          company: user.company,
          department: user.department,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
          accountType: user.accountType,
          status: user.status,
          state: user.state
        }

        //Fix for issue where after refreshing membership, the data was not saved
        if(user.refreshMembershipClicked) {
          ac.state = MODIFIED
        }

        if(members) {
          let state = null;

          /**
           * if refreshMembershipClicked is true for AD account,
           * then explicitely add members(if any) with status as Current
           */
          if(user.refreshMembershipClicked && user.accountType == "AD") {
            members = members.filter(item => item.status == "Current");
            state = ADDED;
          }
          else {
            members = members.filter(item => item.state != ORIGINAL);
          }

          ac.members = this.prepareMembersData(members,state);
        }

        if(deletedMembers) {
          ac.members = ac.members || [];
          deletedMembers = this.prepareMembersData(deletedMembers,null);

          if(deletedMembers) {
            ac.members = ac.members.concat(deletedMembers)
          }
        }

        accountDetailList.push(ac);
      }
    }

    return accountDetailList;
  }
  //New AD account, we pass state as Added for api to link existing accounts with AD group
  prepareMembersData(membersData,state) {
    let members = null;

    if(membersData && membersData.length) {
      members = membersData.map(item => {
        return {
          accountId: item.accountId,
          name: item.name,
          accountType: item.accountType,
          state: state ? state : item.state,
          status: item.status
        }
      });
    }

    return members;
  }

  prepareAuthorizedAcData() {
    let authAccounts = this.appStateService.authAccounts;

    /* let result = authAccounts.map(ac => {
      return {
        authorizationId: ac.authorizationId,
        accountId: ac.accountId,
        accountName:ac.accountName,
        parentResourceMappingid: ac.parentResourceMappingid,
        applicationId: ac.applicationId,
        accountType: ac.accountType,
        isExclude: false,//for now
        state: ac.state
      }
    }); */
    return authAccounts;
  }

  prepareResourceTypeData() {
    let resTypeData = this.appStateService.resourceTypeData;

    let result = resTypeData.map(rt => {
      return {
        resourceTypeId: rt.resourceTypeId,
        applicationId: rt.applicationId,
        name: rt.name,
        imageFile: rt.imageFile,
        state: rt.state
      }
    })

    return result;
  }

  prepareResourcesData(){
    let resourcesData = this.appStateService.resourcesData;
    let result = resourcesData.map(r => {
      return {
        name: r.name,
        resourceId: r.resourceId,
        description: r.description,
        resourceTypeId: r.resourceTypeId,
        applicationId: r.applicationId,
        resourceTypeName: r.resourceTypeName,
        imageFile: r.imageFile,
        state: r.state
      }
    });

    return result;
  }

  prepareResourceMappingData(){
    let resourceMap = this.appStateService.ResourceTypeMapping;
    return resourceMap;
  }

  prepareAppResourcesData(){
    let appResources = this.appStateService.appResourcesData;
    return appResources;
  }

  onSaveData(action) {
    let currentUrl = this.router["currentRouterState"].snapshot.url;

    if(action.payload.success) {

      this.appStateService.resetAccountDetailsMap();
      this.appStateService.resetAuthAccounts();
      this.appStateService.clearNewAccounts();

      if(currentUrl.search("accountDetails") != -1) {
        let accountName = this.appStateService.getSelectedAccountInformation().user.accountName;

        //Get data for selected account
        this.appStateService.dispatch({
          type: ACCOUNT_SELECT,
          payload: {
            url : USERACCOUNT_URL + accountName,
            reqType: "POST",
            query: {
              accountName: accountName
            }
          }
        });
      }

      /**
       * ToDo
       * Clear App resources cache
       * Clear dynamic tab cache
       * Clear Impersonation cache
       */
      this.appStateService.resetSelectedAccount();
      this.appStateService.clearResourceType();
      this.appStateService.clearResources();
      this.appStateService.clearResourceTypeMapping();
      this.appStateService.clearAppResources();

      let resetAction = {
        type: AFTER_SAVE_ALL_RESET
      }

      this.appStateService.dispatch(resetAction);

      this.enableSave = false;
    }
  }

  newApp(template: TemplateRef<any>) {
    this.name = "";
    this.description = "";
    if(this.router["currentRouterState"].snapshot.url != "/resources"){
      this.router.navigate(["/resources"]).then(nav => {
        if (nav) {
            this.dialog = this.dialogService.open({
              title: "Add New Application",
              content: template
            });
          }
      });
    } else {
      this.dialog = this.dialogService.open({
        title: "Add New Application",
        content: template
      });
    }
  }

  onSubmit(event, appForm){
    let name = appForm.controls.name.value;

    if(!name || !name.trim()) {
      appForm.controls.name.setErrors({pattern:true});
      return;
    }

    this.appStateService.dispatch({
          type: ADD_NEW_APP,
          payload: {
            appName: this.name,
            appDescription: this.description
          }
        });

    this.dialog.close();
  }

  onCancel(){
    this.dialog.close();
  }

}
