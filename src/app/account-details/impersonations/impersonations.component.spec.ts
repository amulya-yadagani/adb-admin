import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ImpersonationsComponent } from './impersonations.component';

xdescribe('ImpersonationsComponent', () => {
  let component: ImpersonationsComponent;
  let fixture: ComponentFixture<ImpersonationsComponent>;
  let debugElm;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpersonationsComponent ],
      imports: [HttpModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpersonationsComponent);
    component = fixture.componentInstance;
    debugElm = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
