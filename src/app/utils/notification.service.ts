import { Injectable } from '@angular/core';

import { AppStateService } from "../state/app-state.service";
import { NOTIFICATION } from "../state/actions";

let $ = null;

@Injectable()
export class NotificationService {

    private el:any;

    constructor(private stateService:AppStateService) {
        $ = window["jQuery"];
        this.el = $("#notification");

        this.el.on("transitionend",((e) => {
          if(parseInt(this.el.css("top")) < 0) {
            this.el.text("");
          }
        }).bind(this));

        stateService.subscribe(NOTIFICATION, this.showNotification.bind(this));
    }

    showNotification(action) {
        if(this.el) {
            this.el.text(action.payload.msg).css("top","7px");

            setTimeout(this.hideNotification.bind(this),5000);
        }
    }

    hideNotification() {
        if(this.el) {
            this.el.css("top","-40px");
        }
    }
}
