import {Signal} from '@angular/core';

export class MenuItem {
    label: string;
    icon: string;
    route: string;
    /** Optional badge count (for items needing attention). */
    badgeCount?: Signal<number>;

    constructor(
        label: string,
        icon: string,
        route: string,
        badgeCount?: Signal<number>
    ) {
        this.label = label;
        this.icon = icon;
        this.route = route;
        this.badgeCount = badgeCount;
    }
}
