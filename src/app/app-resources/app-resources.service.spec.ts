//Reference https://blog.thoughtram.io/angular/2016/11/28/testing-services-with-http-in-angular-2.html
import { TestBed, async, inject } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { AppResourcesService } from "./app-resources.service";
import { AppStateService } from "../state/app-state.service";
import { APP_LIST, APP_LIST_RESULT, APP_RESOURCES, APP_RESOURCES_RESULT } from "../state/actions";
import { APP_LIST_URL } from "../utils/constants";

describe("AppResourcesService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        AppStateService,
        AppResourcesService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });
  });

  describe("getApplications()", () => {
    it("should return a list of application resources", inject([AppResourcesService, XHRBackend],(ars, mockBackend) => {
      const mockResponse = {
          model: [
          {
              "name": "CircManagerNet",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "ADBAdmin",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "JobTrackerTAG",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "CircManagerRestriction",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "CircManagerNetExt",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "CircManagerNetIntl",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "AuthorizationCampaign",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          },
          {
              "name": "DMCampaign",
              "spriteCssClass": "application",
              "resourceTypeName": "Application"
          }]
        };

      //Actual http call is not made. It is mocked using mockRespond
      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockResponse)
        })));
      });

      const service:AppStateService = ars["stateService"];
      service.subscribe(APP_LIST_RESULT, (action) => {
        expect(action.payload.data.length).toEqual(mockResponse.model.length);
      });

      service.dispatch({
        type: APP_LIST,
        payload: {
          url: APP_LIST_URL
        }
      });
    }))
  })
});
