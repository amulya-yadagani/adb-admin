import { TestBed, async, inject} from '@angular/core/testing';
import { Http, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { AccountService } from './accounts.service';
import { AppStateService } from "../state/app-state.service";
import { ROOT_ACCOUNT, ROOT_ACCOUNT_RESULT, SEARCH, SEARCH_RESULT, SEARCH_ERROR } from "../state/actions";
import { Observable, Subject } from 'rxjs/Rx';

describe('AccountService', () => {
    let service: AccountService;
    let stateService: AppStateService;
    const subject = new Subject();
    let stream = Observable.from(subject);
    const action = new Object({
                    type: ROOT_ACCOUNT,
                    payload: {
                        url: 'http://tmpcmamva04/AdbAdminApi/api/AccountNav/I',
                        event: {},
                        accountId: '443'
                    }
                })
    const search_action = {
        type: SEARCH,
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
            imports: [ HttpModule ],
            providers: [
              AccountService,
              AppStateService ,
              {
                  provide: [Http]
              },
              { provide: XHRBackend, useClass: MockBackend }
            ],
        });
    }));

    describe("getAccounts()", () => {
      it('should be able to get accounts', async(inject([AccountService,XHRBackend], (service: AccountService,mockBackend) => {
        mockBackend.connections.subscribe((connection) => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockResponse)
          })));
        });

        stateService = service['stateService'];
        stateService.subscribe(ROOT_ACCOUNT_RESULT,(result) => {
            expect(result.payload.data.length).toEqual(mockResponse.model.length);
        });
        stateService.dispatch(action);
      })));

      it("should error out when api call fails", async(inject([AccountService,XHRBackend], (service: AccountService,mockBackend) => {
        mockBackend.connections.subscribe((connection) => {
          connection.mockError({
            status:404,
            statusText: "Error occurred successfully"
          });
        });

        stateService = service['stateService'];

        /* stateService.subscribe(ROOT_ACCOUNT_RESULT,(result) => {
            expect(result.payload.data.status).toEqual(404);
        }); */
        spyOn(service,"handleError").and.returnValue([]);

        stateService.dispatch(action);

        expect(service.handleError).toHaveBeenCalled();
      })));
    });

    describe("searchAccounts()", () => {
      it('should be able to search with given search criteria', async(inject([AccountService,XHRBackend], (service: AccountService, mockBackend) => {
        mockBackend.connections.subscribe((connection) => {
          connection.mockRespond(new Response(new ResponseOptions({
            body: JSON.stringify(mockResponse)
          })));
        });

        stateService = service['stateService'];
        stateService.subscribe(SEARCH_RESULT,(result) => {
            expect(result.payload.data.length).toEqual(mockResponse.model.length);
        });
        stateService.dispatch(search_action);

        //Using a subject to mock keyup event
        subject.next("abc");
      })));

      it("should error out when api call fails", async(inject([AccountService,XHRBackend], (service: AccountService,mockBackend) => {
        mockBackend.connections.subscribe((connection) => {
          connection.mockError({
            status:404,
            statusText: "Error occurred successfully"
          });
        });

        stateService = service['stateService'];
        spyOn(service,"handleSearchError").and.returnValue([]);
        /* stateService.subscribe(SEARCH_ERROR,(result) => {
            expect(result.payload.data.length).toEqual(0);
        }); */

        stateService.dispatch(search_action);
        //Using a subject to mock keyup event
        subject.next("abc");

        expect(service.handleSearchError).toHaveBeenCalled();
      })));
    });
});
