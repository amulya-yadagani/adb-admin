import { Component, OnInit, Input } from '@angular/core';
import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";
import { AppStateService } from '../state/app-state.service';
import "@progress/kendo-ui/js/kendo.multiselect.js";
import "@progress/kendo-ui/js/kendo.grid.js";
import "@progress/kendo-ui/js/kendo.treeview.js";
import "@progress/kendo-ui/js/kendo.menu.js";
import "@progress/kendo-angular-dialog";
import { AFTER_SAVE_ALL_RESET, RES_MANAGER_APPEND, REMOVE_RESOURCE, REMOVE_NEW_APP, ACCOUNT_STATE_CHANGED, DELETE_NODE, APPEND_NODE } from '../state/actions';
import {
  initialAppState, newAppResources, RESOURCE_IMGS, RES_TREEVIEW_DEL_CANCEL, RES_TREEVIEW_DEL_OK, DEL_RES_ROW, DEL_RESTYPE_ROW,
  RES_NAME_VALIDATION,
  RES_TYPE_NAME_VALIDATION,
  RES_TYPE_IMAGE_VALIDATION,
  RES_TYPE_IMAGE_DUPLICATE,
  TARGET_VALIDATION
} from '../utils/constants';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { getAllTreeItems } from "../utils/parser-util";
let $ = null;

@Component({
  moduleId: module.id,
  selector: 'adb-resource',
  templateUrl: 'resource.component.html',
  styleUrls: ['resource.component.scss']
})

export class ResourceComponent implements OnInit {
  @Input() title: string = "Resource";
  applicationId;
  copiedData;
  resourceType;
  resourceTypeTargets;
  resTypeMap;
  resTypeImageMap;
  resTypeTargetMap;
  resTypeTargetImageMap;
  resTargetData = {};
  targets;
  initialSaveState;
  targetData = [];
  targetDataAll = [];
  allTargets = [];
  newAppData;

  constructor(private dialogService: DialogService, private stateService: AppStateService) {
    this.stateService.subscribe(AFTER_SAVE_ALL_RESET, this.resetTreeAfterSaveAll.bind(this));
    this.stateService.subscribe(ACCOUNT_STATE_CHANGED, this.accountStateChanged.bind(this))
    $ = window["jQuery"];
  }

  getResourcesData(resources) {
    let resourcesData = JSON.parse(JSON.stringify(resources));
    let dataSource = new kdata.DataSource({
      data: resourcesData,
      schema: {
        model: {
          id: "resourceId",
          fields: {
            "resourceTypeId": {

            },
            "imageFile": {
              editable: false
            },
            "name": {
              type: "string",
              validation: {
                required: true,
                resourceNamePattern: function (e) {
                  if (e.is("[name='name']") && e.val().trim() == "") {
                    e.attr("data-resourceNamePattern-msg", "Name is invalid")
                    return false;
                  }
                  return true;
                },
                resourceNameValidation: function (e) {
                  let grid = $("#k-ui-r-grid").data("kendoGrid");
                  let options = grid.getOptions();
                  if (e.is("[name='name']") && e.val() != "") {
                    let count = 0;
                    let type = $("input[name='resourceTypeName']").val();
                    let d = options.dataSource.data.find(item => {
                      if (item.name.toLocaleLowerCase() == e.val().toLocaleLowerCase() && type == item.resourceTypeName) {
                        count++;
                      }
                    })
                    e.attr("data-resourceNameValidation-msg", RES_NAME_VALIDATION)
                    return !(count > 1);
                  }
                  return true;
                }
              }
            },
            "resourceTypeName": {
              type: "string",
              validation: {
                required: true,
                resTypeValidation: function (item) {
                  let grid = $("#k-ui-r-grid").data("kendoGrid");
                  let options = grid.getOptions();
                  if (item.is("[name='resourceTypeName']") && item.val() != "") {
                    let count = 0;
                    options.dataSource.data.find(i => {
                      if (item.val() == "Application" && i.resourceTypeName == item.val()) {
                        count++;
                      }
                    });
                    item.attr("data-resTypeValidation-msg", "Application Type should be unique within Resources")
                    return !(count > 0);
                  }
                  return true;
                }
              }
            },
            "description": {

            }
          }
        },
      }
    });
    let grid = $("#k-ui-r-grid").data("kendoGrid");

    if (grid) {
      grid.setDataSource(dataSource);
      grid['name'] = 'Resources';
    }
  }

  getResourcesTypesData(resourceTypes, resourceTypeTargets) {
    let that = this;
    this.resourceTypeTargets = JSON.parse(JSON.stringify(resourceTypeTargets));
    this.resourceType = JSON.parse(JSON.stringify(resourceTypes));
    this.getAllMaps(this.resourceType, this.resourceTypeTargets);
    let dataSource = new kdata.DataSource({
      data: this.resourceType,
      schema: {
        model: {
          id: "resourceTypeId",
          fields: {
            "name": {
              type: "string",
              validation: {
                required: true,
                resourceTypeNamePattern: function (e) {
                  if (e.is("[name='name']") && e.val().trim() == "") {
                    e.attr("data-resourceTypeNamePattern-msg", "Name is invalid")
                    return false;
                  }
                  return true;
                },
                nameValidation: function (e) {
                  let grid = $("#k-ui-rt-grid").data("kendoGrid");
                  let options = grid.getOptions();
                  if (e.is("[name='name']") && e.val() != "") {
                    let count = 0;
                    let d = options.dataSource.data.find(item => {
                      if (item.name.toLocaleLowerCase() == e.val().toLocaleLowerCase()) {
                        count++;
                      }
                    })
                    e.attr("data-nameValidation-msg", RES_TYPE_NAME_VALIDATION)
                    return !(count > 1);
                  }
                  return true;
                }
              }
            },
            "img": {
              editable: false
            },
            "imageFile": {
              validation: {
                required: true,
                imgValidation: function (item) {
                  let grid = $("#k-ui-rt-grid").data("kendoGrid");
                  let options = grid.getOptions();
                  if (item.is("[name='imageFile']")) {
                    if (!(item.val())) {
                      item.attr("data-imgValidation-msg", RES_TYPE_IMAGE_VALIDATION);
                      return false;
                    } else {
                      let count = 0;
                      let d = options.dataSource.data.find(i => {
                        if (i.imageFile == item.val()) {
                          count++;
                        }
                      });
                      item.attr("data-imgValidation-msg", RES_TYPE_IMAGE_DUPLICATE)
                      return !(count > 1);
                    }
                  }
                  return true;
                }
              }
            },
            "targets": {
              validation: {
                targetValidation: function (item) {
                  let imageFile = "";
                  let targets = [];
                  let checkRoleTarget = false;
                  if (item.is("[name='targets']")) {
                    let ms = item.data("kendoMultiSelect");
                    targets = ms.value();
                    imageFile = $("input[name='imageFile']").val();
                    if (imageFile && targets.length) {
                      let check = targets.some(function (ele) {
                        return ele == 'Permission' || ele == 'Role';
                      });
                      if (imageFile == "Role.png" && !(targets.length == 1 && targets.includes("Application"))) {
                        checkRoleTarget = true;
                      }
                      if (check || checkRoleTarget) {
                        item.attr("data-targetValidation-msg", TARGET_VALIDATION);
                        return false;
                      } else {
                        return true;
                      }
                    }
                  }
                  return true;
                }
              }
            }
          }
        }
      }
    });

    let grid = $("#k-ui-rt-grid").data("kendoGrid");

    if (grid) {
      grid.setDataSource(dataSource);
      grid['name'] = "Resource Types";
    }
  }

  ngOnInit() {
    var that = this;
    this.initialSaveState = $("button#saveAll.cust-header-nav-btn").attr("disabled");
    $("#k-ui-rt-grid").kendoGrid({
      noRecords: true,
      selectable: true,
      resizable: true,
      sortable: true,
      height: 250,
      columns: [{
        title: " ",
        template: function (dataItem) {
          if (dataItem.imageFile) { let img = dataItem.imageFile.replace(".png", "").toLocaleLowerCase(); return "<span id='rtImg' class=" + img + "></span>" } else { dataItem.imageFile = ""; return "" }
        },
        width: 50,
      }, {
        field: "name",
        title: "Name",
        width: 100,
      }, {
        field: "imageFile",
        title: "Image File",
        editor: this.imgDropDownEditor.bind(this),
        template: function (dataItem) { if (dataItem.imageFile) { return dataItem.imageFile } else { dataItem.imageFile = ""; return "" } },
        width: 100
      }, {
        field: "targets",
        title: "Targets",
        editor: this.targetMultiSelectEditor.bind(this),
        template: function (dataItem) { if (dataItem.targets) { return dataItem.targets.join(',') } else { return "" } },
        width: 200
      },
      {
        command: [{ name: "edit", iconClass: "k-icon k-i-edit", text: "", visible: function (dataItem) { if (dataItem.name == "Application") { return false } else { return true } } },
        {
          name: "remove", iconClass: "k-icon k-i-delete", text: "",
          click: function (e) {
            e.preventDefault();
            let tr = $(e.target).closest("tr");
            let di = this.dataItem(tr);
            let grid = $("#k-ui-r-grid").data("kendoGrid");
            let data = grid.dataSource.data();
            var res = $.grep(data, function (d) {
              return d.resourceTypeId == di.resourceTypeId;
            });
            if (res.length) {
              let dialog = that.dialogService.open({
                title: "Info",
                content: DEL_RESTYPE_ROW
              });
            } else {
              let dialog = that.dialogService.open({
                title: "Confirm",
                content: "Deleting this resource type will also remove it as target for other resource types wherever it is used. Do you want to continue?",
                actions: [
                  { text: "Yes", primary: true },
                  { text: "No" }
                ],
                //width: 200
              });

              dialog.result.subscribe((result) => {
                if (result["text"] == "Yes") {
                  di.state = "Deleted";
                  let targetsCopy = [];
                  let targets;
                  let resourceTypeTargets = $.grep(that.resourceTypeTargets, function (item) {
                    return di.resourceTypeId == item.sourceResourceTypeId
                  })
                  targetsCopy = resourceTypeTargets.slice();
                  for (let i = resourceTypeTargets.length - 1; i >= 0; i--) {
                    if (resourceTypeTargets[i].state == "Added") {
                      resourceTypeTargets.splice(i, 1);
                    } else {
                      resourceTypeTargets[i].state = "Deleted"
                    }
                  }
                  that.stateService.addResourceType(di);
                  that.stateService.addResourceTypeMapping(resourceTypeTargets);
                  that.stateService.enableSaveAllBtn(true);
                  this.dataSource.remove(di);
                }
              });
            }
          }
        }],
        width: 120
      }],
      editable: "popup",
      edit: function (e) {
        that.popupChanges(e);
        e.container.getKendoValidator().bind("validate", function (e) {
          if (!e.valid) {
            let targetValidationDiv = $("div[data-for='targets'].k-tooltip-validation");
            let imgValidationDiv = $("div[data-for='imageFile'].k-tooltip-validation");
            if (targetValidationDiv.length) {
              $("div[data-container-for='targets']").append(targetValidationDiv);
            }
            if (imgValidationDiv.length) {
              $("div[data-container-for='imageFile']").append(imgValidationDiv);
            }
          }
        });

        if (!(e.model.isNew())) {
          that.resTargetData["applicationId"] = that.applicationId;
          that.resTargetData["sourceResourceTypeId"] = e.model.resourceTypeId;
          e.container.find("input[name='name']").attr("disabled", "disabled");
        } else {
          e.model.resourceTypeId = that.stateService.counter;
          that.resTargetData["applicationId"] = that.applicationId;
          that.resTargetData["sourceResourceTypeId"] = e.model.resourceTypeId;
          e.container.find("input[name='name']").removeAttr("disabled")
        }
      },
      save: function (e) {
        e.model.applicationId = that.applicationId;
        if (e.model.id && e.model.state != "Added") {
          e.model.state = "Modified";
        } else {
          e.model.state = "Added";
        }
        let rtData = {
          applicationId: e.model.applicationId,
          imageFile: e.model.imageFile,
          name: e.model.name,
          resourceTypeId: e.model.resourceTypeId,
          state: e.model.state
        }
        that.stateService.addResourceType(rtData);
        that.stateService.enableSaveAllBtn(true);
        that.stateService.resourceTypeData.forEach(item => {
          if (item) {
            let exists = that.resourceType.findIndex(i => i.resourceTypeId == item.resourceTypeId);
            if (exists > -1) {
              that.resourceType.splice(exists, 1)
              that.resourceType.push(item)
            } else {
              that.resourceType.push(item)
            }
          }
        });
        that.stateService.addResourceTypeMapping(that.targetData)
        that.allTargets = JSON.parse(JSON.stringify(that.targetDataAll));
        that.allTargets.forEach(item => {
          if (item) {
            let exists = that.resourceTypeTargets.findIndex(i => ((i.sourceResourceTypeId == item['sourceResourceTypeId']) && (i.targetResourceTypeId == item['targetResourceTypeId'])));
            if (exists > -1) {
              that.resourceTypeTargets.splice(exists, 1)
              if (item.state == "Added") {
                that.resourceTypeTargets.push(item)
              }
            } else {
              that.resourceTypeTargets.push(item)
            }
          }
        });
        that.getAllMaps(that.resourceType, that.resourceTypeTargets);
      },
      cancel: function (e) {
        that.targetData = JSON.parse(JSON.stringify(that.stateService.ResourceTypeMapping));
        that.targetDataAll = JSON.parse(JSON.stringify(that.allTargets));
      },
      toolbar: [{ name: "create", iconClass: "k-icon k-i-create", text: "" }]
    });

    $("#k-ui-r-grid").kendoGrid({
      height: 250,
      noRecords: true,
      selectable: true,
      resizable: true,
      filterable: true,
      sortable: true,
      columns: [{
        field: "resourceTypeId",
        hidden: true
      }, {
        title: " ",
        field: "imageFile",
        filterable: false,
        template: function (dataItem) { if (dataItem.imageFile) { let img = dataItem.imageFile.replace(".png", "").toLocaleLowerCase(); return "<span id='rtImg' class=" + img + "></span>" } else { dataItem.imageFile = ""; return "" } },
        width: 50
      }, {
        field: "resourceTypeName",
        title: "Type",
        template: function (dataItem) { return dataItem.resourceTypeName },
        filterable: { multi: true },
        editor: this.typeDropDownEditor.bind(this),
        width: 100
      }, {
        field: "name",
        title: "Name",
        filterable: false,
        width: 100
      }, {
        field: "description",
        title: "Description",
        filterable: false,
        width: 120
      },
      {
        command: [{ name: "edit", iconClass: "k-icon k-i-edit", text: "", visible: function (dataItem) { if (dataItem.resourceTypeName == "Application") { return false } else { return true } } },
        {
          name: "remove", iconClass: "k-icon k-i-delete", text: "",
          visible: function (dataItem) {
            if (dataItem.name == "ADBDeveloper" || dataItem.name == "ADBAdministrator") {
              return false
            } else {
              return true
            }
          },
          click: function (e) {
            e.preventDefault();
            var tr = $(e.target).closest("tr");
            var data = this.dataItem(tr);
            var treeview = $("#childTree").data("kendoTreeView");
            if (data.imageFile == "Application.png") {
              var text = treeview.findByText(data.name);
            } else {
              var di = treeview.dataSource.get(data.resourceId);
            }
            if ((text && text.length) || di) {
              let dialog = that.dialogService.open({
                title: "Delete Resource",
                content: DEL_RES_ROW
              });
            } else {
              let dialog = that.dialogService.open({
                title: "Confirm",
                content: "Do you want to Delete this Resource?",
                actions: [
                  { text: "Yes", primary: true },
                  { text: "No" }
                ]
              });

              dialog.result.subscribe((result) => {
                if (result["text"] == "Yes") {
                  data.state = "Deleted";
                  let resData = JSON.parse(JSON.stringify(data))
                  that.stateService.addResources(resData);
                  that.stateService.enableSaveAllBtn(true);
                  this.dataSource.remove(data);
                }
              });
            }
          }
        }],
        width: 120
      }],
      editable: "popup",
      edit: function (e) {
        let typeDrpdown = $("#typeDropDownList").data("kendoDropDownList");
        that.popupChanges(e);
        e.container.getKendoValidator().bind("validate", function (e) {
          if (!e.valid) {
            let typeValidationDiv = $("div[data-for='resourceTypeName'].k-tooltip-validation");
            if (typeValidationDiv.length) {
              $("div[data-container-for='targets']").append(typeValidationDiv);
            }
          }
        });
        e.container.find(".k-edit-label:first").hide();
        e.container.find(".k-edit-field:first").hide();
        if (!e.model.isNew()) {
          e.container.find("input[name='name']").attr("disabled", "disabled");
          typeDrpdown.enable(false)
        } else {
          e.model.resourceId = that.stateService.counter;
          e.container.find("input[name='name']").removeAttr("disabled");
          typeDrpdown.enable(true);
        }

      },
      save: function (e) {
        e.model.applicationId = that.applicationId;
        if (e.model.id && e.model.state != "Added") {
          e.model.state = "Modified";
        } else {
          e.model.state = "Added";
          e.model.resourceTypeId = that.getKeyByValue(that.resTypeMap, e.model.resourceTypeName);
        }
        let data = JSON.parse(JSON.stringify(e.model));
        that.stateService.addResources(data);
        that.stateService.enableSaveAllBtn(true);
      },
      toolbar: [{ name: "create", iconClass: "k-icon k-i-create", text: "" }]
    });

    (function (appId, stateService, newApp) {
      const resTypeGrid = $("#k-ui-rt-grid").data("kendoGrid");
      const resGrid = $("#k-ui-r-grid").data("kendoGrid");
      let rtColumns = resTypeGrid.columns;
      let rColumns = resGrid.columns;
      if (appId < 0) {
        that.getResourcesTypesData(newAppResources.resourceTypes, newAppResources.resourceTypeTargets)
        that.getResourcesData(newAppResources.resources)
        $('#k-ui-rt-grid .k-grid-toolbar  a.k-grid-add').attr("disabled", "disabled")
        $('#k-ui-r-grid .k-grid-toolbar  a.k-grid-add').attr("disabled", "disabled")
        resTypeGrid.hideColumn(rtColumns.length - 1)
        resGrid.hideColumn(rColumns.length - 1)
      } else {
        let data = stateService.getAppDetails(appId);
        that.getResourcesData(data.resources);
        that.getResourcesTypesData(data.resourceTypes, data.resourceTypeTargets);
        $('#k-ui-rt-grid .k-grid-toolbar  a.k-grid-add').removeAttr("disabled")
        $('#k-ui-r-grid .k-grid-toolbar  a.k-grid-add').removeAttr("disabled")
        resTypeGrid.showColumn(rtColumns.length - 1)
        resGrid.showColumn(rColumns.length - 1)
      }
    })(this.applicationId, this.stateService, this.newAppData);

    if (this.stateService.isAdminRole) {
      let grid = $('#k-ui-rt-grid').data('kendoGrid');

      if (grid) {
        const { columns } = grid.getOptions();
        grid.hideColumn(columns.length - 1);

        let $addBtn = grid.element.find(".k-grid-add");
        $addBtn.attr("disabled", "");
      }
    }

    var height = $('.tab-container#grid').height() - 35;
    $('#k-ui-rt-grid').css("height", height);
    $('#k-ui-r-grid').css("height", height);
    $('#k-ui-r-grid .k-grid-content').css("height", height - 43 - 36);
    $("a[data-target='#k-ui-r-grid'").click(function (e) {
      let grid = $("#k-ui-r-grid").data("kendoGrid");
      grid.dataSource.sync()
    })

    $("#k-ui-r-grid").kendoDraggable({
      filter: "tr.k-state-selected",
      autoScroll: true,
      container: $("#manager-panel"),
      hint: function () {
        let grid = $("#k-ui-r-grid").data("kendoGrid");
        let data = grid.dataItem(grid.select());
        let hintElement = $("<div class='k-header k-drag-clue'><span id='icon' class='k-icon k-drag-status k-i-cancel'></span>" + data.name + '-' + data.description + " </div>");
        return hintElement;
      },
      cursorOffset: { top: 0, left: 9 }
    });

    $("#childTree").kendoDropTargetArea({
      filter: ".k-item",
      dragenter: function (e) {
        var json = that.droptargetOnDrop(e);
        if (json != undefined) {
          $(e.draggable.hint).find('span#icon').addClass('k-i-cancel');
          $(e.draggable.hint).find('span#icon').removeClass('k-i-add');
          if (json.targets.includes(Number(json.targetResTypeId)) && !(json.tresourceMappingIds.includes(json.gridData.resourceId))) {
            if ((json.gridData.resourceTypeName == "Permission" && (json.gridData.name == "ADBAdministrator" || json.gridData.name == "ADBDeveloper") && json.treeData.spriteCssClass != "application")) {
              return;
            }
            $(e.draggable.hint).find('span#icon').removeClass('k-i-cancel');
            $(e.draggable.hint).find('span#icon').addClass('k-i-add');
          }
        }
      },
      drop: function (e) {
        var json = that.droptargetOnDrop(e);
        if (json) {
          let treeData = json.treeView.dataItem(e.dropTarget);
          let exists = false;
          while (treeData) {
            if (json.gridData.name == treeData.name && json.gridData.description == treeData.description && json.gridData.resourceTypeName == treeData.resourceTypeName) {
              exists = true;
              break;
            }
            treeData = treeData.parentNode()
          }
          if (json.targets.includes(Number(json.targetResTypeId)) && !(json.tresourceMappingIds.includes(json.gridData.resourceId))) {
            if ((json.gridData.resourceTypeName == "Permission" && (json.gridData.name == "ADBAdministrator" || json.gridData.name == "ADBDeveloper") && json.treeData.spriteCssClass != "application")) {
              return;
            }
            if (exists) {
              return;
            }

            let srcJson = {
              applicationId: json.treeData.applicationId,
              name: json.gridData.name,
              description: json.gridData.description,
              spriteCssClass: json.gridData.imageFile.replace(".png", "").toLocaleLowerCase(),
              imageFile: json.gridData.imageFile,
              resourceID: json.gridData.resourceId,
              resourceMappingId: that.stateService.counter,
              parentResourceMappingid: json.treeData.resourceMappingId,
              resourceTypeName: json.gridData.resourceTypeName,
              resourceTypeId: json.gridData.resourceTypeId,
              hasChildren: false,
              isExcluded: false,
              state: 'Added'
            }
            json.treeView.append(srcJson, $(e.dropTarget));
            that.detachAccounts(getAllTreeItems(json.treeView))
            that.stateService.addAppResources(srcJson)
            that.stateService.dispatch({
              type: APPEND_NODE,
              state: "append",
              payload: srcJson
            })
            that.stateService.enableSaveAllBtn(true);
          }
        }
      },
    });

    $("#resources-context-menu").kendoContextMenu({
      target: "#childTree",
      filter: "span.k-in",
      dataSource: [
        {
          text: "Delete",
          cssClass: "cmDelete",
        },
        {
          //Copy/Paste functionality is dropped for now. It will be implemented in phase 2
          text: "Copy",
          cssClass: "cmCopy",
        }
      ],
      animation: {
        open: {
          effects: "slideIn:down"
        }
      },
      open: function (e) {
        var treeview = $("#childTree").data("kendoTreeView");
        let targetData = treeview.dataItem(e.target);
        let node = targetData
        if ($(e.target).find("span.application").length || targetData.name == "ADBAdministrator" || targetData.name == "ADBDeveloper") {
          this.enable(".cmCopy", false);
          this.enable(".cmDelete", false);
        } else {
          this.enable(".cmCopy", true);
          this.enable(".cmDelete", true);
        }
        //Copy/Paste functionality is dropped for now. It will be implemented in phase 2
        if (that.copiedData) {
          let key = that.getKeyByValue(that.resTypeMap, that.copiedData.resourceTypeName)
          let img_list = that.resTypeTargetImageMap[key];
          let targetResourceMappingId = [];
          let exists = false;
          while (node) {
            if (that.copiedData.name == node.name && that.copiedData.description == node.description
              && that.copiedData.resourceTypeName == node.resourceTypeName) {
              exists = true;
              break;
            }
            node = node.parentNode()
          }
          if (exists) {
            if (($("ul#resources-context-menu li.cmPaste").length)) {
              this.remove($('li.cmPaste'));
            }
            return;
          }
          if (targetData.items) {
            targetData.items.forEach((v) => { targetResourceMappingId.push(v.resourceID) })
          }
          if (targetData && img_list && (img_list.includes(targetData.spriteCssClass.toLocaleLowerCase()))
            && !(targetResourceMappingId.includes(that.copiedData.resourceID))) {
            if (e.item && !($(e.item[0]).find("li.cmPaste").length)) {
              this.insertAfter([{
                text: "Paste",
                cssClass: "cmPaste"
              }], "li.cmCopy");
            }
          } else {
            this.remove($('li.cmPaste'));
          }
        }
      },
      select: function (e) {
        var treeview = $("#childTree").data("kendoTreeView");
        if (e.item.textContent == "Delete") {
          let data = treeview.dataItem(e.target);
          that.stateService.dispatch({
            type: DELETE_NODE,
            payload: data
          })
          if (data.items && data.items.length) {
            let dialog = that.dialogService.open({
              title: "Info",
              content: RES_TREEVIEW_DEL_CANCEL
            });
          } else {
            let dialog = that.dialogService.open({
              title: "Confirm",
              content: RES_TREEVIEW_DEL_OK,
              actions: [
                { text: "Yes", primary: true },
                { text: "No" }
              ]
            });

            dialog.result.subscribe((result) => {
              if (result['text'] == "Yes") {
                let deletedJson = {
                  applicationId: data.applicationId,
                  name: data.name,
                  description: data.description,
                  spriteCssClass: data.spriteCssClass,
                  imageFile: data.imageFile,
                  resourceID: data.resourceID,
                  resourceMappingId: data.resourceMappingId,
                  parentResourceMappingid: data.parentResourceMappingid,
                  resourceTypeName: data.resourceTypeName,
                  isExcluded: false,
                  state: 'Deleted'
                }
                that.stateService.addAppResources(deletedJson)
                that.stateService.dispatch({
                  type: APPEND_NODE,
                  state: "remove",
                  payload: deletedJson
                })
                that.stateService.enableSaveAllBtn(true);
                treeview.remove(e.target);
              }
            });
          }
        }
        //Copy/Paste functionality is dropped for now. It will be implemented in phase 2
        else if (e.item.textContent == "Copy") {
          that.copiedData = {};
          let copydata = treeview.dataItem(e.target);
          that.copiedData = JSON.parse(JSON.stringify(copydata))
        } else if ($("ul#resources-context-menu li:contains('Paste')")) {
          let targetData = treeview.dataItem(e.target);
          that.copiedData.parentResourceMappingid = targetData.resourceMappingId;
          treeview.append(that.copiedData, $(e.target));
          that.detachAccounts(getAllTreeItems(treeview));
          let copiedJson = {
            applicationId: that.copiedData.applicationId,
            name: that.copiedData.name,
            description: that.copiedData.description,
            spriteCssClass: that.copiedData.spriteCssClass,
            imageFile: that.copiedData.imageFile,
            items: that.copiedData.items,
            resourceID: that.copiedData.resourceID,
            resourceMappingId: that.stateService.counter,
            parentResourceMappingid: targetData.resourceMappingId,
            resourceTypeName: that.copiedData.resourceTypeName,
            isExcluded: false,
            state: 'Added'
          }
          that.stateService.addAppResources(copiedJson);
          (function iterate(copiedJson) {
            if (copiedJson.items && copiedJson.items.length) {
              copiedJson.items.forEach(i => {
                i.resourceMappingId = that.stateService.counter;
                i.parentResourceMappingid = copiedJson.resourceMappingId;
                i.state = "Added";
                if (i.spriteCssClass != "person" && i.spriteCssClass != "group" && i.spriteCssClass != "ADB" && i.spriteCssClass != "AD") {
                  that.stateService.addAppResources(i)
                } else {
                  that.stateService.addAuthAccount(i, i.state)
                }
                if (i.items && i.items.length) {
                  return iterate(i);
                }
              })
            }
          })(copiedJson);

          that.stateService.dispatch({
            type: APPEND_NODE,
            state: "append",
            payload: copiedJson
          })
          that.stateService.enableSaveAllBtn(true);
        }
      }
    });
  }

  createNode(node) {
    var that = this;
    $('#childTree').kendoTreeView({
      dataTextField: 'name',
      dragAndDrop: true,
      autoScroll: true,
      loadOnDemand: false,
      template: function (di) {
        if (di.item.spriteCssClass != 'application') {
          return di.item.name + ' - ' + di.item.description;
        } else {
          return di.item.name;
        }
      },
      drag: function (e) {
        e.preventDefault();
        let srcData = this.dataItem(e.sourceNode);
        if (srcData.resourceTypeName == "Permission" && (srcData.name == "ADBAdministrator" || srcData.name == "ADBDeveloper")) {
          e.preventDefault()
          e.setStatusClass("k-i-cancel");
        }
        let destData = this.dataItem(e.dropTarget);
        let key = that.getKeyByValue(that.resTypeMap, srcData.resourceTypeName)
        let targetData = that.resTypeTargetImageMap[key];
        let destResMappingIds = [];
        if (destData) {
          destData.items ? (destData.items.forEach((v) => { destResMappingIds.push(v.resourceID) })) : '';
        } else {
          e.setStatusClass("k-i-cancel");
        }
        if ((destData && targetData && !(targetData.includes(destData.spriteCssClass))) || (destResMappingIds.includes(srcData.resourceID))) {
          e.setStatusClass("k-i-cancel");
        }
      },
      drop: function (e) {
        if (!e.valid) {
          return;
        }
        e.preventDefault();
        let srcData = this.dataItem(e.sourceNode);
        let destData = this.dataItem(e.destinationNode);
        let node = destData;
        let exists = false;
        while (node) {
          if (srcData.name == node.name && srcData.description == node.description && srcData.resourceTypeName == node.resourceTypeName) {
            exists = true;
            break;
          }
          node = node.parentNode();
        }
        if (exists) {
          e.setValid(false);
          return;
        }
        let key = that.getKeyByValue(that.resTypeMap, srcData.resourceTypeName)
        let targetData = that.resTypeTargetImageMap[key];
        let destResMappingIds = [];
        if (destData && !exists) {
          destData.items.forEach((v) => { destResMappingIds.push(v.resourceID) })
        } else {
          e.setValid(false);
        }
        if (destData && targetData && targetData.includes(destData.spriteCssClass) && !(destResMappingIds.includes(srcData.resourceID))) {
          let addedItems = JSON.parse(JSON.stringify(srcData.items))
          let deletedItems = JSON.parse(JSON.stringify(srcData.items))
          let srcJsonAdded = {
            applicationId: srcData.applicationId,
            name: srcData.name,
            description: srcData.description,
            spriteCssClass: srcData.spriteCssClass,
            imageFile: srcData.imageFile,
            items: addedItems,
            resourceID: srcData.resourceID,
            resourceMappingId: that.stateService.counter,
            parentResourceMappingid: destData.resourceMappingId,
            resourceTypeName: srcData.resourceTypeName,
            isExcluded: false,
            state: 'Added'
          }
          let srcJsonDeleted = {
            applicationId: srcData.applicationId,
            name: srcData.name,
            description: srcData.description,
            spriteCssClass: srcData.spriteCssClass,
            imageFile: srcData.imageFile,
            items: deletedItems,
            resourceID: srcData.resourceID,
            resourceMappingId: srcData.resourceMappingId,
            parentResourceMappingid: srcData.parentResourceMappingid,
            resourceTypeName: srcData.resourceTypeName,
            isExcluded: false,
            state: 'Deleted'
          }

          that.stateService.addAppResources(srcJsonAdded);
          that.stateService.addAppResources(srcJsonDeleted);

          (function iterate(srcJsonAdded) {
            if (srcJsonAdded.items && srcJsonAdded.items.length) {
              srcJsonAdded.items.forEach(i => {
                i.resourceMappingId = that.stateService.counter;
                i.parentResourceMappingid = srcJsonAdded.resourceMappingId;
                i.state = "Added";
                if (i.spriteCssClass != "person" && i.spriteCssClass != "group" && i.spriteCssClass != "ADB" && i.spriteCssClass != "AD") {
                  that.stateService.addAppResources(i)
                } else {
                  that.stateService.addAuthAccount(i, i.state)
                }
                if (i.items && i.items.length) {
                  return iterate(i);
                }
              })
            }
          })(srcJsonAdded);

          (function iterate(srcJsonDeleted) {
            if (srcJsonDeleted.items && srcJsonDeleted.items.length) {
              srcJsonDeleted.items.forEach(i => {
                i.parentResourceMappingid = srcJsonDeleted.resourceMappingId;
                i.state = "Deleted";
                if (i.spriteCssClass != "person" && i.spriteCssClass != "group" && i.spriteCssClass != "ADB" && i.spriteCssClass != "AD") {
                  that.stateService.addAppResources(i)
                } else {
                  that.stateService.addAuthAccount(i, i.state)
                }
                if (i.items && i.items.length) {
                  return iterate(i);
                }
              })
            }
          })(srcJsonDeleted);

          // if (srcData.items.length) {
          //   srcJsonAdded.items.forEach(i => {
          //     i.state = "Added"
          //     i.parentResourceMappingid = srcJsonAdded.resourceMappingId
          //     if (i.spriteCssClass != "person" && i.spriteCssClass != "group" && i.spriteCssClass != "ADB" && i.spriteCssClass != "AD") {
          //       that.stateService.addAppResources(i);
          //     } else {
          //       that.stateService.addAuthAccount(i, i.state)
          //     }
          //   })
          //   srcJsonDeleted.items.forEach(i => {
          //     i.state = "Deleted"
          //     if (i.spriteCssClass != "person" && i.spriteCssClass != "group" && i.spriteCssClass != "ADB" && i.spriteCssClass != "AD") {
          //       that.stateService.addAppResources(i);
          //     } else {
          //       that.stateService.addAuthAccount(i, i.state)
          //     }
          //   })
          // }

          this.append(e.sourceNode, $(e.destinationNode));
          that.detachAccounts(getAllTreeItems(this));
          that.stateService.enableSaveAllBtn(true);
          that.stateService.dispatch({
            type: APPEND_NODE,
            state: "append",
            payload: srcJsonAdded
          })
          that.stateService.dispatch({
            type: APPEND_NODE,
            state: "remove",
            payload: srcJsonDeleted
          })
        }
      }
    });

    let treeview = $("#childTree").data("kendoTreeView");
    let treeData = new kdata.HierarchicalDataSource({
      schema: {
        model: {
          id: "resourceID",
          children: "items"
        }
      }
    });
    treeview.setDataSource(treeData);
    treeview.append(node);
    //let nodes = treeview.dataSource.data();
    // (function getPersonItems(items) {
    //   let data = items.forEach((v) => {
    //     if (v.spriteCssClass == 'person' || v.spriteCssClass == 'group') {
    //       treeview.detach(treeview.findByUid(v.uid))
    //     } else if (v.items && v.items.length) {
    //       getPersonItems(v.items)
    //     }
    //   });
    // })(nodes[0].items);
    this.detachAccounts(getAllTreeItems(treeview))
  }

  droptargetOnDrop(e) {
    let treeView = $("#childTree").data("kendoTreeView");
    let resourcesGrid = $("#k-ui-r-grid").data("kendoGrid");
    let resourceTypeGrid = $("#k-ui-rt-grid").data("kendoGrid");
    let treeData = treeView.dataItem(e.dropTarget);
    let targets = [];
    if (e.draggable.userEvents.filter == 'tr.k-state-selected') {
      let gridData = resourcesGrid.dataItem($(e.draggable.currentTarget));
      let item = resourceTypeGrid.dataSource.data().find(rt => rt.resourceTypeId == gridData.resourceTypeId);
      if (item && item.targets) {
        let targetNames = item.targets.slice()
        targetNames.forEach(targetName => { targets.push(Number(this.getKeyByValue(this.resTypeMap, targetName))) })
      }
      let destResMappingIds = [];
      if (treeData.items) {
        treeData.items.forEach((v) => { destResMappingIds.push(v.resourceID) })
      }
      // let targetData = this.resTypeTargetImageMap[gridData.resourceTypeId];
      // let dragData = { targets: targets, targetResTypeId: treeData.resourceTypeId, node: $(e.dropTarget), treeView: treeView, name: gridData.name, description: gridData.description, type: gridData.resourceTypeName, targetList: targetData, class: treeData.spriteCssClass, applicationId: treeData.applicationId, imageFile: gridData.imageFile, gresourceMappingId: gridData.resourceId, tresourceMappingIds: destResMappingIds, tresourceMappingId: treeData.resourceMappingId, resourceTypeName: gridData.resourceTypeName }
      let dragData = {
        targets: targets,
        targetResTypeId: treeData.resourceTypeId,
        treeView: treeView,
        gridData: gridData,
        treeData: treeData,
        tresourceMappingIds: destResMappingIds
      }
      return dragData;
    }
  }

  typeDropDownEditor(container, options) {
    var that = this;
    $('<input required id="typeDropDownList" name="' + options.field + '"/>')
      .appendTo(container)
      .kendoDropDownList({
        dataSource: {
          data: this.targets,
        },
        height: 120,
        optionLabel: "Select Type",
        change: function (e) {
          for (let i in that.resTypeImageMap) {
            if (options.model.resourceTypeName == i) {
              options.model.imageFile = that.resTypeImageMap[i];
            }
          }
          $('.k-edit-form-container .k-edit-field #rtImg').attr('class', options.model.imageFile.replace(".png", "").toLocaleLowerCase());
          let validationDiv = $("div[data-for='resourceTypeName'].k-tooltip-validation");
          if (validationDiv.length) {
            $("div[data-container-for='resourceTypeName']").append(validationDiv);
          }
        }
      });
  }

  imgDropDownEditor(container, options) {
    $('<input name="' + options.field + '"/>')
      .appendTo(container)
      .kendoDropDownList({
        dataTextField: options.field,
        dataValueField: options.field,
        optionLabel: "Select Image file",
        dataSource: {
          data: RESOURCE_IMGS,
          schema:
          {
            parse: function (response) {
              let imgs = [];
              response.forEach(img => { if (img) { imgs.push({ "imageFile": img }) } });
              return imgs;
            }
          }
        },
        change: function (e) {
          $('.k-edit-form-container .k-edit-field #rtImg').attr('class', this.value().replace(".png", "").toLocaleLowerCase());
          let validationDiv = $("div[data-for='imageFile'].k-tooltip-validation");
          if (validationDiv.length) {
            $("div[data-container-for='imageFile']").append(validationDiv);
          }
        },
        template: '<span id="rtImg" class="#: imageFile.replace(".png","").toLocaleLowerCase()#"></span>&nbsp;<span>${imageFile}</span>'
      });
  }


  targetMultiSelectEditor(container, options) {
    var that = this;
    $('<input id="multiselect" name="' + options.field + '"/>')
      .appendTo(container)
      .kendoMultiSelect({
        dataSource: {
          data: this.targets
        },
        change: function (e) {
          let validationDiv = $("div[data-for='targets'].k-tooltip-validation");
          if (validationDiv.length) {
            $("div[data-container-for='targets']").append(validationDiv);
          }
        },
        select: function (e) {
          that.resTargetData["state"] = "Added";
          that.resTargetData["resourceTypeTargetId"] = that.stateService.counter;
          that.resTargetData["targetResourceTypeId"] = that.getKeyByValue(that.resTypeMap, e.dataItem);
          let data = JSON.parse(JSON.stringify(that.resTargetData));
          if (that.stateService.ResourceTypeMapping.length) {
            that.stateService.ResourceTypeMapping.forEach(rt => {
              let exists = that.targetData.find(i => i.resourceTypeTargetId == rt.resourceTypeTargetId);
              if (!exists) {
                that.targetData.push(rt)
              } else if (exists == -1) {
                that.targetData.push(rt)
              }
            })
          }
          let rtExists = that.targetData.find(i => data['sourceResourceTypeId'] < 0 && that.resTypeMap[i.sourceResourceTypeId] == options.model.name)
          if (rtExists) {
            data['sourceResourceTypeId'] = rtExists.sourceResourceTypeId;
            data['resourceTypeTargetId'] = rtExists.resourceTypeTargetId;
          }
          let exists = that.targetData.findIndex(i => that.resTypeMap[i.sourceResourceTypeId] == options.model.name && (i.targetResourceTypeId == data['targetResourceTypeId']))
          // if(that.resTargetData["resourceTypeName"] == that.getKeyByValue(that.resTypeMap,))
          if (exists > -1) {
            that.targetData.splice(exists, 1)
          } else {
            that.targetData.push(data)
          }
          that.targetDataAll.push(data)
        },
        deselect: function (e) {
          let treeView = $("#childTree").data("kendoTreeView");
          that.resTargetData["targetResourceTypeId"] = that.getKeyByValue(that.resTypeMap, e.dataItem);
          that.resTargetData["state"] = "Deleted";
          let exists = that.resourceTypeTargets.findIndex(item => ((item.sourceResourceTypeId == that.resTargetData['sourceResourceTypeId']) && (item.targetResourceTypeId == that.resTargetData['targetResourceTypeId'])));
          let items = getAllTreeItems(treeView);
          let m = $.grep(items, function (i) {
            return options.model.name == i.resourceTypeName
          })
          let match = items.find(i => options.model.name == i.resourceTypeName);
          if ((match && that.resourceTypeTargets[exists]) || (that.resourceTypeTargets[exists] && that.resourceTypeTargets[exists].state == "Added" && that.stateService.appResourcesData && that.stateService.appResourcesData.resourceTypeName == e.dataItem)) {
            e.preventDefault();
          } else {
            if (that.resTargetData["state"] == "Deleted" && exists > -1) {
              that.resTargetData["resourceTypeTargetId"] = that.resourceTypeTargets[exists].resourceTypeTargetId;
            }
            let data = JSON.parse(JSON.stringify(that.resTargetData));
            if (that.stateService.ResourceTypeMapping.length) {
              that.stateService.ResourceTypeMapping.forEach(rt => {
                let exists = that.targetData.find(i => i.resourceTypeTargetId == rt.resourceTypeTargetId);
                if (!exists) {
                  that.targetData.push(rt)
                } else if (exists == -1) {
                  that.targetData.push(rt)
                }
              })
            }
            let targetExists = that.targetData.findIndex(item => ((item.sourceResourceTypeId == data['sourceResourceTypeId']) && (item.targetResourceTypeId == data['targetResourceTypeId'])));
            that.targetDataAll.push(data)
            if (targetExists > -1) {
              that.targetData.splice(targetExists, 1);
            } else {
              that.targetData.push(data);
            }
          }
        }
      });
  }

  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  popupChanges(e) {
    if (e.model.isNew()) {
      $(e.container).find(".k-edit-buttons a.k-grid-update").html('<span class="k-icon k-i-plus"></span>Add');
      $(e.container).prev(".k-window-titlebar").find(".k-window-title").text("Add" + " " + e.sender.name);
    } else {
      $(e.container).find(".k-edit-buttons a.k-grid-update").html('<span class="k-icon k-i-check"></span>Update')
      $(e.container).prev(".k-window-titlebar").find(".k-window-title").text("Edit" + " " + e.sender.name)
    }
    $("a.k-grid-update").attr("disabled", "disabled");
    $(e.container).change(function (e) {
      $("a.k-grid-update").removeAttr("disabled");
    })
  }

  getAllMaps(restypeData, resTypeTargets) {
    this.resTypeMap = {};
    this.resTypeImageMap = {};
    this.resTypeTargetMap = {};
    this.resTypeTargetImageMap = {};
    this.targets = [];
    restypeData.forEach(item => {
      this.resTypeMap[item.resourceTypeId] = item.name;
      this.resTypeImageMap[item.name] = item.imageFile;
    });
    restypeData.forEach(item => {
      resTypeTargets.forEach(targetItem => {
        if (item.resourceTypeId == targetItem.sourceResourceTypeId) {
          if (!(item.targets)) {
            item.targets = [];
          }
          for (let i in this.resTypeMap) {
            if (targetItem.targetResourceTypeId == i) {
              let t = item.targets.splice();
              if (!t.includes(this.resTypeMap[i]))
                item.targets.push(this.resTypeMap[i]);
            }
          }
        }
      })
      if (item.targets) {
        this.resTypeTargetMap[item.resourceTypeId] = item.targets;
        this.resTypeTargetImageMap[item.resourceTypeId] = this.resTypeTargetMap[item.resourceTypeId].map(v => this.resTypeImageMap[v] ? this.resTypeImageMap[v].replace(".png", "").toLocaleLowerCase() : '')
      }
      else {
        this.resTypeTargetImageMap[item.resourceTypeId] = [""];
        this.resTypeTargetMap[item.resourceTypeId] = [];
      }
    });
    for (let i in this.resTypeMap) {
      this.targets.push(this.resTypeMap[i])
    }
  }

  detachAccounts(items) {
    let treeview = $("#childTree").data("kendoTreeView");
    let data = items.forEach((v) => {
      if (v.spriteCssClass == 'person' || v.spriteCssClass == 'group' || v.spriteCssClass == "adb" || v.spriteCssClass == "ad") {
        treeview.detach(treeview.findByUid(v.uid))
      } else if (v.items && v.items.length) {
        return this.detachAccounts(v.items)
      }
    });
  }

  closeDynamicTab() {
    const splitter = $("#divided-box").data("kendoSplitter");
    const pane = splitter.options.panes.find(pane => pane.id === "resource-manager");
    if (initialAppState.appResourceTab.appResourceTypes.length || initialAppState.appResourceTab.appResourcesData.length
      || initialAppState.appResourceTab.appResourceTypeMap.length || initialAppState.appResourceTab.applicationResources.length) {
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
          this.stateService.clearResourceType();
          this.stateService.clearResourceTypeMapping();
          this.stateService.clearResources();
          this.stateService.clearAppResources();
          if (this.newAppData) {
            if (this.initialSaveState) {
              this.stateService.enableSaveAllBtn(false);
              this.closeSplitter(splitter);
            } else {
              this.closeSplitter(splitter);
            }
            this.stateService.dispatch({
              type: REMOVE_NEW_APP,
              index: this.newAppData.index,
            })
          }
          if (this.initialSaveState) {
            this.stateService.enableSaveAllBtn(false);
            this.closeSplitter(splitter);
          } else {
            this.closeSplitter(splitter);
          }
        }
      });
    } else {
      this.closeSplitter(splitter);
    }
  }

  closeSplitter(splitter) {
    splitter.collapse('.k-pane:last');
    // this.stateService.enableAddAppBtn(true);
    $("adb-resource-manager").prev(".k-splitbar").css("display", "none");
    this.stateService.dispatch({
      type: REMOVE_RESOURCE
    });
  }

  resetTreeAfterSaveAll() {
    let data = this.stateService.getAppDetails(this.applicationId)
    if (data) {
      this.getResourcesData(data.resources);
      this.getResourcesTypesData(data.resourceTypes, data.resourceTypeTargets);
      this.stateService.showLoader(false);
    }
  }

  accountStateChanged(action) {
    let treeView = $("#childTree").data("kendoTreeView");
    if (!treeView) {
      return;
    }
    let node = treeView.dataSource.data();
    let items = getAllTreeItems(treeView);
    let parentNode = items.find(i => i.resourceMappingId == action.account.parentResourceMappingid)
    if (action.account.state == "Deleted") {
      (function check(node) {
        node.forEach((item, index) => {
          if (item && item.accountId == action.account.accountId) {
            node.splice(index, 1)
          } else if (item && item.items && item.items.length) {
            check(item.items);
          }
        })
      })(node[0].items)
    } else {
      action.account.spriteCssClass = action.account.accountType.toLocaleLowerCase()
      if (!parentNode) {
        return;
      }
      let t = parentNode.items.push(action.account)
      this.detachAccounts(parentNode.items)
    }
  }
}
