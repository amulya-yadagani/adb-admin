import { Injectable } from '@angular/core';

import { AppStateService } from "../state/app-state.service";
import { LOADER } from "../state/actions";

let $ = null;

@Injectable()
export class LoaderService {

    private el:any;

    constructor(private stateService:AppStateService) {
        $ = window["jQuery"];
        this.el = $("#loader");

        stateService.subscribe(LOADER, this.showHideLoader.bind(this));

        /* this.el.on("click",(e) => {
            this.el.toggleClass("is-active",false);
        }) */
    }

    showHideLoader(action) {
        if(this.el && action) {
            this.el.toggleClass("is-active",action.payload.show);
        }
    }
}
