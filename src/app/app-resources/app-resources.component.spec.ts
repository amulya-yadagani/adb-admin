import { async, ComponentFixture, TestBed, tick, fakeAsync } from "@angular/core/testing";
import { By } from '@angular/platform-browser';
import { DebugElement } from "@angular/core";

import { AppResourcesComponent } from "./app-resources.component";
import { AppStateService } from "../state/app-state.service";
import { APP_LIST_RESULT, APP_RESOURCES_RESULT } from "../state/actions";
import { ACCOUNT_ALL, ACCOUNT_ACTIVE } from "../utils/constants";

describe("AppResourcesComponent", () => {
  let comp: AppResourcesComponent;
  let fixture: ComponentFixture<AppResourcesComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let stateService: AppStateService;
  let $ = null;
  //Since angular does not add kendo components, add them
  let createMenuUL = ($) => {
    $(document.body).append(`<ul id="context-menu"></ul>`);
  };
  let removeMenuUL = ($) => {
    $("#context-menu").remove();
  };
  let loadTreeData = (service) => {
    if(!service) {
      return;
    }

    const act = {
      type: APP_LIST_RESULT,
      payload: {
        data: treeData
      }
    }

    service.dispatch(act);
  }
  let contextMenuLi = (option) => {
    let menuUl = document.body.querySelector("#context-menu");
    let list = Array.from(menuUl.childNodes);
    let li = list.find((element) => {
      return element.textContent == option;
    });
    return li;
  }
  const treeData:any = [
    {
        "name": "CircManagerNet",
        "spriteCssClass": "application"
    },
    {
        "name": "ADBAdmin",
        "spriteCssClass": "application",
        "items": [
          {
              "name": "ADBAdministrator",
              "spriteCssClass": "permission",
              "items": [
                {
                  "accountId": "10",
                  "accountName": "Active account 1",
                  "name": "Active account 1",
                  "isActive": true,
                  "isGroup": false,
                  "accountType": "Person"
                },
                {
                  "accountId": "12",
                  "accountName": "Active account 3",
                  "name": "Active account 3",
                  "isActive": true,
                  "isGroup": false,
                  "accountType": "Person"
                },
                {
                  "accountId": "15",
                  "accountName": "Group 1",
                  "name": "Group 1",
                  "isActive": true,
                  "isGroup": true,
                  "accountType": "ADB",
                  "items": [
                    {
                      "accountId": "120",
                      "accountName": "Bob Smith",
                      "name": "Bob Smith",
                      "isActive": true,
                      "isGroup": false,
                      "accountType": "Person"
                    }
                  ]
                }
              ]
          },
          {
              "name": "ADBDeveloper",
              "spriteCssClass": "permission"
          },
          {
              "name": "ADBAdministratoR",
              "spriteCssClass": "role",
              "items": [
                {
                  "accountId": "11",
                  "accountName": "Active account 2",
                  "name": "Active account 2",
                  "isActive": true,
                  "isGroup": false,
                  "accountType": "Person"
                },
                {
                  "accountId": "12",
                  "accountName": "Active account 3",
                  "name": "Active account 3",
                  "isActive": true,
                  "isGroup": false,
                  "accountType": "Person"
                }
              ]
          },
          {
              "name": "ADBDeveloper",
              "spriteCssClass": "role"
          }
      ]
    },
    {
        "name": "JobTrackerTAG",
        "spriteCssClass": "application"
    },
    {
        "name": "CircManagerRestriction",
        "spriteCssClass": "application"
    },
    {
        "name": "CircManagerNetExt",
        "spriteCssClass": "application"
    },
    {
        "name": "CircManagerNetIntl",
        "spriteCssClass": "application"
    },
    {
        "name": "AuthorizationCampaign",
        "spriteCssClass": "application"
    },
    {
        "name": "DMCampaign",
        "spriteCssClass": "application"
    }
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppResourcesComponent],
      providers: [AppStateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppResourcesComponent);
    comp = fixture.componentInstance;
    $ = window["jQuery"];
    de = fixture.debugElement.query(By.css("div"));
    el = de.nativeElement;
    stateService = fixture.debugElement.injector.get(AppStateService);
    createMenuUL($);
  });

  afterEach(() => {
    removeMenuUL($);
  });

  it("should be defined", () => {
    expect(comp).toBeDefined();
  });

  it("should display applications nodes", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let li = el.querySelectorAll("li");
    expect(li.length).toEqual(treeData.length);
  });

  it("should not show custom context menu on right click of root node", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin")
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    let nodeLi = adbNode.find("li")[0];
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let menuUl = document.body.querySelector("#context-menu");
    expect(menuUl["style"].display).toEqual("none");
  });

  it("should show context menu on right click of person node", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    let nodeLi = appTree.findByText("Active account 1")[0];
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let menuUl = document.body.querySelector("#context-menu");
    expect(menuUl["style"].display).not.toEqual("none");
  });

  it("should show context menu on right click of group node", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    let nodeLi = appTree.findByText("Group 1")[0];
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let menuUl = document.body.querySelector("#context-menu");
    expect(menuUl["style"].display).not.toEqual("none");
  });

  it("should show context menu on right click of person node with no Paste option", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    let nodeLi = adbNode.find("li")[0];
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let menuUl = document.body.querySelector("#context-menu");
    let pasteOption = $(`#context-menu > li:contains(Paste)`)
    expect(pasteOption.css("display")).toEqual("none");
  });

  it("should not show context menu on right click of permission node when no node is copied/cut", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin")
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);

    adbNode = appTree.findByText("ADBAdministrator");
    adbNode[0].dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let menuUl = document.body.querySelector("#context-menu");
    expect(menuUl["style"].display).toEqual("none");
  });

  it("should show context menu on right click of permission node when a node is copied", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin")
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand permission node
    let nodeLi = adbNode.find("li")[0];
    //Simulate right click on account node
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let li = contextMenuLi("Copy");

    //Simulate click on Copy option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    ////Simulate right click on Adb Administrator permission node
    adbNode[0].dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let element = contextMenuLi("Paste");

    //Only Paste option to be displayed for permission node
    expect(element["style"].display).not.toEqual("none");
  });

  it("should show context menu on right click of role node when a node is copied", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin")
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand permission node
    let nodeLi = adbNode.find("li")[0];
    //Simulate right click on person node
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let li = contextMenuLi("Copy");

    //Simulate click on Copy option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    adbNode = appTree.findByText("ADBAdministratoR");
    //Simulate right click on Adb AdministratoR role node
    adbNode[0].dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let element = contextMenuLi("Paste");

    //Only Paste option to be displayed for permission node
    expect(element["style"].display).not.toEqual("none");
  });

  it("should remove the account when Delete option is selected on right click of account", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin")
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand permission node

    let account = appTree.findByText("Active account 1")[0];
    //Simulate right click on person node
    account.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let li = contextMenuLi("Delete");

    //Mock window.confirm() to avoid making js wait
    window.confirm = (msg) => {return true};
    //Simulate click on Delete option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    adbNode = appTree.findByText("ADBAdministrator");
    expect(adbNode.find("li:contains('Active account 1')").length).toEqual(0);
  });

  it("should move account when Cut option is selected on right click of account and then Pasted under a permission node", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    let roleNode = appTree.findByText("ADBAdministratoR");
    appTree.dataItem(roleNode).load();
    appTree.expand(roleNode);//Expand role node
    let roleAccEl = appTree.findByText("Active account 2")[0];

    //Simulate right click on account node
    roleAccEl.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let li = contextMenuLi("Cut");

    //Simulate click on Cut option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    //Simulate right click on Adb Administrator permission node
    appTree.findByText("ADBAdministrator")[0].dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    li = contextMenuLi("Paste");
    //Simulate click on Paste option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    roleNode = appTree.findByText("ADBAdministratoR");
    let permissionNode = appTree.findByText("ADBAdministrator");
    let nodeRemoved = roleNode.find("li:contains('Active account 2')").length == 0;
    let nodeAdded = permissionNode.find("li:contains('Active account 2')").length == 1;
    expect(nodeRemoved && nodeAdded).toBeTruthy();
  });

  it("should move account when Copy option is selected on right click of account and then Pasted under a permission node", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    let roleNode = appTree.findByText("ADBAdministratoR");
    appTree.dataItem(roleNode).load();
    appTree.expand(roleNode);//Expand role node
    let roleAccEl = appTree.findByText("Active account 2")[0];

    //Simulate right click on account node
    roleAccEl.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let li = contextMenuLi("Copy");

    //Simulate click on Copy option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    let permissionNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(permissionNode).load();
    appTree.expand(permissionNode);//Expand root node
    //Simulate right click on Adb Administrator permission node
    permissionNode[0].dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    li = contextMenuLi("Paste");
    //Simulate click on Paste option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    roleNode = appTree.findByText("ADBAdministratoR");
    permissionNode = appTree.findByText("ADBAdministrator");
    let nodeThere = roleNode.find("li:contains('Active account 2')").length == 1;
    let nodeAdded = permissionNode.find("li:contains('Active account 2')").length == 1;
    expect(nodeThere && nodeAdded).toBeTruthy();
  });

  it("should show context menu on right click of permission node when a node is cut", () => {
    fixture.detectChanges();

    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin")
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    adbNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand permission node
    let nodeLi = adbNode.find("li")[0];
    //Simulate right click on person node
    nodeLi.dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let li = contextMenuLi("Cut");

    //Simulate click on Cut option
    li.dispatchEvent(new MouseEvent("click", {
      bubbles: true
    }));

    ////Simulate right click on Adb Administrator permission node
    adbNode[0].dispatchEvent(new CustomEvent("contextmenu",{
      bubbles: true
    }));

    let element = contextMenuLi("Paste");

    //Only Paste option to be displayed for permission node
    expect(element["style"].display).not.toEqual("none");
  });

  it("should allow drop under permission node", () => {
    fixture.detectChanges();
    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    let permissionNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(permissionNode).load();
    appTree.expand(permissionNode);

    let evt = {
      statusClass: "",
      setStatusClass: function(value){
        this.statusClass = value
      },
      dropTarget: permissionNode.find("span.k-in")[0],
    }

    appTree.trigger("drag",evt);
    //statusClass should not be set to k-i-cancel
    expect(evt.statusClass).toEqual("");
  });

  it("should allow drop under role node", () => {
    fixture.detectChanges();
    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    let roleNode = appTree.findByText("ADBAdministratoR");
    appTree.dataItem(roleNode).load();
    appTree.expand(roleNode);

    let evt = {
      statusClass: "",
      setStatusClass: function(value){
        this.statusClass = value
      },
      dropTarget: roleNode.find("span.k-in")[0],
    }

    appTree.trigger("drag",evt);
    //statusClass should not be set to k-i-cancel
    expect(evt.statusClass).toEqual("");
  });

  it("should not allow drop under other nodes (except role and permission)", () => {
    fixture.detectChanges();
    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    let otherNode = appTree.findByText("JobTrackerTAG");
    appTree.dataItem(otherNode).load();
    appTree.expand(otherNode);

    let evt = {
      statusClass: "",
      setStatusClass: function(value){
        this.statusClass = value
      },
      dropTarget: otherNode.find("span.k-in")[0],
    }

    appTree.trigger("drag",evt);
    //statusClass should be set to k-i-cancel
    expect(evt.statusClass).toEqual("k-i-cancel");
  });

  it("should not allow adding duplicate account when droping", () => {
    fixture.detectChanges();
    loadTreeData(stateService);

    let appTree = $("#applications").data("kendoTreeView");
    let adbNode = appTree.findByText("ADBAdmin");
    appTree.dataItem(adbNode).load();
    appTree.expand(adbNode);//Expand root node

    let permissionNode = appTree.findByText("ADBAdministrator");
    appTree.dataItem(permissionNode).load();
    appTree.expand(permissionNode);

    let roleNode = appTree.findByText("ADBAdministratoR");
    appTree.dataItem(roleNode).load();
    appTree.expand(roleNode);

    let permAccNode = appTree.findByText("Active account 3");

    let evt = {
      type: "drop",
      valid: true,
      sourceNode: permAccNode[0],
      destinationNode: roleNode[0],
      dropPosition: "over",
      setValid:function(value) {
        this.valid = value;
      }
    }

    appTree.trigger("drop",evt);

    //The valid flag should be set to false to avoid duplicate entry
    expect(evt.valid).toEqual(false);
  });
});
