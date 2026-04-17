import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/interceptors/auth-interceptor';
import {loaderInterceptor} from './core/interceptors/loader-interceptor';
import {errorInterceptor} from './core/interceptors/error-interceptor';

// Echarts
import { provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';
import {BarChart, LineChart, PieChart, ScatterChart} from 'echarts/charts';
import {TooltipComponent, LegendComponent, GridComponent} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    BarChart,
    PieChart,
    ScatterChart,
    LineChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([authInterceptor, loaderInterceptor, errorInterceptor]),
        ),
        provideEchartsCore({echarts})
    ]
};
