import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-footer',
    imports: [
        NgOptimizedImage,
        MatIcon,
        MatButton,
        RouterLink
    ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
    myName = "Dimitris Krikonis";

    orgLinks = [
        {
            logo: 'assets/footer/dsit_logo.png',
            url: 'https://dsit.di.uoa.gr/',
        },
        {
            logo: 'assets/footer/dit_logo.png',
            url: 'https://www.di.uoa.gr/',
        },
        {
            logo: 'assets/footer/uoa_logo.png',
            url: 'https://www.uoa.gr/',
        },
        {
            logo: 'assets/footer/ascsa_logo.png',
            url: 'https://www.ascsa.edu.gr/',
        },
    ]

    acknowledgements = [
        {
            name: 'Maria Roussou',
            role: 'Thesis Supervisor',
        },
        {
            name: 'Bruce Hartzler',
            role: 'Collaborator at the Agora of Athens',
        },
        {
            name: 'Brian Martens',
            role: 'Collaborator at the Agora of Athens',
        }
    ];

    contactLinks = [
        {
            mat_icon: 'mail',
            label: 'dimitriskr@di.uoa.gr',
            url: 'mailto:dimitriskr@di.uoa.gr',
        },
        {
            svg_icon: 'linkedin',
            label: '@dimitris-krikonis',
            url: 'https://www.linkedin.com/in/dimitris-krikonis/',
        },
    ];

    projectLinks = [
        {
            svg_icon: 'github',
            label: 'App Frontend GH Repository',
            url: 'https://github.com/dimitris-kr/pottery-chronology-predictor',
        },
        {
            svg_icon: 'huggingface',
            label: 'App Backend on HF Spaces',
            url: 'https://huggingface.co/spaces/dimitriskr/pottery-chronology-predictor-api',
        },
        {
            svg_icon: 'github',
            label: 'ML IPYNBs & Full Backend GH Repository',
            url: 'https://github.com/dimitris-kr/AgoraPottery',
        },
    ];

}
