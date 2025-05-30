import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MimeDomHelper } from '../core/mime-dom-helper';
import { DesktopViewDialogConfigStrategy, MobileViewDialogConfigStrategy, } from './view-dialog-config-strategy';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/layout";
import * as i2 from "../core/mime-dom-helper";
export class ViewDialogConfigStrategyFactory {
    constructor(breakpointObserver, mimeDomHelper) {
        this.breakpointObserver = breakpointObserver;
        this.mimeDomHelper = mimeDomHelper;
    }
    create() {
        const isHandsetOrTabletInPortrait = this.breakpointObserver.isMatched([
            Breakpoints.Handset,
            Breakpoints.TabletPortrait,
        ]);
        return isHandsetOrTabletInPortrait
            ? new MobileViewDialogConfigStrategy()
            : new DesktopViewDialogConfigStrategy(this.mimeDomHelper);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.9", ngImport: i0, type: ViewDialogConfigStrategyFactory, deps: [{ token: i1.BreakpointObserver }, { token: i2.MimeDomHelper }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.9", ngImport: i0, type: ViewDialogConfigStrategyFactory }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.9", ngImport: i0, type: ViewDialogConfigStrategyFactory, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.BreakpointObserver }, { type: i2.MimeDomHelper }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1kaWFsb2ctY29uZmlnLXN0cmF0ZWd5LWZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25neC1taW1lL3NyYy9saWIvdmlldy1kaWFsb2cvdmlldy1kaWFsb2ctY29uZmlnLXN0cmF0ZWd5LWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFDTCwrQkFBK0IsRUFDL0IsOEJBQThCLEdBRS9CLE1BQU0sK0JBQStCLENBQUM7Ozs7QUFHdkMsTUFBTSxPQUFPLCtCQUErQjtJQUMxQyxZQUNVLGtCQUFzQyxFQUN0QyxhQUE0QjtRQUQ1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQ25DLENBQUM7SUFFRyxNQUFNO1FBQ1gsTUFBTSwyQkFBMkIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDO1lBQ3BFLFdBQVcsQ0FBQyxPQUFPO1lBQ25CLFdBQVcsQ0FBQyxjQUFjO1NBQzNCLENBQUMsQ0FBQztRQUVILE9BQU8sMkJBQTJCO1lBQ2hDLENBQUMsQ0FBQyxJQUFJLDhCQUE4QixFQUFFO1lBQ3RDLENBQUMsQ0FBQyxJQUFJLCtCQUErQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5RCxDQUFDOzhHQWZVLCtCQUErQjtrSEFBL0IsK0JBQStCOzsyRkFBL0IsK0JBQStCO2tCQUQzQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnJlYWtwb2ludE9ic2VydmVyLCBCcmVha3BvaW50cyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9sYXlvdXQnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTWltZURvbUhlbHBlciB9IGZyb20gJy4uL2NvcmUvbWltZS1kb20taGVscGVyJztcbmltcG9ydCB7XG4gIERlc2t0b3BWaWV3RGlhbG9nQ29uZmlnU3RyYXRlZ3ksXG4gIE1vYmlsZVZpZXdEaWFsb2dDb25maWdTdHJhdGVneSxcbiAgVmlld0RpYWxvZ0NvbmZpZ1N0cmF0ZWd5LFxufSBmcm9tICcuL3ZpZXctZGlhbG9nLWNvbmZpZy1zdHJhdGVneSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBWaWV3RGlhbG9nQ29uZmlnU3RyYXRlZ3lGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBicmVha3BvaW50T2JzZXJ2ZXI6IEJyZWFrcG9pbnRPYnNlcnZlcixcbiAgICBwcml2YXRlIG1pbWVEb21IZWxwZXI6IE1pbWVEb21IZWxwZXIsXG4gICkge31cblxuICBwdWJsaWMgY3JlYXRlKCk6IFZpZXdEaWFsb2dDb25maWdTdHJhdGVneSB7XG4gICAgY29uc3QgaXNIYW5kc2V0T3JUYWJsZXRJblBvcnRyYWl0ID0gdGhpcy5icmVha3BvaW50T2JzZXJ2ZXIuaXNNYXRjaGVkKFtcbiAgICAgIEJyZWFrcG9pbnRzLkhhbmRzZXQsXG4gICAgICBCcmVha3BvaW50cy5UYWJsZXRQb3J0cmFpdCxcbiAgICBdKTtcblxuICAgIHJldHVybiBpc0hhbmRzZXRPclRhYmxldEluUG9ydHJhaXRcbiAgICAgID8gbmV3IE1vYmlsZVZpZXdEaWFsb2dDb25maWdTdHJhdGVneSgpXG4gICAgICA6IG5ldyBEZXNrdG9wVmlld0RpYWxvZ0NvbmZpZ1N0cmF0ZWd5KHRoaXMubWltZURvbUhlbHBlcik7XG4gIH1cbn1cbiJdfQ==