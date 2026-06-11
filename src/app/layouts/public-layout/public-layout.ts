import { Component } from '@angular/core';
import {Header} from '../../reusable/header/header';
import {RouterOutlet} from '@angular/router';
import {Footer} from '../../reusable/footer/footer';

@Component({
  selector: 'app-public-layout',
    imports: [
        Header,
        RouterOutlet,
        Footer
    ],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {

}
