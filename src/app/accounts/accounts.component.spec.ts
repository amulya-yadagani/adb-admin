import { async, ComponentFixture, TestBed, tick, fakeAsync, inject } from "@angular/core/testing";
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from "@angular/core";
import { Http, HttpModule, ResponseOptions, XHRBackend, Response } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable, Subject } from 'rxjs/Rx';

import { AccountPanelComponent } from "./accounts.component";
import { AccountService } from "./accounts.service";
import { AppStateService } from "../state/app-state.service";
import { ROOT_ACCOUNT_RESULT, SEARCH, SEARCH_RESULT } from "../state/actions";
import { ACCOUNT_ALL, ACCOUNT_ACTIVE } from "../utils/constants";

describe("AccountPanelComponent", () => {
  let $ = null,
      comp: AccountPanelComponent,
      fixture: ComponentFixture<AccountPanelComponent>,
      de: DebugElement,
      el: HTMLElement,
      stateService: AppStateService,
      adbGroupResult: any = [
                        {
                          accountId: "1",
                          accountName: "@AMEX",
                          displayName: "@AMEX",
                          isActive: true,
                          accountType: "ADB"
                        },
                        {
                          accountId: "2",
                          accountName: "@BMEX",
                          displayName: "@BMEX",
                          isActive: true,
                          accountType: "ADB"
                        },
                        {
                          accountId: "3",
                          accountName: "@CMEX",
                          displayName: "@CMEX",
                          isActive: true,
                          accountType: "ADB"
                        }
                      ],

      filterTestData: Array<any> = [
        {
          accountId: "10",
          accountName: "Active account 1",
          displayName: "Active account 1",
          isActive: true,
          accountType: "Person"
        },
        {
          accountId: "11",
          accountName: "Inactive account 1",
          displayName: "Inactive account 1",
          isActive: false,
          accountType: "Person"
        },
        {
          accountId: "12",
          accountName: "Active account 2",
          displayName: "Active account 2",
          isActive: true,
          accountType: "Person"
        },
        {
          accountId: "13",
          accountName: "Inactive account 2",
          displayName: "Inactive account 2",
          isActive: false,
          accountType: "Person"
        },
        {
          accountId: "14",
          accountName: "Inactive account 3",
          displayName: "Inactive account 3",
          isActive: false,
          accountType: "Person"
        }
      ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AccountPanelComponent],
      providers: [AppStateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPanelComponent);
    comp = fixture.componentInstance;
    $ = window["jQuery"];
    de = fixture.debugElement.query(By.css("div"));
    el = de.nativeElement;
    stateService = fixture.debugElement.injector.get(AppStateService);
  });

  it("should be defined", () => {
    expect(comp).toBeDefined();
  });

  it("should have search container div", () => {
    let element = el.querySelector(".search-container");
    expect(element.tagName).toBe("DIV");
  });

  it("should not have #search-results visible initially", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    expect(element["style"].display).toBe("none");
  });

  it("should have accounts div", () => {
    let element = el.querySelector("#accounts");
    expect(element.tagName).toBe("DIV");
  });

  it("should show account tree", () => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    expect(element.tagName).toEqual("UL");
  });

  it("should show account tree with 3 nodes", () => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    expect(element.children.length).toEqual(3);
  });

  it("should load child nodes for ADB Groups", () => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: element.children[0]
                      },
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    let liEl = element.children[0];
    let groupUL = liEl.querySelector("ul");
    expect(groupUL.children.length).toEqual(3);
  });

  it("should display group icon for group account type", () => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: element.children[0]
                      },
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    let liEl = element.children[0];
    let spanNodeList = liEl.querySelectorAll("ul > li span[class*='group']");
    //We should have 3 spans with class as group
    expect(spanNodeList.length).toEqual(3);
  });

  it("should display person icon for person account type", () => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: element.children[2]
                      },
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    let liEl = element.children[2];
    let spanNodeList = liEl.querySelectorAll("ul > li span[class*='person']");
    //We should have 5 spans with class as person
    expect(spanNodeList.length).toEqual(5);
  });

  it("should load cached child nodes for ADB Groups when it is expanded the second time", () => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: element.children[0]
                      },
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    //Cache the data
    stateService.setGroupChidren("root_adb", adbGroupResult);

    //Once the node is expanded, clear the tree
    comp.reset(el.querySelector("#search-box"));

    spyOn(stateService,"dispatch");

    let appTree = $("#accounts").data("kendoTreeView");
    let adbNode = appTree.findByText("ADB Groups");
    appTree.expand(adbNode);//Expand root node

    //Api call should not be made if data is cached
    expect(stateService.dispatch).toHaveBeenCalledTimes(0);
  });

  it("should show search results", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    expect(element["style"].display).toEqual("block");
  });

  it("should populate search box with selected search result", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    let li = element.children[0];
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    let searchBox = el.querySelector("#search-box");
    expect(searchBox["value"]).toContain("@AMEX");
  });

  it("should display selected search result group account under respective root node in tree", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    let li = element.children[0];
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let treeUL = el.querySelector("#accounts > ul");
    let liEl = treeUL.children[0];//ADB root node
    let spanNodeList = liEl.querySelectorAll("ul > li span[class*='group']");
    //ADB Node should have one group account selected from search result
    expect(spanNodeList.length).toEqual(1);
  });

  it("should display selected search result person account under respective root node in tree", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    let li = element.children[0];
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let treeUL = el.querySelector("#accounts > ul");
    let liEl = treeUL.children[2];//Individuals root node
    let spanNodeList = liEl.querySelectorAll("ul > li span[class*='person']");
    //Individuals Node should have one person account selected from search result
    expect(spanNodeList.length).toEqual(1);
  });

  it("should display group icon for group account type for search results", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);

    let divNodeList = element.querySelectorAll("li div[class*='group']")
    expect(divNodeList.length).toEqual(3);
  });

  it("should display person icon for person account type for search results", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    let divNodeList = element.querySelectorAll("li div[class*='person']")
    expect(divNodeList.length).toEqual(5);
  });

  it("should clear search results", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: adbGroupResult
                    }
                };
    stateService.dispatch(action);
    comp.reset(el.querySelector("#search-box"));
    expect(element["style"].display).toEqual("none");
  });

  /* it("should show 'Please enter atleast 3 letters' when search string has 1 to 3 letters", () => {
    fixture.detectChanges();
    let searchBox = el.querySelector("#search-box");
    searchBox["value"] = "qw";//set search string

    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: []
                    }
                };
    stateService.dispatch(action);

    let li = element.children[0];

    expect(li.textContent).toEqual("Please enter atleast 3 letters");
  }); */

  it("should show 'No results found' when no accounts are found after search", () => {
    fixture.detectChanges();
    let searchBox = el.querySelector("#search-box");
    searchBox["value"] = "qwa";//set search string

    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: []
                    }
                };
    stateService.dispatch(action);

    let li = element.children[0];

    expect(li.textContent).toEqual("No results found");
  });

  it("should display accounts filter in panel header", () => {
    let element = el.querySelector("#filter-con");
    expect(element).toBeDefined();
  });

  it("should not display accounts filter menu options by default", () => {
    let element = el.querySelector("#filter-menu");
    let style = window.getComputedStyle(element);
    expect(style.display).toEqual("none");
  });

  it("should render menu options", () => {
    fixture.detectChanges();
    let element = el.querySelector("#filter-menu");
    let li = element.children[0];
    expect(li.textContent).toEqual("All");
  });

  it("should display menu options on mouseenter event", () => {
    fixture.detectChanges();
    comp.toggleFilterMenu(true);
    let ul = el.querySelector("#filter-menu");
    let style = window.getComputedStyle(ul);
    expect(style.display).toEqual("block");
  });

  it("should hide menu options on mouseleave event", () => {
    fixture.detectChanges();
    comp.toggleFilterMenu(false);
    let ul = el.querySelector("#filter-menu");
    let style = window.getComputedStyle(ul);
    expect(style.display).toEqual("none");
  });

  it("should show selected filter value as All by default", () => {
    fixture.detectChanges();
    let element = el.querySelector("#filter-label");
    expect(element.textContent).toEqual(ACCOUNT_ALL);
  });

  it("should show filter value as Active on selection", () => {
    fixture.detectChanges();
    let ul = el.querySelector("#filter-menu");
    let li = ul.children[1];
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    let element = el.querySelector("#filter-label");
    expect(element.textContent).toEqual(ACCOUNT_ACTIVE);
  });

  it("should display all(active and inactive) accounts by default", () => {
    fixture.detectChanges();

    let element = el.querySelector("#accounts > ul");
    let indAccLi = element.children[2];
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: indAccLi
                      },
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    indAccLi = element.children[2];
    let filteredUl = indAccLi.querySelector("ul");
    expect(filteredUl.children.length).toEqual(5);
  });

  it("should display only active accounts when active filter is selected", () => {
    fixture.detectChanges();

    let element = el.querySelector("#accounts > ul");
    let indAccLi = element.children[2];
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: indAccLi
                      },
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    let ul = el.querySelector("#filter-menu");
    let li = ul.children[1];//Active option
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    indAccLi = element.children[2];
    let filteredUl = indAccLi.querySelector("ul");
    expect(filteredUl.children.length).toEqual(2);
  });

  it("should display only inactive accounts when inactive filter is selected", () => {
    fixture.detectChanges();

    let element = el.querySelector("#accounts > ul");
    let indAccLi = element.children[2];
    const action = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: {
                      event: {
                        node: indAccLi
                      },
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    let ul = el.querySelector("#filter-menu");
    let li = ul.children[2];//Inactive option
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    indAccLi = element.children[2];
    let filteredUl = indAccLi.querySelector("ul");
    expect(filteredUl.children.length).toEqual(3);
  });

  it("should display all(active and inactive) accounts for search result when selected filter is All", () => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    expect(element.children.length).toEqual(5);
  });

  it("should display only active accounts for search result when selected filter is Active", () => {
    fixture.detectChanges();
    let ul = el.querySelector("#filter-menu");
    let li = ul.children[1];//Active option
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    expect(element.children.length).toEqual(2);
  });

  it("should display only inactive accounts for search result when selected filter is Inactive", () => {
    fixture.detectChanges();
    let ul = el.querySelector("#filter-menu");
    let li = ul.children[2];//Inactive option
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData
                    }
                };
    stateService.dispatch(action);

    expect(element.children.length).toEqual(3);
  });

  it("should display 'No results found' for search result when selected filter is Active and returned result has only inactive accounts", () => {
    fixture.detectChanges();
    let ul = el.querySelector("#filter-menu");
    let li = ul.children[1];//Active option
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData.filter((item) => !item.isActive)
                    }
                };
    stateService.dispatch(action);
    li = element.children[0];
    expect(li.textContent).toEqual("No results found");
  });

  it("should display 'No results found' for search result when selected filter is Inactive and returned result has only active accounts", () => {
    fixture.detectChanges();
    let ul = el.querySelector("#filter-menu");
    let li = ul.children[2];//Inactive option
    li.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    let element = el.querySelector("#search-results");
    const action = {
                    type: SEARCH_RESULT,
                    source: "AccountPanelComponent",
                    payload: {
                      data: filterTestData.filter((item) => item.isActive)
                    }
                };
    stateService.dispatch(action);
    li = element.children[0];
    expect(li.textContent).toEqual("No results found");
  });
});

describe("AccountPanelcomponent integration", () => {
  let $ = null,
  comp: AccountPanelComponent,
  fixture: ComponentFixture<AccountPanelComponent>,
  de: DebugElement,
  el: HTMLElement,
  stateService: AppStateService;
  const subject = new Subject();
  let stream = Observable.from(subject);
  const search_action = {
    type: SEARCH,
    source: "AccountPanelComponent",
    payload: {
        searchStream: stream
    }
  };

  const mockResponse = {
    model: [
      {
        accountId: "1",
        accountName: "@AMEX",
        displayName: "@AMEX",
        isActive: true,
        isGroup: true,
        accountType: "ADB"
      },
      {
        accountId: "2",
        accountName: "@BMEX",
        displayName: "@BMEX",
        isActive: true,
        isGroup: true,
        accountType: "ADB"
      },
      {
        accountId: "3",
        accountName: "@CMEX",
        displayName: "@CMEX",
        isActive: true,
        isGroup: true,
        accountType: "ADB"
      }
    ]};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,HttpModule],
      declarations: [AccountPanelComponent],
      providers: [AppStateService,AccountService,
        {
          provide: [Http]
        },
        { provide: XHRBackend, useClass: MockBackend }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPanelComponent);
    comp = fixture.componentInstance;
    $ = window["jQuery"];
    de = fixture.debugElement.query(By.css("div"));
    el = de.nativeElement;
    stateService = fixture.debugElement.injector.get(AppStateService);
  });

  it("should load child nodes from mock backend for ADB Groups when it is expanded", async(inject([AccountService,XHRBackend],(as:AccountService,mockBackend) => {
    fixture.detectChanges();
    let element = el.querySelector("#accounts > ul");
    let appTree = $("#accounts").data("kendoTreeView");
    let adbNode = appTree.findByText("ADB Groups");

    mockBackend.connections.subscribe((connection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(mockResponse)
      })));
    });

    stateService.subscribe(ROOT_ACCOUNT_RESULT,(action) => {
      adbNode = appTree.findByText("ADB Groups");
      expect(adbNode.find("li").length).toEqual(3);
    });

    appTree.expand(adbNode);
  })));

  it("should display results when search is performed", async(inject([AccountService,XHRBackend],(as:AccountService,mockBackend) => {
    fixture.detectChanges();
    let element = el.querySelector("#search-results");

    mockBackend.connections.subscribe((connection) => {
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(mockResponse)
      })));
    });

    stateService.subscribe(SEARCH_RESULT,(action) => {
      expect(element.children.length).toEqual(3);
    });

    stateService.dispatch(search_action);

    //Using a subject to mock keyup event
    subject.next("abc");
  })))
})
