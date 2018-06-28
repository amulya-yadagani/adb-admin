import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { AppStateService } from "../state/app-state.service";
import { ACCOUNTS_SEARCH_URL } from "../utils/constants";
import { SEARCH_ERROR as SEARCH_ERROR_MSG, GET_ACCOUNTS_ERROR } from "../utils/messages";
import { ROOT_ACCOUNT, ROOT_ACCOUNT_RESULT, SEARCH, SEARCH_RESULT, SEARCH_ERROR, NOTIFICATION } from "../state/actions";
import { getErrorAction } from "../utils/parser-util";

@Injectable()
export class AccountService {

    constructor(private http: Http, private stateService:AppStateService) {
        stateService.subscribe(ROOT_ACCOUNT, this.getAccounts.bind(this));
        stateService.subscribe(SEARCH, this.searchAccounts.bind(this));
    }

    getAccounts(action) {
        this.http.get(action.payload.url)
            .map((res:Response) => {
              const result = res.json();
              return result.model;
            })
            .catch(this.handleError.bind(this))
            .subscribe(data => {
                action.payload.data = data;

                let nAction = {
                    type: ROOT_ACCOUNT_RESULT,
                    payload: action.payload
                };

                this.stateService.dispatch(nAction);

                //Also update the store
                if(action.payload.accountId) {
                  this.stateService.setGroupChidren(action.payload.accountId, data);
                }
            });
    }

    searchAccounts(action) {
        const searchStream = action.payload.searchStream;
        let keyword = "";

        const resultStream = searchStream.switchMap((query => {
            if(!query/*  || query.length < 3 */) {
                return Observable.of([]);//return Observable that emits empty array
            }

            const url = ACCOUNTS_SEARCH_URL; //+ query;
            keyword = query;

            return this.http.post(url,{keyword:query})
                       .map((res:Response) => res.json().model)
                       .catch(this.handleSearchError(resultStream));
        }));

        resultStream.subscribe(data => {
          let newAccounts = this.stateService.getNewAccounts();
          //Add new accounts the user chose to add
          if(newAccounts) {
            let result = newAccounts.filter(item => {
              let displayName = item.displayName.toLowerCase();
              return displayName.search(keyword) != -1;
            });
            data = data.concat(result);
          }

          const act = {
            type: SEARCH_RESULT,
            source: action.source,
            payload: {
              data: data
            }
          }
          this.stateService.dispatch(act);
        });
    }

    /**
     * Handle the error to keep the stream alive and continue emitting key events
     * If the error is not handled, the subsequent search requests are not made
     */
    handleSearchError(retryStream:any): any {
        const self = this;

		    return (err, caught) => {
          console.log(err);

          const act = {
            type: SEARCH_ERROR,
            payload: {
              data: []
            }
          }

          self.stateService.dispatch(act);

          const nAction = {
            type: NOTIFICATION,
            payload: {msg: `${SEARCH_ERROR_MSG}: ${err.statusText}`}
          };

          self.stateService.dispatch(nAction);

          const errAction = getErrorAction(err, "handleSearchError()", "accounts.service.ts");
          self.stateService.dispatch(errAction);

          return retryStream;
        };
    }

    handleError(err:any,caught): any {
        console.log(`AccountService Status: ${err.status} Message: ${err.statusText}`);

        const nAction = {
            type: NOTIFICATION,
            payload: {msg: `${GET_ACCOUNTS_ERROR}: ${err.statusText}`}
        };

        this.stateService.dispatch(nAction);

        const errAction = getErrorAction(err, "getAccounts()", "accounts.service.ts");
        this.stateService.dispatch(errAction);

        //Return observable that emits empty array. This will call fn passed to subscribe() with value as []
        return Observable.of([]);
    }
}
