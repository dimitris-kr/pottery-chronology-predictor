import {Component} from '@angular/core';
import {NgStyle} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {formatYear, getColor} from '../../core/utils/helpers';

@Component({
    selector: 'app-about',
    imports: [
        MatButton,
        MatIcon,
        RouterLink,
        MatFormField,
        MatInput,
        MatLabel,
        NgStyle
    ],
    templateUrl: './about.html',
    styleUrl: './about.scss',
})
export class About {

    demoInput = {
        text: "flaring rim. black and plain pottery kados attic normal version black and plain pottery kados attic normal version h. 0.255; diam. 0.225.",
        image: "assets/about/Agora_Image_2012.02.4314_resized.jpg",
    }

    demoPrediction = {
        start_year: -575,
        end_year: -540,
    }

    demoFeedback = {
        predicted_period: "Classical",
        true_period: "Archaic",
    }

    protected readonly getColor = getColor;
    protected readonly formatYear = formatYear;
}
