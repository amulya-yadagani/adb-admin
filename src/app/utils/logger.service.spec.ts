import { ErrorHandler } from '@angular/core';
import { TestBed, async, inject, tick } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { LoggerService } from "./logger.service";
import { AppStateService } from "../state/app-state.service";
import { LOG_TO_SERVER } from "../state/actions";

describe("LoggerService", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        AppStateService,
        {
            provide: [Http]
        },
        { provide: ErrorHandler, useClass: LoggerService },
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });
  }));

  describe("logToServer()", () => {
    it("should be called when an error action is dispatched", async(inject([ErrorHandler, XHRBackend],(ls, mockBackend) => {
      const mockResponse = [];

      //Actual http call is not made. It is mocked using mockRespond
      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockResponse)
        })));
      });

      spyOn(ls,"logToServer");

      const service: AppStateService = ls["stateService"];
      const action = {
        type: LOG_TO_SERVER,
        payload: {
          data: new Error("Error to test")
        }
      }
      service.dispatch(action);

      //Need to wait for the logToServer() function to be called. Need to investigate why
      setTimeout(() => {
        expect(ls.logToServer).toHaveBeenCalled();
      }, 100);
    })));
  });
});
