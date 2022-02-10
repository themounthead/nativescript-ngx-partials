import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  // styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = 'nativescript-ngx-partials';
  private counter = 42;

  constructor() {}

  ngOnInit() {
    console.log(1000);
  }

  public getMessage() {
    return this.counter > 0
      ? `${this.counter} taps left`
      : 'Hoorraaay! You unlocked the NativeScript clicker achievement!';
  }

  public onTap() {
    this.counter--;
  }
}
