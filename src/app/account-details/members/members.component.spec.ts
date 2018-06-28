import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, DebugElement } from '@angular/core';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';

import { MembersComponent } from './members.component';
import { AccountDetailsService } from '../account-details.service';
import { AppStateService } from '../../state/app-state.service';
import { USER_MEMBERS_RESULT, TOGGLE_COMMAND_COLUMN, SEARCH_RESULT } from '../../state/actions';

describe('MembersComponent', () => {
  let $ = null,
      comp: MembersComponent,
      fixture: ComponentFixture<MembersComponent>,
      de: DebugElement,
      el: HTMLElement,
      stateService: AppStateService,
      testData = [
        {
          accountId: 659,
          name: 'hoblinr',
          firstName: 'Becca',
          lastName: 'Hoblin',
          accountType: 'Person',
          status: 'Current',
          department: 'TCM ABC',
          emailAddress: 'becca_hoblin@timeinc.com',
          phoneNumber: '+1 212 522 1050',
          isActive: true,
          lastLoginDate:"No Login"
        },
        {
          accountId:46,
          name:"yual",
          firstName:"Alice",
          lastName:"Yu",
          emailAddress:"alice.yu@aexp.com",
          department:"American Express",
          phoneNumber:"1 212 382 5600",
          isActive:false,
          accountType:"Person",
          lastLoginDate:"No Login",
          status:"Current"
        },
        {
          accountId:8,
          name:"derojasa",
          firstName:"Anthony",
          lastName:"DeRojas",
          emailAddress:"",
          department:"American Express",
          phoneNumber:"",
          isActive:false,
          accountType:"Person",
          lastLoginDate:"No Login",
          status:"Current"
        }
      ],
      searchTestData = [
        {
          accountId: 1,
          accountName: "@AMEX",
          displayName: "@AMEX",
          isActive: true,
          accountType: "ADB"
        },
        {
          accountId: 2,
          accountName: "@BMEX",
          displayName: "@BMEX",
          isActive: true,
          accountType: "ADB"
        },
        {
          accountId: 3,
          accountName: "@CMEX",
          displayName: "@CMEX",
          isActive: true,
          accountType: "ADB"
        },
        {
          accountId: 8,
          accountName: "derojasa",
          displayName: "Anthony DeRojas",
          isActive: false,
          accountType: "Person",
        }
      ],
      gridDataAction = {
        type: USER_MEMBERS_RESULT,
        payload: {
          data: {
            members: testData
          }
        }
      };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule],
      declarations: [MembersComponent],
      providers: [AppStateService, AccountDetailsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersComponent);
    comp = fixture.componentInstance;
    $ = window["jQuery"];
    de = fixture.debugElement.query(By.css("div"));
    el = de.nativeElement;
    stateService = fixture.debugElement.injector.get(AppStateService);
  });

  it("should be defined", () => {
    expect(comp).toBeDefined();
  });

  it("should have grid initialized", () => {
    fixture.detectChanges();

    let toolbarCreated = el.querySelector(".k-grid-toolbar") ? true : false;
    let gridHeaderCreated = el.querySelector(".k-grid-header") ? true : false;
    let gridContentCreated = el.querySelector(".k-grid-content") ? true : false;

    expect(toolbarCreated && gridHeaderCreated && gridContentCreated).toEqual(true);
  });

  it("should by default have 11 columns", () => {
    fixture.detectChanges();

    let headerRow = el.querySelector(".k-grid-header tr");

    expect(headerRow.children.length).toEqual(11);
  });

  it("should have search disabled by default", () => {
    fixture.detectChanges();

    let wrapper = el.querySelector(".k-grid-toolbar .member-search-con");

    expect(wrapper.classList.contains("disabled")).toEqual(true);
  });

  it("should have a 'Export to Excel' button in toolbar", () => {
    fixture.detectChanges();

    let anchor = el.querySelector(".k-grid-toolbar > a");

    expect(anchor && anchor.textContent === "Export to Excel").toEqual(true);
  });

  it("should show 3 records in the grid", () => {
    fixture.detectChanges();

    stateService.dispatch(gridDataAction);

    let rows = el.querySelectorAll(".k-grid-content tr");

    expect(rows && rows.length == 3).toEqual(true);
  });

  it("should enable search box when TOGGLE_COMMAND_COLUMN is dispatched when account type is ADB", () => {
    fixture.detectChanges();

    stateService.dispatch({
      type: TOGGLE_COMMAND_COLUMN,
      payload: {
        showColumn: true
      }
    });

    let wrapper = el.querySelector(".k-grid-toolbar .member-search-con");
    expect(wrapper.classList.contains("disabled")).toEqual(false);
  });

  it("should hide command column when TOGGLE_COMMAND_COLUMN is dispatched when account type is AD", () => {
    fixture.detectChanges();

    stateService.dispatch({
      type: TOGGLE_COMMAND_COLUMN,
      payload: {
        showColumn: false
      }
    });

    const headers = el.querySelectorAll(".k-grid-header th");
    const commandHeader = headers.item(headers.length-1);
    expect(commandHeader["style"].display).toEqual("none");
  });

  it("should not have #member-search-con visible initially", () => {
    fixture.detectChanges();
    let element = el.querySelector("#member-search-result");
    expect(element["style"].display).toBe("none");
  });

  it("should show search results", () => {
    fixture.detectChanges();
    let element = el.querySelector("#member-search-result");
    const action = {
                    type: SEARCH_RESULT,
                    source: "MembersComponent",
                    payload: {
                      data: searchTestData
                    }
                };
    stateService.dispatch(action);

    expect(element["style"].display).toEqual("block");
  });

  it("should display same search result names as returned by api", () => {
    fixture.detectChanges();
    let element = el.querySelector("#member-search-result");
    const action = {
                    type: SEARCH_RESULT,
                    source: "MembersComponent",
                    payload: {
                      data: searchTestData
                    }
                };
    stateService.dispatch(action);
    const span = element.querySelector("li > span");
    const testAccount = searchTestData[0];
    expect(span.textContent).toEqual(testAccount.accountName);
  });

  it("should allow selected searched account to be added to grid", () => {
    fixture.detectChanges();
    const element = el.querySelector("#member-search-result");
    stateService.setSelectedAccountTabDetails("user",{accountName:"@AMEX123"});
    const action = {
                    type: SEARCH_RESULT,
                    source: "MembersComponent",
                    payload: {
                      data: searchTestData
                    }
                };
    stateService.dispatch(action);

    const accountLi = element.querySelector("li");
    accountLi.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    const acNameCol = el.querySelector(".k-grid-content tr td");
    const testAccount = searchTestData[0];

    expect(acNameCol.textContent).toEqual(testAccount.accountName);
  });

  it("should not allow same account from search to be added to grid", () => {
    fixture.detectChanges();

    stateService.dispatch(gridDataAction);//populate grid

    const element = el.querySelector("#member-search-result");
    const action = {
                    type: SEARCH_RESULT,
                    source: "MembersComponent",
                    payload: {
                      data: searchTestData
                    }
                };
    stateService.dispatch(action);//show search results

    const accountLis = element.querySelectorAll("li");
    accountLis[accountLis.length-1].dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let rows = el.querySelectorAll(".k-grid-content tr");

    //row count should remain unchanged as duplicate records are not allowed
    expect(rows && rows.length == 3).toEqual(true);
  });

  it("should not allow selected account to be added as its own member from search result", () => {
    fixture.detectChanges();

    stateService.dispatch(gridDataAction);//populate grid

    //Set selected account
    stateService.setSelectedAccountTabDetails("user",{accountName:"@AMEX"});

    const element = el.querySelector("#member-search-result");
    const action = {
                    type: SEARCH_RESULT,
                    source: "MembersComponent",
                    payload: {
                      data: searchTestData
                    }
                };
    stateService.dispatch(action);

    const accountLi = element.querySelector("li");
    accountLi.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let rows = el.querySelectorAll(".k-grid-content tr");

    //row count should remain unchanged as account as a member of itself is not allowed
    expect(rows && rows.length == 3).toEqual(true);
  });
});
