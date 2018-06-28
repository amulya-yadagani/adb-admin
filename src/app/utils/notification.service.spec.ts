import { TestBed, ComponentFixture, inject } from "@angular/core/testing";
import { jQuery as $ } from "@progress/kendo-ui/js/kendo.core.js";

import { AppComponent } from '../app.component';
import { AccountPanelComponent } from "../accounts/accounts.component";

import { NotificationService } from "./notification.service";
import { AppStateService } from "../state/app-state.service";

import { NOTIFICATION } from "../state/actions";

describe("NotificationService", () => {
  let service = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        AppStateService,
        NotificationService
      ]
    }).compileComponents();

    window["jQuery"] = $;
    $(document.body).append(`<div id="notification"></div>`);
  });

  it('should show test message', inject([AppStateService,NotificationService],(as,ns) => {

    let action = {
      type: NOTIFICATION,
      payload: {
        msg: "This is a test message"
      }
    };

    as.dispatch(action);

    let el = $("#notification");
    expect(el.text()).toEqual("This is a test message");

  }));
});
