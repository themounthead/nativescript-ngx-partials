import { Component, Input, AfterViewInit, OnInit } from '@angular/core';

import { StackLayout } from '@nativescript/core';

import { PartialGridPanelLayout } from './partial-grid-panel';

export type TPosition =
  'top' | 'middle' | 'bottom' |
  'left' | 'center' | 'right' |
  'top-left' | 'top-center' | 'top-right' |
  'middle-left' | 'middle-center' | 'middle-right' |
  'bottom-left' | 'bottom-middle' | 'bottom-right';

export type TFormat =
  'row' | 'col' |
  'rowbar' | 'colbar' |
  'box' | 'cell';

@Component({
  selector: 'GridPanel',
  templateUrl: './partial-grid-panel.component.html',
  styleUrls: ['../partial-component.scss'],
})
export class PartialGridPanelComponent extends PartialGridPanelLayout { }

@Component({
  selector: 'Panel',
  template: `<ng-content></ng-content>`
})
export class PartialGridNestedPanelComponent extends StackLayout implements OnInit, AfterViewInit {

  constructor() {
    super();
  }

  @Input() format: TFormat;
  @Input() position: TPosition;

  private renderPanel = {
    'cell': {
      'top-left': () => { this.row = 0; this.col = 0; },
      'top-center': () => { this.row = 0; this.col = 1; },
      'top-right': () => { this.row = 0; this.col = 2; },
      'middle-left': () => { this.row = 1; this.col = 0; },
      'middle-center': () => { this.row = 1; this.col = 1; },
      'middle-right': () => { this.row = 1; this.col = 2; },
      'bottom-left': () => { this.row = 2; this.col = 0; },
      'bottom-center': () => { this.row = 2; this.col = 1; },
      'bottom-right': () => { this.row = 2; this.col = 2; },
    },
    'row': {
      'top': () => { this.row = 0; this.colSpan = 3; },
      'middle': () => { this.row = 1; this.colSpan = 3; },
      'bottom': () => { this.row = 2; this.colSpan = 3; },
    },
    'col': {
      'left': () => { this.col = 0; this.rowSpan = 3; },
      'center': () => { this.col = 1; this.rowSpan = 3; },
      'right': () => { this.col = 2; this.rowSpan = 3; },
    },
    'rowbar': {
      'top-left': () => { this.row = 0; this.col = 0; this.colSpan = 2; },
      'middle-left': () => { this.row = 1; this.col = 0; this.colSpan = 2; },
      'bottom-left': () => { this.row = 2; this.col = 0; this.colSpan = 2; },
      'top-center': () => { this.row = 0; this.col = 1; this.colSpan = 2; },
      'middle-center': () => { this.row = 1; this.col = 1; this.colSpan = 2; },
      'bottom-center': () => { this.row = 2; this.col = 1; this.colSpan = 2; },
    },
    'colbar': {
      'top-left': () => { this.row = 0; this.col = 0; this.rowSpan = 2; },
      'middle-left': () => { this.row = 1; this.col = 0; this.rowSpan = 2; },
      'bottom-left': () => { this.row = 2; this.col = 0; this.rowSpan = 2; },
      'top-center': () => { this.row = 0; this.col = 1; this.rowSpan = 2; },
      'middle-center': () => { this.row = 1; this.col = 1; this.rowSpan = 2; },
      'bottom-center': () => { this.row = 2; this.col = 1; this.rowSpan = 2; },
    },
    'box': {
      'top-left': () => { this.row = 0; this.col = 0; this.rowSpan = 2; this.colSpan = 2; },
      'top-right': () => { this.row = 0; this.col = 1; this.rowSpan = 2; this.colSpan = 2; },
      'bottom-left': () => { this.row = 1; this.col = 0; this.rowSpan = 2; this.colSpan = 2; },
      'bottom-right': () => { this.row = 1; this.col = 1; this.rowSpan = 2; this.colSpan = 2; },
    }
  };

  ngOnInit() { }

  ngAfterViewInit() { }

  onLoaded() {
    super.onLoaded();
    const getPanelConfig = this.renderPanel[this.format][this.position];
    if (getPanelConfig) { getPanelConfig.call(); } else { throw new Error('Invalid grid panel configuration'); }
  }

}
