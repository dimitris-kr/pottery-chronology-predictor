import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-footer',
    imports: [
        NgOptimizedImage
    ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
    orgs = [
        {
            logo: 'assets/footer/dsit_logo.png',
            link: 'https://dsit.di.uoa.gr/',
        },
        {
            logo: 'assets/footer/dit_logo.png',
            link: 'https://www.di.uoa.gr/',
        },
        {
            logo: 'assets/footer/uoa_logo.png',
            link: 'https://www.uoa.gr/',
        },
        {
            logo: 'assets/footer/ascsa_logo.png',
            link: 'https://www.ascsa.edu.gr/',
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

    contact = [
        {
            mat_icon: 'mail',
            label: 'dimitriskr@di.uoa.gr',
            link: 'mailto:dimitriskr@di.uoa.gr',
        },
        {
            svg_icon: 'src/assets/footer/linkedin.svg',
            label: '@dimitris-krikonis',
            link: 'https://www.linkedin.com/in/dimitris-krikonis/',
        },
    ];

    projectLinks = [
        {
            svg_icon: 'src/assets/footer/github.svg',
            label: 'App Frontend GH Repository',
            link: 'https://github.com/dimitris-kr/pottery-chronology-predictor',
        },
        {
            svg_icon: 'src/assets/footer/huggingface.svg',
            label: 'App Backend on HF Spaces',
            link: 'https://huggingface.co/spaces/dimitriskr/pottery-chronology-predictor-api',
        },
    ];

}
