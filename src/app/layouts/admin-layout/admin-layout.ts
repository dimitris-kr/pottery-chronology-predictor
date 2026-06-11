import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {Sidebar} from '../../reusable/sidebar/sidebar';
import {Topbar} from '../../reusable/topbar/topbar';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {Breadcrumb} from '../../reusable/breadcrumb/breadcrumb';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {Footer} from '../../reusable/footer/footer';

@Component({
  selector: 'app-admin-layout',
    imports: [
        RouterOutlet,
        Sidebar,
        Topbar,
        MatSidenavContainer,
        MatSidenav,
        MatSidenavContent,
        Breadcrumb,
        Footer
    ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
    protected readonly isMobile = signal(true);

    private readonly _mobileQuery: MediaQueryList;
    private readonly _mobileQueryListener: () => void;

    constructor() {
        const media = inject(MediaMatcher);

        this._mobileQuery = media.matchMedia('(max-width: 767px)');
        this.isMobile.set(this._mobileQuery.matches);
        this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
        this._mobileQuery.addEventListener('change', this._mobileQueryListener);
    }

    ngOnDestroy(): void {
        this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
    }

    private router = inject(Router);
    private route = inject(ActivatedRoute);

    showFooter = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => {
                // walk to the deepest activated child
                let r = this.route;
                while (r.firstChild) r = r.firstChild;
                return r.snapshot.data['showFooter'] ?? false;
            })
        ),
        { initialValue: false }
    );
}
