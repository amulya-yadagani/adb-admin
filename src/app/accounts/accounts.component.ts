import { Component, ElementRef, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import "@progress/kendo-ui/js/kendo.treeview.js";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";

import * as Constants from "../utils/constants";
import { findById } from "../utils/parser-util";
import { AppStateService } from "../state/app-state.service";
import { ROOT_ACCOUNT, ROOT_ACCOUNT_RESULT, SEARCH, SEARCH_RESULT, SEARCH_ERROR, ACCOUNT_SELECT, USER_SEARCH, USER_MEMBERS_RESULT, ADD_NEW_ACCOUNT, UPDATE_GROUP_MEMBER, AFTER_SAVE_ALL_RESET } from "../state/actions";
import { USERACCOUNT_URL, ADDED, DELETED, ROLE_IMPERSONATOR, PERM_DEV, PERM_ADMIN, PERM_IMPERSONATOR } from '../utils/constants';

let $ = null;

@Component({
    moduleId: module.id,
    selector: 'adb-account-panel',
    templateUrl: 'accounts.component.html',
    styleUrls: ["accounts.component.scss"],
    encapsulation: ViewEncapsulation.None
})

export class AccountPanelComponent implements OnInit, OnDestroy  {
    access = true;
    treeData:Array<any>;
    searchData:Array<any>;
    recentCachedSearch:Array<any>;
    private rootAccSub:any;
    private searchSub:any;
    private filter:any = {};
    private cMenuDataItem:any;

    // Component Constants
    ACCOUNT_ALL = Constants.ACCOUNT_ALL;
    ACCOUNT_ACTIVE = Constants.ACCOUNT_ACTIVE;
    ACCOUNT_INACTIVE = Constants.ACCOUNT_INACTIVE;
    ADGROUP = 'AD';
    ADBGROUP = 'ADB';
    PERSON = 'Person';
    POST = 'POST';
    GET = 'GET';
    NAV = 'accountDetails';

    constructor(private stateService:AppStateService, private router: Router, private el:ElementRef) {
        let role = stateService.userInfo.role.toLowerCase();
        this.access = role != ROLE_IMPERSONATOR;

        if(!this.access) {
          return;
        }

        $ = window["jQuery"];
        this.treeData = this.stateService.accountsTree;
        this.searchData = JSON.parse(JSON.stringify(this.treeData));
        this.searchData.forEach((item,index,arr) => {
            item.hasChildren = false;
            arr[item.displayName] = item;
        });

        this.rootAccSub = this.stateService.subscribe(ROOT_ACCOUNT_RESULT, this.onNodeData.bind(this));
        this.stateService.subscribe(SEARCH_RESULT, this.onSearchData.bind(this));
        this.stateService.subscribe(SEARCH_ERROR, this.onSearchError.bind(this));
        this.stateService.subscribe(USER_MEMBERS_RESULT, this.onMembersResult.bind(this));
        this.stateService.subscribe(ADD_NEW_ACCOUNT, this.onAddNewAccount.bind(this));
        this.stateService.subscribe(UPDATE_GROUP_MEMBER, this.onUpdateGroupMember.bind(this));
        this.stateService.subscribe(AFTER_SAVE_ALL_RESET, this.resetTreeAfterSaveAll.bind(this))
    }

    ngOnInit() {
        if(!this.access) {
          let panel = document.getElementById("accounts-panel");

          if(panel) {
            this.el.nativeElement.removeChild(document.getElementById("accounts-panel"));
          }

          return;
        }

        this.initTreeView();
        this.initSearchBox();
        this.initFilterMenu();
        //this.initContextMenu();
        this.initToolTip();
    }

    private initTreeView() {
      const self = this;
      //Initially display all accounts
      this.filter = {
        field: "isActive",
        operator: "notequals",
        value: null
      };

      $("#accounts").kendoTreeView({
          dragAndDrop: true,
          dataTextField: "displayName",
          template: (item) => {
            const ac = item.item;
            let result = ac.displayName;

            if(ac.isActive === false){
              result = `<span class="inactive">${result}</span>`;
            }

            return result;
          },
          dataSource: new kdata.HierarchicalDataSource({
              data: self.treeData
              //Applying filter here results in to a recursion error when a group (with no accounts) is expanded
          }),

          dragstart: function(e) {
              //Prevent root node dragging
              if ($(e.sourceNode).parentsUntil(".k-treeview", ".k-item").length == 0) {
                  e.preventDefault();
                  return;
              }

              //Restrict drag of inactive accounts/groups
              let di = e.sender.dataItem(e.sourceNode);
              if(di && di.isActive == false) {
                e.preventDefault();
              }
          },

          drag: function(e){

              let appTree = $("#applications").data("kendoTreeView");
              let treeItem = $(e.dropTarget).closest("li");
              let dataItem = appTree ? appTree.dataItem(treeItem[0]) : null;

              /* let role = $(e.dropTarget).children(".role");
              let permission = $(e.dropTarget).children(".permission"); */

              if(e.dropTarget.id == "accounts") {
                //Restrict drop on accounts (self) tree
                e.setStatusClass("k-i-cancel");
              }

              if((e.sender.dragging.hovered && e.sender.dragging.hovered.attr("id") != "applications") ||
                !dataItem /*if dataItem is null then drop target may be role or permission from dynamic tab*/) {
                //Restrict drop if not on applications tree in app resources tab
                e.setStatusClass("k-i-cancel");
              }
              // if the current status is "insert-top/middle/bottom"
              else if (e.statusClass.indexOf("insert") >= 0) {
                  // deny the operation to avoid reordering
                  e.setStatusClass("k-i-cancel");
              }
              //Restrict the drop only to permission or role node
              /* role.length == 0 && permission.length == 0 */
              else if(dataItem && dataItem.resourceTypeName != "Permission" && dataItem.resourceTypeName != "Role") {
                  e.setStatusClass("k-i-cancel");
              }
              //For ADBAdministrator,ADBDeveloper and ADBImpersonator permissions restrict dropping groups
              else if(dataItem && dataItem.resourceTypeName == "Permission") {
                let di = e.sender.dataItem(e.sourceNode);
                let isGroup = di.accountType != "Person";
                let restrict = dataItem.name == PERM_DEV;
                restrict = restrict || dataItem.name == PERM_ADMIN;
                restrict = restrict || dataItem.name == PERM_IMPERSONATOR;

                if(isGroup && restrict) {
                  e.setStatusClass("k-i-cancel");
                }
            }

              //uncomment to auto-expand node on drag hover
              /*let appTree = $("#applications").data("kendoTreeView");
              appTree.expand($(e.dropTarget).closest("li"));*/
          },

          drop: function(e){
              //Return if drop is not permitted
              if(!e.valid) {
                  return;
              }

              let accTree = $("#accounts").data("kendoTreeView");
              let appTree = $("#applications").data("kendoTreeView");

              let acc = accTree.dataItem(e.sourceNode);
              let resource = appTree.dataItem(e.destinationNode);

              //Avoid duplicate accounts for permission/role node
              if (resource && resource.hasChildren) {
                //Use _childrenOptions because target node may not be expanded and targetDI.children will be empty
                let children = resource.loaded() ? resource.items : resource._childrenOptions.data.items;
                if (children) {
                  let ac = children.find(i => i.accountId == acc.accountId)
                  if (ac) {
                    /* let dialog = self.dialogService.open({
                      title: "Info",
                      content: DUPLICATE_ACCOUNT_ERROR,
                    }); */

                    e.setValid(false);
                    return;
                  }
                }
              }

              //Enhancement
              /* let restrict = self.parentHasExcludedAccount(acc, resource);
              if(restrict) {
                e.setValid(false);
                return;
              } */

              //To copy the node, override the default behavior (reference - http://www.telerik.com/forums/treeview-draganddrop-to-copy-not-to-move)
              e.preventDefault();
              let copy = this.dataItem(e.sourceNode).toJSON();

              let addNameField = (arr) => {
                arr.forEach(item => {
                  if(item.items && item.items.length > 0)
                    addNameField(item.items);

                  //appTree uses name property to display the text in tree
                  item.name = item.displayName;
                  //Setting hasChildren will render the expand arrow for groups whose accounts haven't been loaded yet
                  item.hasChildren = item.isGroup;
                  //delete copy.displayName;
                });
              };

              addNameField([copy]);

              if(e.dropPosition == "over") {
                let $li = appTree.append(copy, $(e.destinationNode));
                let di = appTree.dataItem($li);

                //After the account is added, set mapping
                let parentResource = appTree.dataItem(e.destinationNode);
                di.applicationId = parentResource.applicationId;
                di.parentResourceMappingid = parentResource.resourceMappingId;

                self.stateService.addAuthAccount(di, ADDED);

                self.stateService.enableSaveAllBtn(true);
              }
          },

          expand: function(e){
              const accTree = $('#accounts').data('kendoTreeView');
              let di = accTree.dataItem(e.node);

              if (di.items.length !== 0 || di.status == "New")
                  return;

              e.preventDefault();//prevent default behavior to let the loading animation play
              let item = di._childrenOptions.data;
              var url = di.endpoint ? di.endpoint : Constants.GROUP_DETAILS + di.accountId;
              $(e.node).find("span.k-i-expand").addClass("k-i-loading").removeClass("k-i-expand");

              const action = {
                  type: ROOT_ACCOUNT,
                  payload: {
                      url: url,
                      event: e,
                      accountId: di.accountId
                  }
              };

              const children = self.stateService.getGroupChildren(di.accountId);

              //This checks if children are present after the tree is reset.
              //If they are there then do not make a call
              //Since default behavior is prevented, handle data rendering
              if(children /* && children.length !== 0 */) {
                  action.payload["data"] = children;
                  self.onNodeData(action);
                  return;
              }

              self.stateService.dispatch(action);
          },
          navigate : function(e){
              if(e.node) {
                  const firstChild = e.node.firstChild;

                  //Fix for the issue where the keybord down arrow navigation was not working properly.
                  //Pre-requisits for the issue to occur:
                  //1) Expand AD Groups
                  //2) Click on ADB Groups so that it is focused
                  //3) Press down arrow
                  if(firstChild){
                    firstChild.scrollIntoView(false);
                  }
                  else {
                    e.node.scrollIntoView(false);
                  }
              }
          },

          select: function(e: Event) {
            const accTree = $('#accounts').data('kendoTreeView');
            const di = accTree.dataItem((e as any).node);
            if (di.accountName !== undefined) {
              const action = {
                  type: ACCOUNT_SELECT,
                  reqType: this.POST,
                  payload: {
                      classify: 'ACC_SEARCH',
                      url : USERACCOUNT_URL,
                      query : di.toJSON()
                  }
              }
              //Here we navigate to 'accountDetails' route only to avoid the routing error
              //(Cannot reattach ActivatedRouteSnapshot created from a different route)
              //This error appears in only one usecase
              //1) Launch adb admin
              //2) Without doing anything, navigate to Account Details tab
              //3) Navigate back back to App Resources tab
              //4) In Accounts panel, select any group and the above described error occurs
              const promise = self.router.navigate([self.NAV]);
              promise.then(result => {
                self.stateService.dispatch(action);
                //Deselect the current selected account so that it can again be selected
                //selected without selecting any other account.
                //Fix for an issue with following repro steps
                //1.Click on any AD group (GLOBAL-NYCIT-CMAS-ALL) in accounts panel.
                //2.Click on any member in the group (pandas)
                //3.Click on same AD group again in accounts panel.
                //4.Click on any other account.
                //5.Click on same AD group.
                accTree.select($());
              });
            }
          }
       });
    }

    private initSearchBox() {
        let searchBox = document.getElementById("search-box");

        //Reset the value for search box on load. This is a fix for an issue where the value was not reset even after refreshing in IE 11 and Edge
        $(document).ready(() => {
          searchBox["value"] = "";
          //focus out later for the placeholder text to appear
          setTimeout(function(){searchBox.blur()},0);
        });

        let searchStream = Observable.fromEvent(searchBox, "keyup")
                                     .map((e:any) => e.target.value.trim())
                                     .debounceTime(150);

        const action = {
          type: SEARCH,
          //Add this property to differentiate from where the action was dispatched
          //The same action (SEARCH) is used in MembersComponent as well
          source: "AccountPanelComponent",
          payload: {
            searchStream: searchStream
          }
        };
        this.stateService.dispatch(action);

        //Fix for issue in CME-6922 (happens only for IE 11 and Edge) where the search result popup was not visible completely. It was clipped.
        //Instead of specifying display as none in css, it is done here. This fixes the issue
        $("#search-results").css("display","none")
                            .on("click",this.selectSearchItem.bind(this));

        //Hide #search-results when user clicks else where
        $(document).on("click", (e) => {
          const input = document.getElementById("search-box");
          const searchResults = document.getElementById("search-results");

          if(e.target !== input && e.target !== searchResults) {
            this.hideSearchResult();
          }
        })
    }

    private initFilterMenu() {
        const that = this;
        const $filtercon = $("#filter-con");
        const $filterLabel =  $("#filter-label");
        const $filterMenu = $("#filter-menu");

        $filterLabel.on("mouseenter",(e) => {
          if(e.buttons == 1) {
            //If left mouse button is down, i.e when drag is in process, do not show the menu
            return;
          }

          that.toggleFilterMenu(true);
        });

        $filterMenu.on("click","li", (e) => {
          $filterLabel.text(e.target.innerText);
          that.applyFilter(null,e.target.innerText);
          that.toggleFilterMenu(false);
        });

        $filtercon.on("mouseleave", (e) => {
          that.toggleFilterMenu(false);
        });
    }

    /* private initContextMenu() {
        const that = this;

        $("#accounts").on("contextmenu",function(e){
          //Allow the custom context menu only for groups

          //Check for group and folder class
          const accTree = $("#accounts").data("kendoTreeView");
          let treeItem = $(e.target).closest("li");
          let dataItem = accTree.dataItem(treeItem[0]);
          let isGroup = treeItem.children().has(".group").length !== 0;
          let isRoot = treeItem.children().has(".folder").length !== 0;

          if((isGroup || isRoot) && dataItem.items.length > 0)
          {
              that.cMenuDataItem = dataItem;
          }
          else
          {
              //Prevent kendo from displaying custom menu and let browser display its menu
              e.stopImmediatePropagation();
          }
        });

        $("#filter-context-menu").kendoContextMenu({
          target:"#accounts",
          select: e => {
              if(that.cMenuDataItem) {
                that.applyFilter(that.cMenuDataItem, e.item.innerText)
              }
          }
        });
    } */

    private initToolTip() {
        $('.tooltipClass').mouseleave(function(e){
            $('.tooltipClass').removeAttr("style");
        });

        let timer;
        $("#accounts").on("mouseenter", "li span.k-in", function(event){
            if(event.buttons == 1) {
              //If left mouse button is down, i.e when drag is in process, do not show the tooltip
              return;
            }

            var inactive = "";
            if($(event.target).find('.folder').length){
                return;
            }

            $('.tooltipClass').html($('.tooltipClass').children());
            $('#inactive').remove();
            let treeview = $("#accounts").data("kendoTreeView");
            let tooltipName = treeview.dataItem(event.target).accountName;
            if(tooltipName == undefined){
                tooltipName = treeview.dataItem(event.target).displayName;
            }
            if(treeview.dataItem(event.target).isActive){
                inactive = "";
            } else {
                inactive = "<span id='inactive'>&nbsp-&nbspnot active</span>"
            }
            $('.tooltipClass').append(tooltipName + inactive);
            $('#tooltipButton').click(function(){
                var $temp = $("<input>");
                $("body").append($temp);
                $temp.val(tooltipName).select();
                document.execCommand("copy");
                $temp.remove();
                $('.tooltipClass').removeAttr("style");
            });
            timer = setTimeout(function(){
                const rect = event.target.getBoundingClientRect();
                $('.tooltipClass').css({
                  display: 'block',
                  top: `${rect.top+rect.height-5}px`,
                  left: `${event.pageX}px`});
            },400);
        });

        $("#accounts").on("mouseleave", "li span.k-in", function(event){
            clearTimeout(timer);
            if($(event.relatedTarget).attr("class") != "tooltipClass"){
                $('.tooltipClass').removeAttr("style");
            }
        });
    }

    private onNodeData(action) {
        const e = action.payload.event;
        const data = action.payload.data;
        const accTree = $("#accounts").data("kendoTreeView");
        const di = accTree.dataItem(e.node);

        //di will be null when this function will be called as a side effect when a node is expanded in AppResourcesComponent
        if(!di) {
          return;
        }

        const item = di._childrenOptions.data;
        item.items = data;
        item.expanded = true;

        data.forEach(ac => {//Dont display expand arrow for Individual accounts
            ac.isGroup = ac.accountType.toLowerCase() !== "person"
            if(ac.isGroup === false) {
                ac.hasChildren = false;
                ac.spriteCssClass = "person";
            }
            else {//For group, sub-group display expand arrow
                ac.hasChildren = true;
                ac.spriteCssClass = "group";
            }
        });

        let newDi = null;

        if(!di.accountType) {//its either ADB, AD or Individual node

            let index = accTree.dataSource.indexOf(di);
            accTree.dataSource.remove(di);
            newDi = accTree.dataSource.insert(index, item);

            //On expand, cache data for respective node as well
            let treeDataItem = this.treeData.find(
                item => item.displayName === di.displayName
            );
            treeDataItem.items = data;
        }
        else {//For sub group
            let node = $(e.node);
            let $li = accTree.insertAfter(item, node);
            accTree.remove(node);

            newDi = accTree.dataItem($li);
            //Cache the data so that when tree is reset, no need to fetch again
            node = findById(item.accountId, this.treeData);
            if(node) {
                node.items = data;
            }
        }

        newDi.children.filter(this.filter);
    }

    onSearchData(action) {
        //Since SEARCH action is used in MembersComponent, we ignore it if it was not
        //dispatched from this component
        if(action.source !== "AccountPanelComponent") {
          return;
        }

        const data = action.payload.data;
        const searchBox = document.getElementById("search-box");
        const resultBox = $("#search-results");
        resultBox.empty();

        this.recentCachedSearch = data;
        /*Display results according to the selected filter - either of All, Active or Inactive*/
        $.each(data, (index, item) => {
            const name = item.displayName;
            item.name = name;
            item.isGroup = item.accountType.toLowerCase() !== "person";

            const iconType = item.isGroup == true ? "group" : "person";
            const inactive = item.isActive == true ? "" : "inactive";
            let render = true;//This covers 'All' filter value

            //If the filter value is either Active or Inactive and item does not match the filter
            if(this.filter.value != null && item.isActive != this.filter.value){
              render = false;
            }

            if(render) {
              resultBox.append(
                `<li data-accountId="${item.accountId}">
                    <div class="icon ${iconType}"></div>
                    <span class="displayname ${inactive}">${name}</span>
                 </li>`
              );
            }
        });

        let display = data.length > 0 || searchBox["value"].trim() ? "block" : "none";
        resultBox.css("display",display);

        if(resultBox.children().length == 0 && display === "block"){
          resultBox.append(`<li id="no-result-item">No results found</li>`);
        }
    }

    onSearchError(action) {

    }

    reset(el:any) {
        el = $(el);
        el.val("");
        el.trigger("keyup");
        let lTree = $("#accounts").data("kendoTreeView");
        lTree.setDataSource(this.treeData);
        this.hideSearchResult();

        $("#clearBtn").removeAttr("style");
    }

    selectSearchItem(e:MouseEvent) {
        let el = <any>e.target;

        if(el.tagName !== "LI" && el.tagName !== "SPAN") {
            return;
        }

        if(el.tagName == "SPAN") {
          el = el.parentNode;
        }

        let id = el.dataset["accountid"];

        if(!id) {
          return;
        }

        let result = this.recentCachedSearch.find((item) => {
            return item.accountId == id;
        });

        let account = result;

        const accTree = $("#accounts").data("kendoTreeView");
        let parent = "ADB Groups";
        account.hasChildren = true;
        account.spriteCssClass = "group";

        if(account.accountType === "AD") {
            parent = "AD Groups";
        }
        //Individual or NA account(CME-6922 isue fix)
        else if(account.accountType.toLowerCase() === "person" || account.accountType === "NA") {
            parent = "Individuals";
            account.hasChildren = false;
            account.spriteCssClass = "person";
        }

        //Reset old search result
        this.searchData.forEach(item => {
            item.items = null;
            item.hasChildren = false;
        });

        let node = this.searchData[parent];
        node.items = [account];
        node.expanded = true;
        accTree.setDataSource(new kdata.HierarchicalDataSource({
            data: this.searchData
        }));

        $("#search-box").val(el.innerText);
        this.hideSearchResult();

        //Highlight Clear button indicating the filtered results
        $("#clearBtn").css("border", "2px solid rgba(255, 0, 0, 0.5)");
    }

    private hideSearchResult() {
        let resultBox = $("#search-results");
        resultBox.empty();
        //Fix for issue where the scroll position was retained on sub-sequent search
        resultBox.prop("scrollTop", 0);
        resultBox.css("display","none");
    }

    toggleFilterMenu(show) {
        const $filterMenu = $("#filter-menu");
        $filterMenu.css("display", show ? "block" : "none");
    }

    private applyFilter(dataItem,filterValue) {

      const accTree = $("#accounts").data("kendoTreeView");

      let expression:any = {
        field: "isActive",
        operator: "eq",
        value: filterValue.search("Active") != -1
      };

      if(filterValue == "All"){
        expression.operator = "notequals";
        expression.value = null;
      }

      this.filter = expression;

      const ds = accTree.dataSource;

      const filter = (children, exp) => {
        for(let item of children) {
          if(item.hasChildren && item.items.length) {
            if("children" in item){
              item.children.filter(exp);
            }

            if(item.items.length > 0){
              filter(item.items, exp);
            }
          }
        }
      }

      filter(ds.data(),expression);
    }

    private onMembersResult(action) {
      const { members } = action.payload.data;
      let { user } = this.stateService.getSelectedAccountInformation();

      let accTree = $("#accounts").data("kendoTreeView");
      let node$ = accTree.findByText(user.accountName)
      let di = accTree.dataItem(accTree.findByText(user.accountName));
      if(node$.length && di.items.length == 0) {
        members.forEach(item => {
          item.accountName = item.name;
          item.displayName = item.accountType == this.PERSON ? `${item.firstName} ${item.lastName}` : item.accountName;
        });

        let act = {
          payload: {
            data: members,
            event: {
              node: node$[0]
            }
          }
        }

        this.onNodeData(act);
        node$ = accTree.findByText(user.accountName);
        accTree.collapse(node$);
      }
    }

    private onAddNewAccount(action) {
      let newAc = action.payload;
      newAc.displayName = newAc.accountType == this.PERSON ? `${newAc.firstName} ${newAc.lastName}` : newAc.accountName;
      newAc.spriteCssClass = newAc.accountType == this.PERSON ? "person" : "group";
      newAc.hasChildren = newAc.accountType == this.PERSON ? false : true;
      //Temporarily set isActive to true untill the api is fixed
      newAc.isActive = true;
      if(newAc.hasChildren) {
        newAc.items = [];
      }

      let nodeText = "Individuals";
      if(newAc.accountType == this.ADGROUP) {
        nodeText = "AD Groups";
      }
      else if(newAc.accountType == this.ADBGROUP) {
        nodeText = "ADB Groups";
      }

      let onChange = (e) => {
        let accTree = $("#accounts").data("kendoTreeView");
        let di = accTree.dataItem(accTree.findByText(nodeText));
        if(di && di.items.length) {
          //unbind to avoid recursion
          accTree.unbind("dataBound", onChange);

          di.items.push(newAc);
          let newDi = di.items[di.items.length-1];
          let $li = accTree.findByUid(newDi.uid);
          $li[0].scrollIntoView(false);
        }
      };

      const accTree = $("#accounts").data("kendoTreeView");
      let di = accTree.dataItem(accTree.findByText(nodeText));

      if(!di.loaded()) {
        //To use expandPath(), id needs to be set
        di.id = di.accountId;
        accTree.bind("dataBound", onChange);
        accTree.expandPath([di.id]);
      }
      else {
        di.items.push(newAc);
      }
    }

    private onUpdateGroupMember(action) {
      let { accountName, member, addMember } = action.payload;
      const accTree = $("#accounts").data("kendoTreeView");
      let di = accTree.dataItem(accTree.findByText(accountName));

      //To Do - handle the use case where node is not expanded yet and a member is added/removed
      if(!di) {
        return;
      }

      if(addMember) {
        member.spriteCssClass = member.accountType == this.PERSON ? "person" : "group";
        member.hasChildren = member.accountType == this.PERSON ? false : true;

        if(!di.loaded()) {
          //ToDo - listen to dataBound and then add member
          accTree.expand(accTree.findByText(accountName));
        }

        accTree.append(member,accTree.findByText(accountName));
        //di.items.push(member);
      }
      else {
        let members = di.items;
        let itemToRemove = members.find(item => {
          return item.accountName == member.accountName;
        })

        if(itemToRemove) {
          members.remove(itemToRemove);
        }
      }
    }

    //Part of enhancement
    /* parentHasExcludedAccount(account, permissionNode) {
      let excludedAc = null;
      let permParent = permissionNode.parentNode();
      let parentNode = permParent.parentNode();

      let items = parentNode.loaded() ? parentNode.items : parentNode._childrenOptions.data.items;

      if(items && items.length) {
        let permission = items.find(i => i.resourceID == permissionNode.resourceID);
        let permChildren = [];

        if(permission) {
          permChildren = permission.loaded() ? permission.items : permission._childrenOptions.data.items;
        }

        if (permChildren && permChildren.length) {
          excludedAc = permChildren.find(i => {
            return i.accountType == "Person" && i.accountId == account.accountId && i.isExclude;
          })
        }
      }

      return excludedAc ? true : false;
    } */

    resetTreeAfterSaveAll(action) {

      this.treeData.forEach(item => {
        item.items = []//Force reload on expand
      });

      //Clear tree cache after save all so that latest data is fetched
      this.stateService.resetGroupChildrenMap();

      const accTree = $("#accounts").data("kendoTreeView");
      accTree.setDataSource(this.treeData);
    }

    ngOnDestroy() {
      if(this.rootAccSub) {
        this.rootAccSub.unsubscribe();
      }

      if(this.searchSub) {
        this.searchSub.unsubscribe();
      }
    }
}
