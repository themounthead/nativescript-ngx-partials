import { Input, Injectable, Component } from '@angular/core';

import { GridLayout } from '@nativescript/core';

@Component({template: ''})
export class PartialGridPanelLayout extends GridLayout {

  @Input() debug;

  get isDebug() { return this.debug || this.debug === ''; }
  get debugClass() { return this.isDebug ? 'debug' : ''; }

  constructor() { super(); }

  onLoaded() {
    super.onLoaded();
    if (this.isDebug) { this.className = this.debugClass; }
  }

}
