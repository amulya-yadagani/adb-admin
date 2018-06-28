import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';

import { data as kdata } from "@progress/kendo-ui/js/kendo.core.js";
import * as kendoWork from '@progress/kendo-ui/js/kendo.ooxml.js';
import * as kendo from '@progress/kendo-ui/js/kendo.excel.js';
import "@progress/kendo-ui/js/kendo.dateinput.js";
import "@progress/kendo-ui/js/kendo.datepicker.js";
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';

import * as Constants from "../utils/constants";
import { AppStateService } from "../state/app-state.service";
import { IMPERSONATION_ACCOUNT_LIST, IMPERSONATION_ACCOUNT_LIST_RESULT, IMPERSONATION_APPLICATIONS, IMPERSONATION_APPLICATIONS_RESULT, IMPERSONATED_APP_DATA, IMPERSONATED_APP_DATA_RESULT, IMPERSONATION_ACCOUNT_NAMES, IMPERSONATION_ACCOUNT_NAMES_RESULT, ACCOUNT_SELECT, AFTER_SAVE_ALL_RESET } from "../state/actions";
import { IMPERSONATION_ACCOUNT_LIST_URL, IMPERSONATION_APPLICATIONS_URL, IMPERSONATED_ACCOUNTS_URL, I_URL, USERACCOUNT_URL, MODIFIED, ADDED, DELETED } from '../utils/constants';
import { DELETE_IMPERSONATION, SPAN_OVERLAP } from "../utils/messages";

let $=null;

@Component({
    moduleId: module.id,
    selector:'adb-impersonation',
    templateUrl:'./impersonation.component.html',
    styleUrls: ["impersonation.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class ImpersonationComponent implements OnInit {

    // Temporarily initiates grid with empty records.
    impersonatedGridData: any[] = [];
    appList;

    editDropDownDataMutated = [];

    accountNameList = [];
    impersonatedAccountList = [];

    currentApplicationId: string;
    impersonationAppDataStore: any = {};

    STRING_POST: string = <string> 'POST';
    STRING_NAV: string = <string> 'accountDetails';

    //Create headers for the impersonate table.
    impersonatedAccountGridHeaders: any[] = [
      {
          field: "account",
          title: "Account Name",
          width: "180px",
          editor: this.accountNameDropDownEditor.bind(this),
          template: "#=account.accountName#",
          filterable: {
            multi: true,
            search: true,
            field: 'account.accountName' // let the filterable know which field to use from account json
          }

      },
      {
          field: "imperseAccount",
          title: "Impersonated Account",
          editor: this.impersonatedNameDropDownEditor.bind(this),
          template: "#=imperseAccount.displayName#",
          filterable: {
            multi: true,
            search: true,
            field: 'imperseAccount.displayName' // let the filterable know which field to use from imperseAccount json
          }
      },
      {
          field: "impersonatedAccountUserId",
          title: "Impersonated Account Id",
          template: (item) => {
            let acName = item.impersonatedAccountUserId ? item.impersonatedAccountUserId : item.imperseAccount.name
            return `<a class="accountLink">${acName}</a>`;
            //return `<a class="accountLink">${item.imperseAccount.name}</a>`;
          },
          editable: (item) => false,
          filterable: {
            multi: true,
            search: true
          }
      },
      {
          field: "effectiveDate",
          title: "Effective From",
          template: "#= kendo.toString(kendo.parseDate(effectiveDate, 'yyyy-MM-dd'), 'MM/dd/yyyy') #",
          filterable: {
            multi: true,
            search: true
          }
      },
      {
          field: "expires",
          title: "Expires",
          template: "#= kendo.toString(kendo.parseDate(expires, 'yyyy-MM-dd'), 'MM/dd/yyyy') #",
          filterable: {
            multi: true,
            search: true
          }
      },
      {
        'command': [{
          name: 'del',
          text: '',
          iconClass: 'k-icon k-i-delete',
          click: this.deleteImpersonation.bind(this)
        }],
        width: 60
      }
    ];

    constructor(private stateService: AppStateService, private dialogService: DialogService, private router: Router) {
        $ = window["jQuery"];
        let self = this;

        //subscribe event to get application list
        this.stateService.subscribe(IMPERSONATION_APPLICATIONS_RESULT, this.initImpersonationDropDown.bind(this));

        //subscribe event to get users in the application selected
        this.stateService.subscribe(IMPERSONATED_APP_DATA_RESULT, this.updateImpersonatedGrid.bind(this));

        //subscribe event to get users in the application selected
        this.stateService.subscribe(IMPERSONATION_ACCOUNT_LIST_RESULT , this.setAccountList.bind(this));
        this.stateService.subscribe(AFTER_SAVE_ALL_RESET, this.resetAfterSaveAll.bind(this));
    }

    ngOnInit() {
        //Dispatch event to get all applications
        let action = {
            type: IMPERSONATION_APPLICATIONS,
            payload: {
                url: IMPERSONATION_APPLICATIONS_URL
            }
        }
        this.stateService.dispatch(action);

        // Initialize kendo grid with empty records (impersonatedGridData)
        this.initKendoGrid();

        /* if(!this.stateService.impersonationObject.batch){
          this.stateService.impersonationObject.batch = {}
        } */

        this.stateService.impersonationObject.batch = this.impersonationAppDataStore;

        this.enableAddBtn(false);
        this.enableExportBtn(false);
    }

    initKendoGrid() {
        const self = this;
        $("#k-ui-grid").kendoGrid({
            dataSource: self.impersonatedGridData,
            noRecords: true,
            excel: { allPages: true },
            excelExport: (e) => {
                let sheet = e.workbook.sheets[0];

                if(!this.editDropDownDataMutated.length) {
                    e.preventDefault();
                    return;
                }

                //Exclude the newly added entries
                e.data.forEach((row, i) => {
                  if(!("impersonationId" in row)) {
                    sheet.rows.splice(i+1,1);
                  }
                });

                for (let i = 0; i < sheet.rows.length; i++) {
                  for (let ci = 0; ci < sheet.rows[i].cells.length; ci++) {
                    //Below condition overwrites the default template data.
                    //The column will be empty if the condition is removed.
                    if(sheet.rows[i].cells[ci].value.displayName) {
                        sheet.rows[i].cells[ci].value = sheet.rows[i].cells[ci].value.displayName;
                    }

                    if(sheet.rows[i].cells[ci].value.accountName) {
                      sheet.rows[i].cells[ci].value = sheet.rows[i].cells[ci].value.accountName;
                    }

                    if(sheet.rows[i].cells[ci].value instanceof Date) {
                      sheet.rows[i].cells[ci].format = "MM/dd/yyyy";
                    }
                    /* if(sheet.rows[i].cells[ci].value.impersonatedAccountDisplayName) {
                        sheet.rows[i].cells[ci].value = sheet.rows[i].cells[ci].value.impersonatedAccountDisplayName;
                    } */
                    sheet.rows[i].cells[ci].hAlign = 'left';
                  }
                }

                let exportWorkbook = new kendoWork.ooxml.Workbook({
                    sheets:[
                        {
                            columns: sheet.columns,
                            rows: sheet.rows
                        }
                    ]
                });

                let dropdown = $("#impersonationAppList").data("kendoDropDownList");
                let app = dropdown.dataItem(dropdown.select());
                kendoWork.saveAs({
                    dataURI: exportWorkbook.toDataURL(),
                    fileName: `Impersonation List for ${app.name}.xlsx`
                });

                e.preventDefault();

            },
            columns: this.impersonatedAccountGridHeaders,
            editable: true,
            save: function(e) {
                let editedProperty = Object.keys(e.values)[0];
                //Update the model with new value
                e.model[editedProperty] = e.values[editedProperty];

                let isValid = self.isRecordValid(e.model);
                let hasOverlap = self.hasSpanOverlap(e.model);

                if(isValid && !hasOverlap) {
                  if(!e.model.impersonationId) {
                    e.model.impersonationId = self.stateService.counter;
                  }
                  self.createSaveAllPayload(e.model);
                  self.stateService.enableSaveAllBtn(true);
                }
                else {
                  //If not valid then discard it and dont save it
                  let records = self.impersonationAppDataStore["appId"+self.currentApplicationId]["saveData"];

                  let rec = records.find(item => item.impersonationId == e.model.impersonationId);
                  if(rec) {
                    records.splice(records.indexOf(rec), 1);
                  }

                  if(hasOverlap) {
                    let dialog = self.dialogService.open({
                      title: "Info",
                      content: SPAN_OVERLAP,
                    });
                  }
                }

            },
            batch: true,
            toolbar: ["create", "excel"],
            resizable: true,
            filterable: true,
            sortable: true,
        });

        $("#effectiveFromDateInput, #expiresDateInput").kendoDatePicker({
            format: "yyyy/MM/dd"
        });

        // angular (click) handler does not work in kendo grid template.
        // To overcome this, I am assigning event listener on the class that template will hold.
        // The template is present in impersonatedAccountGridHeaders > impersonatedAccountUserId column.
        $("#k-ui-grid").on("click", ".accountLink", function(e) {
          self.showAccountDetails(e);
        });

        let grid = $("#k-ui-grid").data("kendoGrid");
        let tb = grid.element.find(".k-grid-add");
        tb.on("click", (e) => {
          self.enableExportBtn(true);
        });
    }

    initImpersonationDropDown(action): void {
        const self = this;
        $("#impersonationAppList").kendoDropDownList({
            dataTextField: "name",
            dataSource: action.payload.data,
            dataValueField: "applicationId",
            change: function() {
                if(this.value()) {
                  self.onImpersonationAppChange(this.value());
                }
                else {
                  self.enableAddBtn(false);
                  self.enableExportBtn(false);

                  self.currentApplicationId = "0";
                  let grid = $("#k-ui-grid").data("kendoGrid");

                  if(!grid) {
                    return;
                  }

                  grid.dataSource.data([]);
                }
            },
            optionLabel: "Select Application"
        });

        this.appList = action.payload.data;
        this.createAppDataStore(action.payload.data);
    }

    createAppDataStore(appDataList) {
        for(let appData of appDataList) {
            this.impersonationAppDataStore["appId"+appData.applicationId] = {
              gridDataCache: [],
              saveData: []
            };
        }

        //Also create one for "Select Application" entry to avoid run time error when this option is selected
        this.impersonationAppDataStore["appId0"] = {
          gridDataCache: [],
          saveData: []
        };
    }

    //Called everytime the app is changed in drop down. Called by: initImpersonationDropDown
    onImpersonationAppChange(applicationId) {
        this.currentApplicationId = applicationId;
        let action = {
            type: IMPERSONATED_APP_DATA,
            payload: {
                url: IMPERSONATED_ACCOUNTS_URL,
                applicationId: applicationId
            }
        }

        let action1 = {
            type: IMPERSONATION_ACCOUNT_LIST,
            payload: {
                url: IMPERSONATION_ACCOUNT_LIST_URL,
                applicationId: applicationId
            }
        }

        this.stateService.dispatch(action);
        this.stateService.dispatch(action1);
    }

    //Creates the grid with app impersonated accounts. Called by the IMPERSONATED_APP_DATA_RESULT event.
    updateImpersonatedGrid(action) {
        let self = this;
        this.editDropDownDataMutated = action.payload.data;
        let appIdKeyString = "appId"+this.currentApplicationId;
        let gridData;

        //create account object within each record. Kendo grid edit dropdown wont work correctly without this.
        for(let edAccount of this.editDropDownDataMutated) {
            edAccount["account"] = {
              accountId: edAccount.accountId,
              accountName:  edAccount.accountName
            };
        }

        //create impersAccount object within each record. Kendo grid edit dropdown wont work correctly without this.
        for(let impersAccount of this.editDropDownDataMutated) {
            impersAccount["imperseAccount"] = {
              displayName: impersAccount.impersonatedAccountDisplayName,
              accountName: impersAccount.impersonatedAccountUserId,
              accountId: impersAccount.impersonatedAccountId
            };
        }

        if(this.searchCacheStore(appIdKeyString)) {
            gridData = this.impersonationAppDataStore["appId"+this.currentApplicationId]["gridDataCache"][0];
        } else {
            gridData = this.editDropDownDataMutated;
            this.impersonationAppDataStore["appId"+this.currentApplicationId]["gridDataCache"].push(this.editDropDownDataMutated);
        }

        let grid = $("#k-ui-grid").data("kendoGrid");

        if(!grid) {
          return;
        }

        var updateTableData =  new kdata.DataSource({
            data : gridData,
            autoSync: true,
            schema: {
                model: {
                    fields: {
                        account: {
                            defaultValue: { accountId: "", accountName: ""},
                            validation: {
                                custom: function(input) {
                                    let row = input.closest("tr");
                                    let grid = row.closest("[data-role=grid]").data("kendoGrid");
                                    let dataItem = grid.dataItem(row);
                                    let impersonatedAccountId = dataItem.imperseAccount.accountId;
                                    let inputAccountId = input.val();

                                    if(inputAccountId == impersonatedAccountId) {
                                        input.attr("data-custom-msg", "Account and Impersonated Account cannot be same.");
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        },
                        imperseAccount:
                        {
                            defaultValue: { accountId : "", displayName: "", name: ""},
                            validation: {
                                custom: function(input) {
                                    if(input.length) {
                                        let row = input.closest("tr");
                                        let grid = row.closest("[data-role=grid]").data("kendoGrid");
                                        let dataItem = grid.dataItem(row);
                                        let accountId = dataItem.account.accountId;
                                        let inputImperseAccountId = input.val();

                                        if(inputImperseAccountId == accountId) {
                                            input.attr("data-custom-msg", "Account and Impersonated Account cannot be same.");
                                            return false;
                                        }
                                        return true;
                                    }
                                }
                            }
                        },
                        impersonatedAccountUserId: { },
                        effectiveDate:  {
                            type: "date",
                            defaultValue: self.getDefaultDate(false),
                            validation: {
                                custom: function(input) {

                                    //fetch the adjacent row expiry date column value.
                                    let row = input.closest("tr");
                                    let grid = row.closest("[data-role=grid]").data("kendoGrid");
                                    let dataItem = grid.dataItem(row);

                                    if(!input.val()) {
                                      input.attr("data-custom-msg", "Effective Date can not be empty");
                                      return false;
                                    }

                                    // Create js date objects from the row entry dates
                                    let inputDate = new Date(input.val()); // user entered date
                                    let expiryDate = new Date(dataItem.expires); // date in expiry column

                                    //perform check
                                    if(inputDate.getTime() > expiryDate.getTime()) {
                                        input.attr("data-custom-msg", "Effective Date cannot be greater than expiry date.");
                                        return false;
                                    } else {
                                        return true;
                                    }

                                }
                            }
                        },
                        expires: {
                            type: "date",
                            defaultValue: self.getDefaultDate(true),
                            validation: {
                                custom: function(input) {
                                    //fetch the adjacent row expiry date column value.
                                    let row = input.closest("tr");
                                    let grid = row.closest("[data-role=grid]").data("kendoGrid");
                                    let dataItem = grid.dataItem(row);

                                    if(!input.val()) {
                                      input.attr("data-custom-msg", "Expiry Date can not be empty");
                                      return false;
                                    }

                                    let inputExpiryDate = new Date( input.val() );
                                    let effectiveDate = new Date(dataItem.effectiveDate); // date in expiry column

                                    if(inputExpiryDate.getTime() < effectiveDate.getTime()) {
                                        input.attr("data-custom-msg", "Expiry date should be always greater than or equal to effective date.");
                                        return false;
                                    }
                                    else {
                                        return true;
                                    }
                                }
                            }
                        }
                  }
                }
            },
            change: function(e) {
                self.impersonationAppDataStore["appId"+self.currentApplicationId]["gridDataCache"] = [];
                self.impersonationAppDataStore["appId"+self.currentApplicationId]["gridDataCache"].push(JSON.parse(JSON.stringify(e.items)));
            }

        });

        // Sets new data to the table.
        grid.setDataSource(updateTableData);
        this.enableAddBtn(true);
        this.enableExportBtn(gridData.length > 0);
    }

    getDefaultDate(endDate/*boolean*/) {
      let result = new Date();
      if(endDate){
        result.setDate(result.getDate()+1);
      }
      result.setHours(0,0,0,0);
      return result;
    }

    searchCacheStore(appId) {
        let tableCacheData = this.impersonationAppDataStore;

        if(appId in tableCacheData && tableCacheData[appId]["gridDataCache"].length) {
            return true
        } else {
            return false;
        }
    }

    createSaveAllPayload(gridRowData) {
        let appSaveData = {};
        let self = this;

        if(!Object.keys(gridRowData).length) {
            return;
        }

        let records = self.impersonationAppDataStore["appId"+self.currentApplicationId]["saveData"];

        let rec = records.find(item => item.impersonationId == gridRowData.impersonationId);
        if(rec) {
          records.splice(records.indexOf(rec), 1);
        }

        appSaveData["accountId"] = gridRowData.account.accountId;

        if(gridRowData.state == DELETED && gridRowData.impersonationId < 0) {
            return;
        }

        if(gridRowData.impersonationId > 0) {
            appSaveData["accountName"] = gridRowData.account.accountName;
            appSaveData["applicationName"] = gridRowData.applicationName;
            appSaveData["impersonatedAccountDisplayName"] = gridRowData.imperseAccount.displayName;
            appSaveData["impersonatedAccountUserId"] = gridRowData.imperseAccount.accountName;
        }

        appSaveData["impersonationId"] = gridRowData.impersonationId;
        appSaveData["impersonatedAccountId"] = gridRowData.imperseAccount.accountId;
        appSaveData["effectiveDate"] = window["kendo"].toString(new Date(gridRowData.effectiveDate),"yyyy-MM-dd")//.toISOString();
        appSaveData["expires"] = window["kendo"].toString(new Date(gridRowData.expires),"yyyy-MM-dd");//new Date(gridRowData.expires).toISOString();

        if(gridRowData.state == DELETED){
          appSaveData["state"] = DELETED
        }
        else {
          appSaveData["state"] = (gridRowData.impersonationId > 0) ? MODIFIED : ADDED;
        }

        appSaveData["applicationId"] = self.currentApplicationId;

        //save to cache
        self.impersonationAppDataStore["appId"+self.currentApplicationId]["saveData"].push(appSaveData);
    }

    setAccountList(action) {
        let data = action.payload.data;
        this.accountNameList = data.accounts;
        this.impersonatedAccountList = data.impersonatedAccounts;

        // Rename json keys from account user list to match the initial source keys.
        for(let accListKey of this.accountNameList) {
            accListKey.accountName = accListKey.displayName;
        }
        for(let impersListKey of this.impersonatedAccountList) {
            impersListKey.impersonatedAccountDisplayName = impersListKey.displayName;
        }
    }

    /* Template editors for grid account name edit dropdowns */
    accountNameDropDownEditor(container, options) {
        let self = this;
        $('<input required name="' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            autoBind: false,
            dataTextField: "accountName",
            dataValueField: "accountId",
            dataSource: self.accountNameList,
        });

        //below line fixes the error message clipping issue when using custom editor dropdown inside grid.
        $("<div class='k-invalid-msg' data-for='" + options.field + "'></div>").appendTo(container);
    }

    /* Template editors for grid impersonation username edit dropdowns */
    impersonatedNameDropDownEditor(container, options) {
        let self = this;

        $('<input required name="' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            autoBind: false,
            dataTextField: "displayName",
            dataValueField: "accountId",
            dataSource: self.impersonatedAccountList,
            change: function(e) {
                var grid = $("#k-ui-grid").data("kendoGrid"),
                model = grid.dataItem(this.element.closest("tr"));
                model.impersonatedAccountUserId = model.imperseAccount.name;
                model.set("impersonatedAccountUserId", model.imperseAccount.name);
            }
        });
        //below line fixes the error message clipping issue when using custom editor dropdown inside grid.
        $("<div class='k-invalid-msg' data-for='" + options.field + "'></div>").appendTo(container);
    }

    showAccountDetails(e) {
        let self = this;

        const action = {
            type: ACCOUNT_SELECT,
            payload: {
                url : USERACCOUNT_URL + e.target.textContent,
                reqType: self.STRING_POST,
                query: {
                  accountName: e.target.textContent
                }
            }
        };

        const promise = self.router.navigate([self.STRING_NAV]);
        promise.then(result => {
          self.stateService.dispatch(action);
        });
    }

    deleteImpersonation(e) {
      let dialog = this.dialogService.open({
        title: "Confirm",
        content: DELETE_IMPERSONATION,
        actions: [
          { text: "Yes", primary: true },
          { text: "No" }
        ]
      });

      dialog.result.subscribe((result) => {
        if (result["text"] == "Yes") {
          let grid = $("#k-ui-grid").data("kendoGrid");
          const anchor = e.currentTarget;
          const $tr = $(anchor).closest("tr");
          const uid = $tr.data("uid");
          const di = grid.dataSource.getByUid(uid);
          grid.dataSource.remove(di);

          //Add only existing records when deleting
          if("impersonationId" in di && di.impersonationId > 0) {
            //To Do - persist to state so that it can be saved
            di.state = DELETED;
            this.createSaveAllPayload(di);

            this.stateService.enableSaveAllBtn(true);
          }

          this.enableExportBtn(grid.dataSource.data().length > 0);
        }
      });

      return false; // prevent page refresh
    }

    enableAddBtn(value) {
      let grid = $("#k-ui-grid").data("kendoGrid");
      if(grid) {
        let tb = grid.element.find(".k-grid-add");
        tb.toggleClass("disabled",!value);
      }
    }

    enableExportBtn(value) {
      let grid = $("#k-ui-grid").data("kendoGrid");
      if(grid) {
        let tb = grid.element.find(".k-grid-excel");
        tb.toggleClass("disabled",!value);
      }
    }

    isRecordValid(model) {
      let result = true;

      if(!model.account.accountId || !model.imperseAccount.accountId || (model.effectiveDate > model.expires)) {
        result = false;
      }

      result = result;

      return result;
    }

    hasSpanOverlap(record) {
      let result = false;
      let grid = $("#k-ui-grid").data("kendoGrid");
      if(grid) {
        let from = record.effectiveDate;
        from.setHours(0,0,0,0);
        let to = record.expires;
        to.setHours(0,0,0,0);

        let records = grid.dataSource.data();
        for(let i of records) {
          //Multiple impersonations by same account for same date should be restricted
          if(i.impersonationId != record.impersonationId && i.account.accountId == record.account.accountId) {

            let fromOverlap = from.getTime() >= i.effectiveDate.getTime() && from.getTime() <= i.expires.getTime();
            let toOverlap = to.getTime() >= i.effectiveDate.getTime() && to.getTime() <= i.expires.getTime();
            let iFromOverlap = i.effectiveDate.getTime() >= from.getTime() && i.effectiveDate.getTime() <= to.getTime();
            let iToOverlap = i.expires.getTime() >= from.getTime() && i.expires.getTime() <= to.getTime();

            if(fromOverlap || toOverlap || iFromOverlap || iToOverlap) {
              result = true;
              break;
            }
          }
        }
      }

      return result;
    }

    resetAfterSaveAll(action) {

      //Reset save data cache
      for(let appData of this.appList) {
        this.impersonationAppDataStore["appId"+appData.applicationId].saveData = [];
        this.impersonationAppDataStore["appId"+appData.applicationId].gridDataCache = [];
      }

      let currentUrl = this.router["currentRouterState"].snapshot.url;

      //Refresh only if impersonation tab is active
      if(currentUrl.search("impersonation") == -1) {
        return;
      }

      //if app is selected, refresh its data to get ids for newly created impersonation records
      if(this.currentApplicationId && this.currentApplicationId != "0") {
        this.onImpersonationAppChange(this.currentApplicationId);
      }
    }
}
