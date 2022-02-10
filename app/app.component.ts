import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<StackLayout><app-home></app-home></StackLayout>`
})
export class AppComponent implements OnInit {

  ngOnInit() {
    console.log('init ...');
  }

}
