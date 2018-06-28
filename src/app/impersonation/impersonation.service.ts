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
import { IMPERSONATION_ACCOUNT_LIST, IMPERSONATION_ACCOUNT_LIST_RESULT, IMPERSONATION_APPLICATIONS, IMPERSONATION_APPLICATIONS_RESULT, IMPERSONATED_APP_DATA, IMPERSONATED_APP_DATA_RESULT, NOTIFICATION, IMPERSONATION_ACCOUNT_NAMES, IMPERSONATION_ACCOUNT_NAMES_RESULT } from "../state/actions";
import { getErrorAction } from "../utils/parser-util";

@Injectable()
export class ImpersonationService {
    constructor(private http: Http, private stateService:AppStateService) {
        stateService.subscribe(IMPERSONATION_APPLICATIONS, this.getImpersonationApplications.bind(this));
        stateService.subscribe(IMPERSONATED_APP_DATA, this.getImpersonatedApplicationData.bind(this));
        stateService.subscribe(IMPERSONATION_ACCOUNT_LIST, this.getImpersonationAccountNames.bind(this));
    }

    getImpersonationApplications(action): void {
        this.stateService.showLoader(true);
        this.http.get(action.payload.url)
            .map((res:Response) => {
                const result = res.json();
                return result.model;
            })
            .catch(this.handleError.bind(this))
            .subscribe(data => {
                this.stateService.showLoader(false);
                action.payload.data = data;
                let nAction = {
                    type: IMPERSONATION_APPLICATIONS_RESULT,
                    payload: action.payload
                };

                this.stateService.dispatch(nAction);
            });
    }

    getImpersonatedApplicationData(action): void {
        let applicationId = action.payload.applicationId;
        //this.stateService.showLoader(true);
        this.http.get(action.payload.url+applicationId)
        .map((res:Response) => {
            const result = res.json();
            if("undefined" != typeof(result)) {
                return result.model;
            } else {
                return [];
            }

        })
        .catch(this.handleError.bind(this))
        .subscribe(data => {
            //this.stateService.showLoader(true);
            action.payload.data = data;

            let nAction = {
                type: IMPERSONATED_APP_DATA_RESULT,
                payload: action.payload
            };

            this.stateService.dispatch(nAction);
        });
    }

    getImpersonationAccountNames(action) {
        this.stateService.showLoader(true);
        let applicationId = action.payload.applicationId;
        this.http.get(action.payload.url+applicationId)
        .map((res:Response) => {
            const result = res.json();
            return result.model;
        })
        .catch(this.handleError.bind(this))
        .subscribe(data => {
            this.stateService.showLoader(false);
            action.payload.data = data;

            let nAction = {
                type: IMPERSONATION_ACCOUNT_LIST_RESULT,
                payload: action.payload
            };

            this.stateService.dispatch(nAction);
        });
    }

    handleError(err:any,caught): any {
        console.log(`AccountService Status: ${err.status} Message: ${err.statusText}`);
        this.stateService.showLoader(false);
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
