import { Component, OnInit, AfterViewInit, ViewEncapsulation} from '@angular/core';
import * as kendoWork from '@progress/kendo-ui/js/kendo.ooxml.js';
import { data as kdata } from '@progress/kendo-ui/js/kendo.core.js';
import '@progress/kendo-ui/js/kendo.grid.js';
import '@progress/kendo-ui/js/kendo.excel.js';
import { Observable } from 'rxjs/Observable';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';

import {
  USER_MEMBERS_RESULT,
  USER_RESULT_DATA_CLEAR,
  USER_SEARCH,
  USER_SEARCH_RESULT,
  SEARCH, SEARCH_RESULT,
  TOGGLE_COMMAND_COLUMN,
  UPDATE_GROUP_MEMBER} from '../../state/actions';
import { USERACCOUNT_URL, ROLE_IMPERSONATOR } from '../../utils/constants';
import { AccountDetailsService } from '../account-details.service';
import { AppStateService } from '../../state/app-state.service';
import { DELETE_MEMBER } from 'app/utils/messages';

let $ = null;

@Component({
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MembersComponent implements OnInit {

    // constants of components
    POST: string = 'POST';
    USER: string = 'user';
    ADBACCTYPE: string = 'ADB';
    recentCachedSearch: any;
    gridDataSource: any;
    gridOptions: any = {};
    gridColumns: Array<any> = [
      {
        'field': 'name', 'title': 'Account Name', 'template': (item) => {
          return `<a class="accountLink">${item.name}</a>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'lastName',
        'title': 'Last Name',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.lastName ? item.lastName : ''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'firstName',
        'title': 'First Name',
        'template': (item) => {
          // GUI differentiates inactive and active users under grid.
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.firstName ? item.firstName : ''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'emailAddress',
        'title': 'Email',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.emailAddress ? item.emailAddress : ''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'department',
        'title': 'Department',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.department ? item.department : ''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'phoneNumber',
        'title': 'Phone Number',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.phoneNumber ? item.phoneNumber : ''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'isActive',
        'title': 'Is Active',
        'template': (item) => {
          const checked = item.isActive ? 'checked' : '';
          return `<input type="checkbox" value="${item.isActive}" ${checked} disabled>`;
        }
      },
      {
        'field': 'accountType',
        'title': 'Type',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          let accType = item.accountType ? item.accountType : '';
          if(accType && accType != "Person") {
            accType += " Group";
          }
          return `<span class="${userClass}">${accType}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'lastLoginDate',
        'title': 'Last Login',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.lastLoginDate ? item.lastLoginDate : ''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'field': 'status',
        'title': 'Status',
        'template': (item) => {
          const userClass = (item.isActive) ? 'inActiveUser' : 'activeUser';
          return `<span class="${userClass}">${item.status ? item.status:''}</span>`;
        },
        filterable: {
          multi: true,
          search: true
        }
      },
      {
        'command': [{
          name: 'delete',
          text: '',
          iconClass: 'k-icon k-i-delete',
          click: this.revoke.bind(this)
        }],
        width: 60
      }
    ];
    grid: any = null;

    constructor(private appStateService: AppStateService, private accountdetailsService: AccountDetailsService, private dialogService: DialogService) {
      $ = window['jQuery'];
      this.appStateService.subscribe(USER_MEMBERS_RESULT, this.onGridData.bind(this));
      this.appStateService.subscribe(USER_RESULT_DATA_CLEAR, this.clearGrid.bind(this));
      this.appStateService.subscribe(SEARCH_RESULT, this.onSearchData.bind(this));
      this.appStateService.subscribe(TOGGLE_COMMAND_COLUMN, this.toggleCommandColumn.bind(this));
    }

    ngOnInit() {
      this.initGrid();
      this.initMemberSearch();
    }

    ngAfterViewInit(): void {
      this.memberSearchDisabled(true);
    }

    initGrid() {
      const self = this;
      const gridAccountTabDetails = (this.appStateService.getAccountTabDetails());

      this.gridOptions = {
        columns: this.gridColumns,
        toolbar: [
          {
            template: this.getMemberSearchTemplate()
          },
          'excel'
        ],

        excelExport: (e) => {
          if (!self.gridDataSource || this.gridDataSource.length === 0) {
            e.preventDefault();
            return;
          }
          const user = self.appStateService.getSelectedAccountInformation().user;
          const exportAccName = user.accountName;
          const fileName = `Members for ${exportAccName}`;
          const sheet = e.workbook.sheets[0];

          //refactor and use forEach
          sheet.rows.forEach((row, rowId) => {
            sheet.rows[rowId].cells.forEach((cell, cellId) => {
              sheet.rows[rowId].cells[cellId].hAlign = 'left';
            });
          });
          const exportWorkbook = new kendoWork.ooxml.Workbook({
            sheets: [
              {
                  columns: sheet.columns,
                  title: 'Member list',
                  rows: sheet.rows
              }
            ]
          });

          kendoWork.saveAs({
              dataURI: exportWorkbook.toDataURL(),
              fileName: `${fileName}.xlsx`
          });
          e.preventDefault();
        },
        resizable: true,
        selectable: true,
        filterable: true,
        sortable: true,
        dataSource : {
          data: [],
          schema: {
            model: {
              id: 'accountId',
              fields: {
                isActive: { type: "boolean" }
              }
            }
          }
        },
        dataBound: function(e: Event) {
          (e as any).sender.element.find('.accountLink').bind('click', function(event: Event) {
            self.loadAccountDetails((event as any).target.text);
          });
        },
        filterMenuInit:
        function onColumnMenuInit(e) {
            e.container.data("kendoPopup").bind("open", function () {
                var filterMultiCheck = e.container.find(".k-filterable").data("kendoFilterMultiCheck");

                var currentData = e.sender.dataSource.data()
                if (filterMultiCheck) {
                    filterMultiCheck.container.empty();
                    filterMultiCheck.checkSource.data(currentData);
                    filterMultiCheck.createCheckBoxes();
                }
            });
        }
      };
      $('#members-grid').kendoGrid(this.gridOptions);
      this.grid = $('#members-grid').data('kendoGrid');
    }

    getMemberSearchTemplate() {
      const result = `<div class="member-search-con"><label>Add
        <input id="member-search" class="member-search" placeholder="Search account"></label>
        <ul id="member-search-result"></ul>
      </div>`;

      return result;
    }

    initMemberSearch() {
      const memberSearch = document.getElementById('member-search');

      const searchStream = Observable.fromEvent(memberSearch, 'keyup')
            .map((e: any) => e.target.value.trim())
            .debounceTime(150);

      const action = {
          type: SEARCH,
          source: 'MembersComponent',
          payload: {
            searchStream: searchStream
          }
      };

      this.appStateService.dispatch(action);

      //Fix for issue in CME-6922 (happens only for IE 11 and Edge) where the search result popup was not visible completely. It was clipped.
      //Instead of specifying display as none in css, it is done here. This fixes the issue
      $('#member-search-result').css('display', 'none')
                                .on('click', this.selectSearchItem.bind(this));

      //Hide #member-search-result when user clicks else where
      $(document).on('click', (e) => {
        const input = document.getElementById('member-search');
        const searchResults = document.getElementById('member-search-result');

        if (e.target !== input && e.target !== searchResults) {
          this.hideSearchResult();
        }
      });
    }

    onGridData(action): void {
      const { members } = action.payload.data;

      //Grid will be null in following use case
      //1) Navigate directly to hostname/accountDetails/groups from browser address bar
      //2) enter a valid account name and press enter
      //3) Once the data is loaded, select any ADB group from Accounts Tree
      if(!this.grid || !members) {// if member data not found, we return it to avoid error in app
        return;
      }

      //Create new DataSource everytime for filters to work
      this.grid.setDataSource(new kdata.DataSource({
        data: members,
        schema: {
          model: {
            id: 'accountId',
            fields: {
              isActive: { type: "boolean" }
            }
          }
        }
      }));

      this.gridDataSource = members;
    }

    clearGrid(action): void {
      if (this.grid && this.grid.dataSource) {
        //Assigning new data source fixes the issue with column filter showing old values
        //and also the filter icon is reset if any filter was applied earlier
        this.grid.setDataSource(new kdata.DataSource({
          data: [],
          schema: {
            model: {
              id: 'accountId',
              fields: {
                isActive: { type: "boolean" }
              }
            }
          }
        }));
        //this.grid.dataSource.data([]);
      }

      this.memberSearchDisabled(true);
    }

    onSearchData(action) {
      if (action.source !== 'MembersComponent') {
        return;
      }

      const data = action.payload.data;
      const searchBox = document.getElementById("member-search");
      const resultBox = $("#member-search-result");
      resultBox.empty();

      this.recentCachedSearch = data;

      $.each(data, (index, item) => {
          const name = item.displayName;
          item.name = name;
          item.isGroup = item.accountType.toLowerCase() !== 'person';

          const iconType = item.isGroup === true ? 'group' : 'person';
          const inactive = item.isActive === true ? '' : 'inactive';

          resultBox.append(
            `<li data-accountId="${item.accountId}">
                <div class="icon ${iconType}"></div>
                <span class="displayname ${inactive}">${name}</span>
              </li>`
          );
      });

      let display = data.length > 0 || searchBox["value"].trim() ? "block" : "none";
      resultBox.css("display",display);

      if(resultBox.children().length === 0 && display === 'block'){
        resultBox.append(`<li id="no-result-item">No results found</li>`);
      }
    }

    selectSearchItem(e) {
      let el = e.target;

      if (el.tagName !== "LI" && el.tagName !== "SPAN") {
        return;
      }

      if(el.tagName === 'SPAN') {
        el = el.parentNode;
      }

      let id = el.dataset["accountid"];

      if (!id) {
        return;
      }

      let result = this.recentCachedSearch.find((item) => {
          return item.accountId === parseInt(id);
      });

      let { user, members, deletedMembers } = this.appStateService.getSelectedAccountInformation();

      let selectedAccount = user ? user.accountName.toLowerCase() : "";

      //Do not allow parent group as its own member
      if(result && result.accountName.toLowerCase() !== selectedAccount) {
        const item = this.grid.dataSource.get(result.accountId);
        if(!item) {
          //The schema for the grid holds accountName in name property.
          //So populate name with accountName value for it to be displayed correctly in grid
          result.name = result.accountName;
          result.state = "Added";//This is used when data is saved

          if(!result.status)
            result.status = "Current";

          this.grid.dataSource.insert(0, result);
          this.updateAccountsTree(user.accountName, result, true);

          if(members) {
            members.push(result);
          }

          if(deletedMembers) {
            let idex = -1;
            //If added account is present in deletedAccounts, then remove it
            let ac = deletedMembers.find((current, index) => {
              idex = index;
              return result.accountName == current.accountName;
            });

            if(ac) {
              deletedMembers.splice(idex,1);
            }
          }

          this.appStateService.enableSaveAllBtn(true);

          //Since the account was removed from group, change the state only if it Original because we dont want to state from Added (if a new account) to Modified
          if(user.state == "Original") {
            user.state = "Modified";
          }
        }
      }

      $('#member-search').val('');
    }

    toggleCommandColumn(action): void {
      if (this.grid) {
        const { columns } = this.grid.getOptions();

        //For Impersonator role, do not enable search box and command column

        if (action.payload.showColumn && !this.appStateService.isImpersonatorRole) {
          this.grid.showColumn(columns.length - 1);
          this.memberSearchDisabled(false);
        } else {
          this.grid.hideColumn(columns.length - 1);
          this.memberSearchDisabled(true);
        }
      }
    }

    hideSearchResult(): void {
      let resultBox = $("#member-search-result");
      resultBox.empty();
      // Fix for issue where the scroll position was retained on sub-sequent search
      resultBox.prop("scrollTop", 0);
      resultBox.css("display","none");
    }

    memberSearchDisabled(value: boolean): void {
      const div = document.querySelector(".member-search-con");
      if (div) {
        div.classList.toggle("disabled", value);
      }
    }

    revoke(e) {
      let self = this;
      /* let action = confirm("Are you sure?");

      if(!action) {
        return false; // prevent page refresh
      } */

      let dialog = this.dialogService.open({
        title: "Confirm",
        content: DELETE_MEMBER,
        actions: [
          { text: "Yes", primary: true },
          { text: "No" }
        ]
      });

      dialog.result.subscribe((result) => {
        if (result["text"] == "Yes") {
          const anchor = e.currentTarget;
          const $tr = $(anchor).closest("tr");
          const uid = $tr.data("uid");
          const di = self.grid.dataSource.getByUid(uid);
          self.grid.dataSource.remove(di);

          let selectedAccount = self.appStateService.getSelectedAccountInformation();
          //Since the instances in selectedAccount and accountDetailsMap in state.accountPanel is diferent, take the one from accountDetailsMap
          selectedAccount = self.appStateService.getAcccountInformation(selectedAccount.user.accountName)
          //Maintain a list of deleted members to be sent to server on Save All
          selectedAccount.deletedMembers = selectedAccount.deletedMembers || [];

          di.state = "Deleted";
          selectedAccount.deletedMembers.push(di);

          //Remove account from members array to persist the change
          let idex = -1;
          let ac = selectedAccount.members.find((current, index) => {
            idex = index;
            return di.accountId == current.accountId;
          });

          if(ac) {
            selectedAccount.members.splice(idex,1);
            self.updateAccountsTree(selectedAccount.user.accountName, ac, false);

            //Since the account was removed from group, change the state only if it Original because we dont want to state from Added (if a new account) to Modified
            if(selectedAccount.user.state == "Original") {
              selectedAccount.user.state = "Modified";
            }
          }

          this.appStateService.enableSaveAllBtn(true);
        }
      });

      return false; // prevent page refresh
    }

    loadAccountDetails(accountName) {
      this.appStateService.dispatch({
        type: USER_SEARCH,
        reqType: 'POST',
        payload: {
            classify: 'ACC_SEARCH',
            url : USERACCOUNT_URL,
            query : accountName
        }
      });
      // const nextActionType = 'user account search result';
      const nextActionType = USER_SEARCH_RESULT;
      const type = this.USER;
      this.accountdetailsService.setStateMembersSearched(false);
      this.accountdetailsService.setStateGroupsSearched(false);
      this.accountdetailsService.clearFetchedData();
      // Check in cache. Do not make a call everytime - Jasmine
      // this.appStateService.dispatch(actions);
      // this.accountdetailsService.reqRespService(actions, nextActionType, type);
    }

    updateAccountsTree(accountName, member:any, addMember:boolean) {
      let action = {
        type: UPDATE_GROUP_MEMBER,
        payload: {
          accountName: accountName,
          member: member,
          addMember: addMember
        }
      }

      this.appStateService.dispatch(action);
    }
  }
