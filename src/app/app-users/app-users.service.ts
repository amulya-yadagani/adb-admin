import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { AppStateService } from '../state/app-state.service';
import {
    APPLICATIONS,
    APPLICATIONS_RESULT,
    ROLES,
    ROLES_RESULT,
    USERS_DATA,
    USERS_DATA_RESULT
} from '../state/actions';
import { APPLICATION_USER_URL, APPLICAION_ROLES_URL, APPLICATION_APPUSER_URL } from '../utils/constants';
import { members } from './membersJson';
import { subscribeOn } from 'rxjs/operator/subscribeOn';

@Injectable()
export class AppUsersService {
    apps = [];
    roles = [];
    constructor(
        private stateService: AppStateService,
        private _http: Http,
        private _reqOption: RequestOptions,
    ) {
        stateService.subscribe(APPLICATIONS, this.getApplications.bind(this));
        stateService.subscribe(ROLES, this.getRoles.bind(this));
        stateService.subscribe(USERS_DATA, this.getGridData.bind(this));
    }

    getApplications(action): void {
        const appUrl = action.payload.url;
        this.stateService.showLoader(true);
        this._http.get(appUrl)
        .map((resp) => { return resp.json(); })
        .subscribe((resp) => {
            this.stateService.showLoader(false);
            if (resp.model) {
                this.stateService.dispatch({
                    type: APPLICATIONS_RESULT,
                    payload: {
                        data: resp.model
                    }
                });
            }
        });
    }

    getRoles(action): void {
        const reqUrl = action.payload.selectedInfo.url;
        const reqParams = action.payload.selectedInfo.params;
        const headers = new Headers();
        const params = new URLSearchParams();
        headers.append('Content-Type', 'application/json');
        reqParams.map((eachParam) => {
            params.append((Object.keys(eachParam)[0]), ((Object as any).values(eachParam)[0]));
            return eachParam;
        });
        const options = new RequestOptions({ headers: headers, params: params });
        this.stateService.showLoader(true);
        this._http.get(reqUrl, options)
        .map((resp) => {return resp.json(); })
        .subscribe((resp) => {
            this.stateService.showLoader(false);
            if (resp.model) {
                this.stateService.dispatch({
                    type: ROLES_RESULT,
                    payload: {
                        data: resp.model
                    }
                });
            }
        });
    }

    getGridData(action) {
        const reqUrl = action.payload.selectedInfo.url;
        const reqParams = action.payload.selectedInfo.params;
        const headers = new Headers();
        const params = new URLSearchParams();
        reqParams.map((eachParam) => {
            params.append((Object.keys(eachParam)[0]), ((Object as any).values(eachParam)[0]));
            return eachParam;
        });
        const options = new RequestOptions({ headers: headers, params: params });
        this.stateService.showLoader(true);
        this._http.get(reqUrl, options)
        .map((resp) => {
            return resp.json();
        })
        .subscribe((resp) => {
            this.stateService.showLoader(false);
            if ((resp as any)) {
                this.stateService.dispatch({
                    type: USERS_DATA_RESULT,
                    payload: {
                        gridData: resp.model
                    }
                });
            }
        });
    }
}
