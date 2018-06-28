import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

import { AppUsersComponent } from './app-users.component';
import { AppUsersService } from './app-users.service';
import { AppStateService } from '../state/app-state.service';

describe('Application User Component', () => {
    let fixture; 
    let component;
    let debugElm;
    describe('Testing DOM Component', () => {
        beforeEach(async() => {
            TestBed.configureTestingModule({
                imports: [HttpModule, RouterTestingModule],
                declarations: [AppUsersComponent],
                providers: [AppUsersService, AppStateService],
                schemas: [NO_ERRORS_SCHEMA]
            }).compileComponents();
        });
    });
    describe('Testing Initial Component State', () => {

    });
    describe('Testing Post Initial Component State', () => {

    });
});
