import {Routes} from '@angular/router';
import {PublicLayout} from './layouts/public-layout/public-layout';
import {About} from './public/about/about';
import {Login} from './public/login/login';
import {Dashboard} from './admin/dashboard/dashboard';
import {AdminLayout} from './layouts/admin-layout/admin-layout';
import {authGuard} from './core/guards/auth-guard';
import {authReverseGuard} from './core/guards/auth-reverse-guard';
import {PredictionsAll} from './admin/predictions/predictions-all/predictions-all';
import {PredictionsNew} from './admin/predictions/predictions-new/predictions-new';
import {PredictionsSingle} from './admin/predictions/predictions-single/predictions-single';
import {PotteryItemsAll} from './admin/pottery-items/pottery-items-all/pottery-items-all.component';
import {PotteryItemsSingle} from './admin/pottery-items/pottery-items-single/pottery-items-single';
import {ModelsAll} from './admin/models/models-all/models-all';
import {ModelsSingle} from './admin/models/models-single/models-single';

export const routes: Routes = [
    /* Public layout */
    {
        path: '',
        canActivate: [authReverseGuard],
        component: PublicLayout,
        children: [
            {
                path: '',
                redirectTo: 'about',
                pathMatch: 'full'
            },
            {
                path: 'about',
                component: About, // home
            },
            {
                path: 'login',
                component: Login,
            },

        ],
    },

    /* Admin layout */
    {
        path: 'admin',
        canActivate: [authGuard],
        component: AdminLayout,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard,
            },
            {
                path: 'about',
                component: About,
                data: { showFooter: true },
            },
            {
                path: 'data',
                children: [
                    {
                        path: '',
                        component: PotteryItemsAll
                    },
                    {
                        path: ':id',
                        component: PotteryItemsSingle
                    }
                ]
            },
            {
                path: 'models',
                children: [
                    {
                        path: '',
                        component: ModelsAll
                    },
                    {
                        path: ':id',
                        component: ModelsSingle
                    }
                ]
            },
            {
                path: 'predictions',
                children: [
                    {
                        path: '',
                        component: PredictionsAll,
                    },
                    {
                        path: 'new',
                        component: PredictionsNew,
                    },
                    {
                        path: ':id',
                        component: PredictionsSingle,
                    }
                ]
            }
        ],
    },

    /* Fallback */
    {
        path: '**',
        redirectTo: '',
    },
];
