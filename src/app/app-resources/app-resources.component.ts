import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";
import "@progress/kendo-ui/js/kendo.treeview.js";
import "@progress/kendo-ui/js/kendo.menu.js";
import { Observable } from 'rxjs/Observable';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { Router } from '@angular/router';

import { AppStateService } from '../state/app-state.service';
import { initialAppState, APP_LIST_URL, RESOURCE_TREE_MENU_ITEMS, MODIFIED, PARENT_GROUPS_URL, PERM_ADMIN, PERM_DEV, PERM_IMPERSONATOR } from "../utils/constants";
import { ADD_NEW_APP, APP_LIST, APP_LIST_RESULT, APP_RESOURCES, APP_RESOURCES_RESULT, SHOW_RESOURCE, ROOT_ACCOUNT, ROOT_ACCOUNT_RESULT, NOTIFICATION, RES_MANAGER_APPEND, AFTER_SAVE_ALL_RESET, REMOVE_NEW_APP, PARENT_GROUPS, DELETE_NODE, APPEND_NODE } from "../state/actions";
import { newApp, newAppResources, GROUP_DETAILS, APP_RESOURCE_TREE_URL, ADDED, DELETED } from "../utils/constants";
import { DUPLICATE_ACCOUNT_ERROR, NO_AUTHORIZATION, DELETE_AUTHORIZATION, CHILD_AUTHORIZATION } from "../utils/messages";
import { findById, getAllTreeItems } from "../utils/parser-util";

let $ = null;

@Component({
  moduleId: module.id,
  selector: 'adb-app-resources',
  templateUrl: 'app-resources.component.html',
  styleUrls: ['app-resources.component.scss']
})
export class AppResourcesComponent implements OnInit {
  errorMessage: string;
  private $cutNode: any;
  private $copiedNode: any;
  private appSub: any;
  private resourceSub: any;
  private rootAccSub: any;
  private expandStatus: boolean = false;
  private initialSaveState;
  private newAppAdded = false;

  constructor(private dialogService: DialogService, private stateService: AppStateService, private router: Router) {
    $ = window["jQuery"];
    this.appSub = this.stateService.subscribe(APP_LIST_RESULT, this.onApplicationList.bind(this));
    this.resourceSub = this.stateService.subscribe(APP_RESOURCES_RESULT, this.onNodeData.bind(this));
    this.stateService.subscribe(RES_MANAGER_APPEND, this.appendData.bind(this));
    this.stateService.subscribe(AFTER_SAVE_ALL_RESET, this.resetTreeAfterSaveAll.bind(this));
    this.stateService.subscribe(ADD_NEW_APP, this.addNewApp.bind(this))
    this.stateService.subscribe(REMOVE_NEW_APP, this.removeNewApp.bind(this))
    this.stateService.subscribe(DELETE_NODE, this.deleteNodeCheck.bind(this));
    this.stateService.subscribe(APPEND_NODE, this.appendNode.bind(this));
  }

  ngOnInit() {
    this.initTree();
    this.initContextMenu();
    this.initialSaveState = $("button#saveAll.cust-header-nav-btn").attr("disabled");
    let user = this.stateService.userInfo;
    const action = {
      type: APP_LIST,
      payload: {
        url: APP_LIST_URL + `/${user.name}`//"/hirparaj"
      }
    };

    this.stateService.dispatch(action);
  }

  private initTree() {
    const self = this;

    $("#applications").kendoTreeView({
      //Disabled drag and drop as it was resulting in much complexity
      //Implementation in phase 2
      dragAndDrop: false,
      template: (item) => {
        const ac = item.item;
        let result = ac.name;

        if ((ac.parentResourceMappingid != null || ac.parentResourceMappingId != null) && ac.description) {
          result += ` - ${ac.description}`;
        }

        if (ac.isExclude) {
          result = `<span title="${ac.accountName}" class="excluded">${result}</span>`
        }
        else if (ac.isActive === false) {
          result = `<span title="${ac.accountName}" class="inactive">${result}</span>`
        }
        else if ("accountType" in ac) {//Added tooltip for authorizations
          result = `<span title="${ac.accountName}">${result}</span>`
        }

        return result;
      },

      /* dragstart: function (e) {
        const appTree = e.sender;
        const di = appTree.dataItem(e.sourceNode);
        //Allow only accounts (person and group) to be dragged
        if (di.spriteCssClass != "person" && di.spriteCssClass != "group") {
          e.preventDefault();
          return;
        }

        //Restrict drag for excluded accounts
        //Restrict drag of inactive accounts/groups
        if(di && (di.isActive == false || di.isExclude == true)) {
          e.preventDefault();
        }
      },

      drag: function (e) {
        let role = $(e.dropTarget).children(".role");
        let permission = $(e.dropTarget).children(".permission");

        if(e.sender.dragging.hovered && e.sender.dragging.hovered.attr("id") != "applications") {
          //Restrict drop if not on self
          e.setStatusClass("k-i-cancel");
        }
        // if the current status is "insert-top/middle/bottom"
        else if (e.statusClass.indexOf("insert") >= 0) {
          // deny the operation to avoid reordering
          e.setStatusClass("k-i-cancel");
        }
        //Restrict the drop only to permission or role node
        else if (role.length == 0 && permission.length == 0) {
          e.setStatusClass("k-i-cancel");
        }
      },

      drop: function (e) {
        //Return if drop is not permitted
        if (!e.valid) {
          return;
        }

        let appTree = $("#applications").data("kendoTreeView");

        let acc = appTree.dataItem(e.sourceNode);
        let resource = appTree.dataItem(e.destinationNode);

        //Avoid duplicate accounts for permission/role node
        if (resource && resource.hasChildren) {
          //Use _childrenOptions because target node may not be expanded and targetDI.children will be empty
          let children = resource.loaded() ? resource.items : resource._childrenOptions.data.items;
          if (children) {
            let ac = children.find(i => i.accountId == acc.accountId)
            if (ac) {
              let dialog = self.dialogService.open({
                title: "Info",
                content: DUPLICATE_ACCOUNT_ERROR,
              });

              e.setValid(false);
              return;
            }
          }
        }

        //When a node is moved, for save, we need to create two objects -
        //one with state as Deleted since it is moved and one with state as Added since
        //it is dropped under new resource
        self.stateService.addAuthAccount(acc, DELETED);

        acc.applicationId = resource.applicationId;
        acc.parentResourceMappingid = resource.resourceMappingId;
        self.stateService.addAuthAccount(acc, ADDED);

        self.stateService.enableSaveAllBtn(true);
      }, */

      expand: function (e) {
        const accTree = $("#applications").data("kendoTreeView");
        let di = accTree.dataItem(e.node);

        if (di.state == "Added")
          return;

        //Only allow api call for root application nodes
        if (di.parentResourceMappingid != null) {
          return;
        }
        //If children are already present, avoid an api call
        if (di.items.length != 0)
          return;

        e.preventDefault();//prevent default behavior to let the loading animation play
        var url = APP_RESOURCE_TREE_URL + "/" + di.applicationId;
        $(e.node).find("span.k-i-expand").addClass("k-i-loading").removeClass("k-i-expand");

        const action = {
          type: APP_RESOURCES,
          payload: {
            url: url,
            event: e,
            applicationId: di.applicationId
          }
        };

        self.stateService.dispatch(action);
      }
    });

    const spanSelector = "ul.k-treeview-lines > li > div > span.k-in";
    //On double click on app node, open resource manager
    $('#applications').on("dblclick", spanSelector, function (event) {
      const splitter = $("#divided-box").data("kendoSplitter");
      const pane = splitter.options.panes.find(pane => pane.id === "resource-manager");
      let display = $("adb-resource-manager").prev(".k-splitbar").css("display")

      if (pane) {
        pane.collapsed = false;
        pane.collapsible = true;
      }

      const appTree = $("#applications").data("kendoTreeView");
      const di = appTree.dataItem(appTree.select());
      const act = {
        type: SHOW_RESOURCE,
        payload: di
      };

      if (!(di.items.length)) {
        self.expandStatus = true;
      } else if (("collapsible" in splitter.options.panes[2] && display == "flex" && di.applicationId != self.stateService.applicationId &&
        (initialAppState.appResourceTab.appResourceTypes.length || initialAppState.appResourceTab.appResourcesData.length
          || initialAppState.appResourceTab.appResourceTypeMap.length || initialAppState.appResourceTab.applicationResources.length)
        && (di.state != "Added")) || ((initialAppState.appResourceTab.applicationResources.length && initialAppState.appResourceTab.applicationResources[0].applicationId < 0) && (di.state != "Added"))) {
        let dialog = self.dialogService.open({
          title: "Confirm",
          content: "Unsaved changes will be lost. Are you sure you want to close the dynamic tab?",
          actions: [
            { text: "Yes", primary: true },
            { text: "No" }
          ]
        });
        dialog.result.subscribe((result) => {
          if (result["text"] == "Yes") {
            if (initialAppState.appResourceTab.applicationResources.length && initialAppState.appResourceTab.applicationResources[0].applicationId < 0) {
              let node = appTree.findByText(initialAppState.appResourceTab.applicationResources[0].name)
              self.stateService.dispatch({
                type: REMOVE_NEW_APP,
                node: node
              })
            }
            self.stateService.clearResourceType();
            self.stateService.clearResourceTypeMapping();
            self.stateService.clearResources();
            self.stateService.clearAppResources();
            if (self.initialSaveState) {
              self.stateService.enableSaveAllBtn(false);
            }
            if (di.items.length) {
              self.openDynamicTab(display, pane, splitter, act);
            }
          }
        });
      } else {
        if (di.items.length) {
          self.openDynamicTab(display, pane, splitter, act);
        }
      }
    });
  }

  private initContextMenu() {
    const self = this,
      appTree = $("#applications").data("kendoTreeView"),
      pasteOption = RESOURCE_TREE_MENU_ITEMS.CONTEXT_MENU_PASTE,
      cutOption = RESOURCE_TREE_MENU_ITEMS.CONTEXT_MENU_CUT,
      copyOption = RESOURCE_TREE_MENU_ITEMS.CONTEXT_MENU_COPY,
      excludeOption = RESOURCE_TREE_MENU_ITEMS.CONTEXT_MENU_EXCLUDE,
      deleteOption = RESOURCE_TREE_MENU_ITEMS.CONTEXT_MENU_DELETE;

    let $contextTarget = null;

    $("#applications").on("contextmenu", function (e) {
      //Allow the custom context menu only for user accounts belonging to permission node
      let $target = $(e.target).closest("li");

      let dataItem = appTree.dataItem($target);

      //Check for person or group node
      let isPersonNode = dataItem.accountType && dataItem.accountType.toLowerCase() == "person";
      let isGroupNode = dataItem.accountType && dataItem.accountType.toLowerCase() != "person";

      let isPermissionNode = dataItem.spriteCssClass == "permission";
      let isRoleNode = dataItem.spriteCssClass == "role";
      let parentNode = dataItem.parentNode();

      if (isPersonNode || isGroupNode) {
        //Get parent groups for the account for validation if in case user wants to exclude it
        self.stateService.dispatch({
          type: PARENT_GROUPS,
          payload: {
            url: PARENT_GROUPS_URL + dataItem.accountId,
            accountId: dataItem.accountId
          }
        });

        //handle custom menu display
        $contextTarget = $target;
        let isParentARole = parentNode.resourceTypeName.toLowerCase() == "role";
        //For ADBAdministrator,ADBDeveloper and ADBImpersonator permissions display only delete option
        let isADBPermission = parentNode.name == PERM_DEV;
        isADBPermission = isADBPermission || parentNode.name == PERM_ADMIN;
        isADBPermission = isADBPermission || parentNode.name == PERM_IMPERSONATOR;

        //Hide inappropriate options
        $("#context-menu > li").each((index, el) => {
          let $el = $(el);
          $el.show();
          if (el.textContent == pasteOption ||
            (el.textContent == excludeOption && (dataItem.isExclude || dataItem.isActive == false || isGroupNode || isParentARole || isADBPermission))) {
            $el.hide();
          }
          else if ((el.textContent == cutOption || el.textContent == copyOption) &&
            (dataItem.isActive == false || dataItem.isExclude == true)) {
            $el.hide();
          }
        });
      }
      else if ((isPermissionNode || isRoleNode) && (self.$copiedNode || self.$cutNode)) {
        //Set reference to node where cut/copied node is to be added
        $contextTarget = $target;

        //Show paste option for permission or role node
        $("#context-menu > li").each((index, el) => {
          let $el = $(el);
          $el.hide();
          if (el.textContent == pasteOption) {
            $el.show();
          }
        });
      }
      else {
        //Prevent kendo from displaying custom menu and let browser display its menu
        e.stopImmediatePropagation();
      }
    });

    RESOURCE_TREE_MENU_ITEMS.data.forEach((item) => {
      $("#context-menu").append(`<li>${item}</li>`)
    });

    $("#context-menu").kendoContextMenu({
      target: "#applications",
      select: e => {
        if ($contextTarget) {
          let selectedAction = e.item.textContent;
          let parentDi = appTree.dataItem($contextTarget);
          let di = null;

          if (selectedAction == deleteOption) {
            let dialog = self.dialogService.open({
              title: "Confirm",
              content: DELETE_AUTHORIZATION,
              actions: [
                { text: "Yes", primary: true },
                { text: "No" }
              ]
            });

            dialog.result.subscribe((result) => {
              if (result["text"] == "Yes") {
                let ac = appTree.dataItem($contextTarget);
                appTree.remove($contextTarget);
                self.stateService.addAuthAccount(ac, DELETED);
                self.stateService.enableSaveAllBtn(true);
              }
            });
          }
          //Copy/Paste functionality will be implemented properly in phase 2
          /* else if (selectedAction == copyOption) {
            self.$copiedNode = $contextTarget;
            self.$cutNode = null;
          }
          else if (selectedAction == cutOption) {
            self.$cutNode = $contextTarget;
            self.$copiedNode = null;
          }
          else if (selectedAction == pasteOption) {
            let $srcNode = self.$copiedNode ? self.$copiedNode : self.$cutNode;
            let sourceDI = appTree.dataItem($srcNode);
            let targetDI = appTree.dataItem($contextTarget);

            //Avoid duplicate accounts for permission/role node
            if (targetDI && targetDI.hasChildren) {
              //Use _childrenOptions because target node may not be expanded and targetDI.children will be empty
              let children = targetDI.loaded() ? targetDI.items : targetDI._childrenOptions.data.items;
              if (children) {
                let ac = children.find(i => i.accountId == sourceDI.accountId)
                if (ac) {
                  let dialog = this.dialogService.open({
                    title: "Info",
                    content: DUPLICATE_ACCOUNT_ERROR,
                  });

                  return;
                }
              }
            }

            if (self.$cutNode) {
              self.moveCopyAccount(self.$cutNode, $contextTarget, false);

              //When a node is cut and pasted, for save, we need to create two objects -
              //one with state as Deleted since it is cut and one with state as Added since
              //it is pasted
              di = appTree.dataItem(self.$cutNode);
              self.stateService.addAuthAccount(di, DELETED);

              di.authorizationId = 0;
              di.applicationId = parentDi.applicationId;
              di.parentResourceMappingid = parentDi.resourceMappingId;
              self.stateService.addAuthAccount(di, ADDED);

              self.stateService.enableSaveAllBtn(true);
            }
            else if (self.$copiedNode) {
              let appendedNode = self.moveCopyAccount(self.$copiedNode, $contextTarget, true);
              //appendedNode.applicationId = parentDi.applicationId;
              //appendedNode.parentResourceMappingid = parentDi.resourceMappingId;
              self.stateService.addAuthAccount(appendedNode, ADDED);

              self.stateService.enableSaveAllBtn(true);
            }
            //clear cut/copied node
            self.$copiedNode = self.$cutNode = null;
          } */
          else if (selectedAction == excludeOption) {

            if (this.canBeExcluded(parentDi)) {
              parentDi.set("isExclude", true);
              self.stateService.updateAuthAccount(parentDi);
              self.stateService.enableSaveAllBtn(true);
            }
          }
        }
      }
    });
  }

  private onApplicationList(action) {
    var ds = new kdata.HierarchicalDataSource({
      data: action.payload.data,
      schema: {
        model: {
          id: "accountId",//For now keep it accountId for duplicate check on drop to work
          children: "items"
        }
      }
    });

    var appTree = $("#applications").data("kendoTreeView");

    if (appTree)
      appTree.setDataSource(ds);

    if (this.newAppAdded) {
      this.updateDynamicTab();
      this.newAppAdded = false;
    }
  }

  private onNodeData(action) {
    const e = action.payload.event;
    const data = action.payload.data;
    const appTree = $("#applications").data("kendoTreeView");

    if (!appTree) {
      return;
    }

    const di = appTree.dataItem(e.node);

    //di will be null when this function will be called as a side effect when a node is expanded in AccountPanelComponent
    if (!di) {
      return;
    }

    const item = di._childrenOptions.data;
    const appNode = data[0];
    item.resourceTypeId = appNode.resourceTypeId
    item.resourceMappingId = appNode.resourceMappingId;
    item.items = appNode.items;//Take root node's children
    item.expanded = true;

    let node = $(e.node);
    let $li = appTree.insertAfter(item, node);
    appTree.remove(node);

    const splitter = $("#divided-box").data("kendoSplitter");
    const pane = splitter.options.panes.find(pane => pane.id === "resource-manager");

    const act = {
      type: SHOW_RESOURCE,
      payload: di
    };

    let display = $("adb-resource-manager").prev(".k-splitbar").css("display");
    if (this.expandStatus) {
      if (pane) {
        pane.collapsed = false;
        pane.collapsible = true;
      }
      if ((("collapsible" in splitter.options.panes[2] && display == "flex") && di.applicationId != this.stateService.applicationId &&
        (initialAppState.appResourceTab.appResourceTypes.length || initialAppState.appResourceTab.appResourcesData.length
          || initialAppState.appResourceTab.appResourceTypeMap.length || initialAppState.appResourceTab.applicationResources.length))
        || (initialAppState.appResourceTab.applicationResources.length && initialAppState.appResourceTab.applicationResources[0].applicationId < 0)) {
        let dialog = this.dialogService.open({
          title: "Confirm",
          content: "Unsaved changes will be lost. Are you sure you want to close the dynamic tab?",
          actions: [
            { text: "Yes", primary: true },
            { text: "No" }
          ]
        });
        dialog.result.subscribe((result) => {
          if (result["text"] == "Yes") {
            this.openDynamicTab(display, pane, splitter, act);
            if (initialAppState.appResourceTab.applicationResources.length && initialAppState.appResourceTab.applicationResources[0].applicationId < 0) {
              let node = appTree.findByText(initialAppState.appResourceTab.applicationResources[0].name)
              this.stateService.dispatch({
                type: REMOVE_NEW_APP,
                node: node
              })
            }
            this.stateService.clearResourceType();
            this.stateService.clearResourceTypeMapping();
            this.stateService.clearResources();
            this.stateService.clearAppResources();
            if (this.initialSaveState) {
              this.stateService.enableSaveAllBtn(false);
            }
          }
        });
      } else {
        this.openDynamicTab(display, pane, splitter, act);
      }
    }
  }

  private moveCopyAccount(sourceNode: any/*jQuery object*/, destinationNode: any/*jQuery object*/, copy: boolean) {
    if (sourceNode && destinationNode) {
      const appTree = $("#applications").data("kendoTreeView");
      let nodeToAppend = sourceNode;
      if (copy) {
        nodeToAppend = appTree.dataItem(sourceNode).toJSON();
        nodeToAppend.hasChildren = false;

        let destDi = appTree.dataItem(destinationNode);
        nodeToAppend.authorizationId = 0;
        //Update the info with new parent
        nodeToAppend.applicationId = destDi.applicationId;
        nodeToAppend.parentResourceMappingid = destDi.resourceMappingId;
      }
      //append() accepts an object (account in this case) or a jQuery object having li that is to be moved
      appTree.append(nodeToAppend, destinationNode);
      return nodeToAppend;
    }
  }

  private appendData(action) {
    const appTree = $("#applications").data("kendoTreeView");

    if (!appTree)
      return;

    let ele = appTree.findByText(action.payload.data.name + ' - ' + action.payload.data.description);
    let di = appTree.dataItem(ele);
    if (!di) {
      return;
    }
    const item = di._childrenOptions.data;
    item.items = action.payload.data.items;
    item.expanded = true;
    appTree.expandTo(ele);
    let $li = appTree.insertAfter(item, ele);
    appTree.remove(ele);
  }

  private openDynamicTab(display, pane, splitter, act) {
    if (display == "none") {
      $("adb-resource-manager").prev(".k-splitbar").css("display", "flex");
    }

    if (pane) {
      pane.collapsed = false;
      pane.collapsible = true;
    }

    this.stateService.enableAddAppBtn(false);
    this.stateService.dispatch(act);
    splitter.expand('.k-pane:last-of-type');
    this.expandStatus = false;
  }

  resetTreeAfterSaveAll(action) {
    let act = null;

    //If new app is added, refresh the app list
    if (this.newAppAdded) {
      let user = this.stateService.userInfo;
      act = {
        type: APP_LIST,
        payload: {
          url: APP_LIST_URL + `/${user.name}`
        }
      };

      this.stateService.dispatch(act);
    }
    else {//Reset the list
      act = {
        payload: {
          data: this.stateService.appResources
        }
      }

      this.onApplicationList(act);

      this.updateDynamicTab();
    }
  }

  updateDynamicTab() {
    if ($("adb-resource-manager").prev(".k-splitbar").css("display") == "flex") {
      const appTree = $("#applications").data("kendoTreeView");
      //If the tab is not active, appTree will be undefined
      if (!appTree) {
        return;
      }

      let app = appTree.dataSource.data().find(item => item.applicationId == this.stateService.applicationId);

      if (app) {
        let node = appTree.findByUid(app.uid)
        appTree.expand(node);
        let di = appTree.dataItem(node)
        const data = {
          type: SHOW_RESOURCE,
          payload: di
        };

        if (!di.items.length) {
          this.expandStatus = true;
        } else {
          this.stateService.dispatch(data);
        }
      }
    }
  }

  private canBeExcluded(account) {

    let permNode = account.parentNode();
    let node = permNode.parentNode();
    //authorization may be an individual or group account containing the account to be excluded
    let authorization = this.getAuthorizationInParent(account, permNode);

    //Prevent excluding at child level if there is no authorization at parent level
    if (!authorization) {
      let dialog = this.dialogService.open({
        title: "Info",
        content: NO_AUTHORIZATION,
        width: 200
      });

      return false;
    }

    authorization = this.getAuthorizationInChild(account.accountId, node.items, permNode);

    //Prevent excluding at parent level if there is already an authorization at child level
    if (authorization) {
      let dialog = this.dialogService.open({
        title: "Info",
        content: CHILD_AUTHORIZATION,
        //width: 200
      });

      return false;
    }

    return true;
  }

  getAuthorizationInParent(account, permissionNode) {
    let authorization = null;
    let node = permissionNode.parentNode();

    while (node) {
      let items = node.loaded() ? node.items : node._childrenOptions.data.items;
      if (items && items.length) {
        let permission = items.find(i => i.resourceID == permissionNode.resourceID);
        let permChildren = [];

        if (permission) {
          permChildren = permission.loaded() ? permission.items : permission._childrenOptions.data.items;
        }

        if (permChildren && permChildren.length) {
          authorization = permChildren.find(i => {
            if (i.accountType != "Person") {
              let children = [];

              if ("loaded" in i && i.loaded())
                children = i.items;
              else if (i._childrenOptions && i._childrenOptions.data.items) {
                //_childrenOptions is used as the node may not be expanded and i.items may not be loaded
                children = i._childrenOptions.data.items;
              }

              let a = findById(account.accountId, children);

              //For an existing group, we need to check if the account is a member of the group
              if (!a && (children.length == 0)) {
                a = this.accountInGroup(account, i);
              }

              return a ? true : false;
            }
            else {
              //Do not compare with self when checking same persission node
              return i !== account && i.accountId == account.accountId;
            }
          });

          if (authorization) {
            break;
          }
          else {
            node = node.parentNode();
          }
        }
        else {
          node = node.parentNode();
        }
      }
    }

    return authorization;
  }

  getAuthorizationInChild(accountId, items, permissionNode) {
    for (let _item of items) {
      let children = null;

      if ("loaded" in _item && _item.loaded())
        children = _item.items;
      else if (_item._childrenOptions) {
        children = _item._childrenOptions.data.items;
        //Since _childrenOptions has raw items, the parentNode() wont be available on any of its item. So set it in children
        if (children) {
          children.parentNode = () => _item.parentNode();
        }
        //If its a group and its accounts are not loaded then check if account belongs to this group
        else if ("accountType" in _item && _item.accountType != "Person" && _item.parentNode() !== permissionNode) {
          let found = this.accountInGroup({ accountId: accountId }, _item);
          if (found) {
            return _item;
          }
        }
      }
      //This handles the scenario where _item is not a kendo datasource object
      //Fix for issue where if child node (not expanded) had an authorization,
      //then same authorization was allowed to be excluded at parent level
      else if (_item.items && _item.items.length > 0) {
        children = _item.items;
        children.parentNode = () => _item;
      }

      let parentNode: any = {};

      if ("parentNode" in _item) {
        parentNode = _item.parentNode();
      }
      else {//If it is a normal object and not kendo object
        parentNode = items.parentNode();
      }

      //If it is a group then take its parent permission
      if ("accountType" in parentNode && parentNode.accountType != "Person")
        parentNode = parentNode.parentNode();

      if (_item.accountId === accountId && parentNode.resourceID == permissionNode.resourceID && parentNode !== permissionNode) {
        return _item;
      }
      else if (children && children.length > 0) {
        const r = this.getAuthorizationInChild(accountId, children, permissionNode);

        if (r) {
          return r;
        }
      }
    }

    return null;
  }

  //When excluding, check if account belongs to the group or not
  accountInGroup(account, group) {
    let groupMap = this.stateService.parentGroupMap;

    if (account.accountId in groupMap) {
      let parentGroups = groupMap[account.accountId];
      if (parentGroups && parentGroups.length > 0) {
        let gr = parentGroups.find(g => g.groupName == group.accountName);
        return gr ? true : false;
      }
    }

    return false;
  }

  addNewApp(action) {
    let userInfo = window["getUserInfo"]();
    const appTree = $("#applications").data("kendoTreeView");
    let exists = this.stateService.appResources.find(i => i.name.toLowerCase() == action.payload.appName.toLowerCase())
    if (exists) {
      this.dialogService.open({
        title: "Info",
        content: "An Application with this name already exists. Please enter unique application name."
      });
      return;
    }
    let item = {};
    let authAccount = {}
    let tempRes = [];
    let targets = [];
    //newApp = JSON.parse(JSON.stringify(newApp));
    newApp.applicationId = this.stateService.counter;
    newApp.name = action.payload.appName
    newApp.description = action.payload.appDescription;
    newApp.parentResourceMappingId = null;
    newApp.resourceMappingId = this.stateService.counter;
    newApp.resourceID = this.stateService.counter;
    newApp.state = 'Added';
    newApp.items.forEach((item, index) => {
      item.applicationId = newApp.applicationId;
      item.parentResourceMappingId = newApp.resourceMappingId;
      item.resourceMappingId = this.stateService.counter;
      item.resourceID = this.stateService.counter;
      item.state = "Added"
      newAppResources.applicationResources[index + 1].resourceMappingId = item.resourceMappingId;
      if (item.name == "ADBDeveloper") {
        authAccount['parentResourceMappingid'] = item.resourceMappingId;
        item['items'].forEach(i => {
          i.accountId = userInfo.accountId;
          i.accountName = userInfo.name;
          i.applicationId = newApp.applicationId;
          i.authorizationId = this.stateService.counter;
          i.name = userInfo.displayName;
          i.parentResourceMappingId = item.resourceMappingId;
          i.state = "Added";
        })
      }
    });
    authAccount['authorizationId'] = this.stateService.counter;
    authAccount['accountId'] = userInfo.accountId;
    authAccount['accountName'] = userInfo.name;
    authAccount['name'] = userInfo.displayName;
    authAccount['applicationId'] = newApp.applicationId;
    authAccount['accountType'] = "Person"
    authAccount['isExclude'] = false
    authAccount['state'] = "Added"
    authAccount['isActive'] = true

    this.stateService.addAuthAccount(authAccount, "Added");
    targets = JSON.parse(JSON.stringify(newAppResources.resourceTypeTargets))
    let i = 0;
    newAppResources.resourceTypes.forEach((resType, index) => {
      resType.resourceTypeId = this.stateService.counter;
      resType.applicationId = newApp.applicationId;
      let rt = newAppResources.resourceTypes.find(rt => rt.name == "Application")
      if (resType.name == "Role" || resType.name == "Permission") {
        if (targets[i]) {
          targets[i]['applicationId'] = resType.applicationId;
          targets[i]['resourceTypeTargetId'] = this.stateService.counter;
          targets[i]['sourceResourceTypeId'] = resType.resourceTypeId
          targets[i]['targetResourceTypeId'] = rt.resourceTypeId;
        }
        ++i;
      }
      this.stateService.addResourceType(resType);
    });
    this.stateService.addResourceTypeMapping(targets)
    let rt = newAppResources.resourceTypes.find(rt => rt.name == newApp.resourceTypeName)
    newAppResources.resources.forEach(res => {
      res.name = newApp.name;
      res.resourceId = newApp.resourceID;
      res.description = newApp.description
      res.resourceTypeId = rt.resourceTypeId
      res.applicationId = newApp.applicationId
      res.resourceTypeName = newApp.resourceTypeName
      res.imageFile = newApp.imageFile
    })
    tempRes = JSON.parse(JSON.stringify(newAppResources.resources))
    newApp.items.forEach((newRes, index) => {
      let rt = newAppResources.resourceTypes.find(rt => rt.name == newRes.resourceTypeName)
      tempRes[index + 1].name = newRes.name;
      tempRes[index + 1].resourceId = newRes.resourceID;
      tempRes[index + 1].description = newRes.description
      tempRes[index + 1].resourceTypeId = rt.resourceTypeId
      tempRes[index + 1].applicationId = newRes.applicationId
      tempRes[index + 1].resourceTypeName = newRes.resourceTypeName
      tempRes[index + 1].imageFile = newRes.imageFile
    })
    newAppResources.resources = JSON.parse(JSON.stringify(tempRes))
    tempRes.forEach(item => {
      this.stateService.addResources(item);
    })

    tempRes.forEach((res, index) => {
      newAppResources.applicationResources[index].applicationId = res.applicationId;
      newAppResources.applicationResources[index].description = res.description;
      newAppResources.applicationResources[index].imageFile = res.imageFile;
      newAppResources.applicationResources[index].name = res.name;
      newAppResources.applicationResources[index].resourceID = res.resourceId;
      newAppResources.applicationResources[index].resourceTypeName = res.resourceTypeName;
    })

    newAppResources.applicationResources.forEach(appRes => {
      if (appRes.resourceTypeName == "Application") {
        appRes.parentResourceMappingId = null;
        appRes.resourceMappingId = this.stateService.counter;
      } else {
        appRes.parentResourceMappingId = newAppResources.applicationResources[0].resourceMappingId;
      }
      this.stateService.addAppResources(appRes);
    })

    let ele = appTree.append(newApp)
    appTree.expand(ele)
    ele[0].scrollIntoView();
    this.stateService.enableSaveAllBtn(true);
    this.stateService.enableAddAppBtn(false);

    this.newAppAdded = true;
  }

  removeNewApp(action) {
    const appTree = $("#applications").data("kendoTreeView");
    if (this.router["currentRouterState"].snapshot.url != "/resources") {
      this.router.navigate(["/resources"]).then(nav => {
        const appTree = $("#applications").data("kendoTreeView");

        if (!appTree) {
          return;
        }

        if (action.index) {
          let di = appTree.dataSource.at(action.index);
          appTree.remove(appTree.findByUid(di.uid));
        }
        else {
          appTree.remove(action.node);
        }
      })
    }
    else {
      if (!appTree) {
        return;
      }

      if (action.index) {
        let di = appTree.dataSource.at(action.index);
        appTree.remove(appTree.findByUid(di.uid));
      }
      else {
        appTree.remove(action.node);
      }
    }

    this.newAppAdded = false;
  }

  deleteNodeCheck(action) {
    const appTree = $("#applications").data("kendoTreeView");
    let items = getAllTreeItems(appTree);
    let item = items.find(i => i.resourceMappingId == action.payload.resourceMappingId);
    if (item && item.loaded()) {
      if (!item.items.length) {
        action.payload.items = item.items;
      }
    }
  }

  appendNode(action) {
    const appTree = $("#applications").data("kendoTreeView");
    console.log(initialAppState)
    var items = getAllTreeItems(appTree);
    let item = items.find(i => i.resourceMappingId == action.payload.parentResourceMappingid);
    console.log(item)
    if (item && action.state == "append") {
      appTree.append(action.payload, appTree.findByUid(item.uid))
    } else if (item && action.state == "remove") {
      if (item.hasChildren) {
        if (!item.expanded) {
          appTree.expand(appTree.findByUid(item.uid))
          items = getAllTreeItems(appTree);
        }
      }
      if (items) {
        let i = items.find(i => i.resourceMappingId == action.payload.resourceMappingId)
        appTree.remove(appTree.findByUid(i.uid))
      }
    }
  }

  ngOnDestroy() {
    if (this.resourceSub) {
      this.resourceSub.unsubscribe();
    }
    if (this.rootAccSub) {
      this.rootAccSub.unsubscribe();
    }
  }
}
