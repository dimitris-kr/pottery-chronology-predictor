import {Component, inject, OnInit} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatBadge} from '@angular/material/badge';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MenuItem} from '../../core/utils/menu-item';
import {RetrainEligibility} from '../../core/services/retrain-eligibility';

@Component({
  selector: 'app-sidebar',
    imports: [
        NgOptimizedImage,
        MatButton,
        MatIcon,
        MatBadge,
        RouterLink,
        RouterLinkActive
    ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
    private readonly retrainEligibility = inject(RetrainEligibility);

    ngOnInit() {
        this.retrainEligibility.refresh();
    }

    mainMenuItems = [
        new MenuItem(
            "Dashboard",
            "dashboard",
            "/dashboard",
        ),
        new MenuItem(
            "Pottery Data",
            "folder",
            "/data",
        ),
        new MenuItem(
            "Predictive Models",
            "memory",
            "/models",
            this.retrainEligibility.newItemsCount,
        ),
        new MenuItem(
            "Predictions",
            "auto_awesome",
            "/predictions",
        )
    ];

    secondaryMenuItems = [
        new MenuItem(
            "About",
            "info",
            "/about"
        )
    ];
}
