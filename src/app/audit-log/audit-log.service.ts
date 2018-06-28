import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppStateService } from '../state/app-state.service';
import { getErrorAction } from '../utils/parser-util';
import { AUDITLOG_URL } from '../utils/constants';
import { AUDIT_LOG, AUDIT_LOG_RESULT } from '../state/actions';

@Injectable()
export class AuditLogService {
    constructor(private _http: Http, private _appStateService: AppStateService) {
        this._appStateService.subscribe(AUDIT_LOG, this.reqAuditLogService.bind(this));
    }

    reqAuditLogService() {
        this._appStateService.showLoader(true);
        this._http.get(AUDITLOG_URL)
        .map((resp) => {
            return resp.json();
        })
        .catch(this.ErrorHandler.bind(this))
        .subscribe((resp) => {
            this._appStateService.showLoader(false);
            if (resp.model) {
                this.invokeAction(resp.model);
            }
        });
    }

    invokeAction(auditData) {
        const action = {
            type : AUDIT_LOG_RESULT,
            payload: {
                data : auditData
            }
        };
        this._appStateService.dispatch(action);
    }

    ErrorHandler(error: any, caught) { };
};
