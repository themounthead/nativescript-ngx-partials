import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { registerElement } from '@nativescript/angular';

import { PartialPage } from './page/partial-page';
import { PartialGridPanelLayout } from './panel/partial-grid-panel';
import { PartialFlexPanelLayout } from './panel/partial-flex-panel';

import { PartialColPanelComponent } from './panel/partial-col-panel.component';
import { PartialRowPanelComponent } from './panel/partial-row-panel.component';
import { PartialPageComponent } from './page/partial-page.component';
import { PartialGridPanelComponent, PartialGridNestedPanelComponent } from './panel/partial-grid-panel.component';
import { PartialPageComponentDirective, ActionBarQueryDirective, ActionBarService } from './page/partial-page.directives';

registerElement('Page', () => PartialPageComponent);
registerElement('RowPanel', () => PartialRowPanelComponent);
registerElement('ColPanel', () => PartialColPanelComponent);
registerElement('GridPanel', () => PartialGridPanelComponent);
registerElement('Panel', () => PartialGridNestedPanelComponent);

const COMPONENTS = [
  PartialPage,
  PartialGridPanelLayout,
  PartialFlexPanelLayout,
  PartialColPanelComponent,
  PartialRowPanelComponent,
  PartialGridPanelComponent,
  PartialGridNestedPanelComponent,
  PartialPageComponent,
];

const DIRECTIVES = [
  PartialPageComponentDirective,
  ActionBarQueryDirective,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ...DIRECTIVES,
    ...COMPONENTS,
  ],
  providers: [
    ActionBarService,
  ],
  exports: [
    ...DIRECTIVES,
    ...COMPONENTS,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PartialsModule { }
