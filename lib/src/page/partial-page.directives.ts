import {
  Injectable,
  Inject,
  forwardRef,
  Directive,
  Optional,
  ContentChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import { ActionBar, Application, Screen, isIOS, isAndroid, ScrollView, StackLayout } from '@nativescript/core';

import { PartialPageComponent } from './partial-page.component';

import { Observable, Subscription, timer, interval, Subject } from 'rxjs';

import {
  combineLatest,
  throttleTime,
  filter,
  debounceTime,
  tap,
  takeUntil,
  skipWhile,
  distinctUntilChanged,
  delay,
  skip,
} from 'rxjs/operators';

import { KeyboardService } from '../keyboard.service';
import { ScrollService } from '../scroll.service';

const IOS_NAVBAR_HEIGHT = 50;

@Injectable({ providedIn: 'root' })
export class ActionBarService {
  private actionBar: ActionBar;
  getActionBar() {
    return this.actionBar;
  }
  setActionBar(o) {
    this.actionBar = o;
  }
}

@Directive({
  selector: 'ActionBar',
})
export class ActionBarQueryDirective {
  constructor(
    @Inject(forwardRef(() => ElementRef)) private actionBar,
    @Inject(forwardRef(() => ActionBarService)) private actionBarService
  ) {
    const actionBarEl = this.actionBar ? this.actionBar.nativeElement : null;
    this.actionBarService.setActionBar(actionBarEl);
  }
}

@Directive({
  selector: '[partial-page]',
})
export class PartialPageComponentDirective implements AfterViewInit, OnDestroy {
  private keyboardSubscription: Subscription;
  private scrollSubscription: Subscription;

  // @ContentChild('pageView', { read: ElementRef, static: false }) pageView: ElementRef;
  @ContentChild('scrollView', { read: ElementRef, static: false }) scrollView: ElementRef;
  @ContentChild('contentView', { read: ElementRef, static: false }) contentView: ElementRef;
  @ContentChild('headerView', { read: ElementRef, static: false }) headerView: ElementRef;
  @ContentChild('footerView', { read: ElementRef, static: false }) footerView: ElementRef;

  constructor(
    private pageView: ElementRef,
    @Inject(forwardRef(() => ActionBarService)) private actionBarService,
    @Inject(forwardRef(() => KeyboardService)) private keyboardService: KeyboardService,
    @Inject(forwardRef(() => ScrollService)) private scrollService: ScrollService,
    @Inject(forwardRef(() => PartialPageComponent)) private pageComponent: PartialPageComponent
  ) {}

  ngAfterViewInit() {
    this.watchViewEmitters();
  }

  ngOnDestroy() {
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private watchViewEmitters(actionBarEvt?) {
    setTimeout(() => this.onViewsLoaded(), 500);
  }

  private onViewsLoaded() {
    if (!this.scrollView || !this.contentView) {
      return;
    }
    const scale = Screen.mainScreen.scale;

    const headerState = this.pageComponent.header;
    const footerState = this.pageComponent.footer;

    const pageView = <StackLayout>this.pageView.nativeElement;
    const headerView = <StackLayout>this.headerView.nativeElement;
    const footerView = <StackLayout>this.footerView.nativeElement;
    const contentView = <StackLayout>this.contentView.nativeElement;
    const scrollView = <ScrollView>this.scrollView.nativeElement;

    const actionBar = this.actionBarService.getActionBar();

    const screenHeight = Screen.mainScreen.heightDIPs;
    const actionBarHeight = actionBar ? actionBar.getMeasuredHeight() : 0;
    // const pageHeight = pageView.getMeasuredHeight() / scale;

    let pageHeight = pageView.getMeasuredHeight() / scale;
    if (pageHeight == 0) {
      this.watchViewEmitters();
      return;
    }

    if (isIOS) {
      const offsetHeight =
        Application.ios.window.safeAreaInsets.top + Application.ios.window.safeAreaInsets.bottom + IOS_NAVBAR_HEIGHT;
      pageHeight = pageHeight + 50 >= screenHeight ? screenHeight - offsetHeight : pageHeight;
    }

    const headerHeight = headerView ? headerView.getMeasuredHeight() / scale : 0;
    const footerHeight = footerView ? footerView.getMeasuredHeight() / scale : 0;
    let scrollHeight = pageHeight - (headerHeight + footerHeight);
    scrollHeight = isIOS ? scrollHeight + IOS_NAVBAR_HEIGHT : scrollHeight;
    const contentHeight = scrollHeight + headerHeight;

    if (contentHeight <= 0) {
      this.watchViewEmitters();
      return;
    }

    if (isAndroid) {
      this.watchKeyboard(pageView, pageHeight);
      this.watchScroll(scrollView, scrollHeight);
    }

    if (this.pageComponent.height) {
      pageView.height = this.pageComponent.height;
    }
    if (this.pageComponent.width) {
      pageView.width = this.pageComponent.width;
    }
    if (this.pageComponent.padding) {
      pageView.padding = this.pageComponent.padding;
    }
    if (this.pageComponent.margin) {
      pageView.margin = this.pageComponent.margin;
    }

    if (this.pageComponent.isDebug) {
      console.dir({
        screenHeight,
        actionBarHeight,
        pageHeight,
        headerHeight,
        footerHeight,
        contentHeight,
        scrollHeight,
      });
      this.markViewDebug();
    }

    if (isIOS) pageView.height = pageHeight;

    if (headerState !== 'fixed' && footerState !== 'fixed') {
      return;
    }
    if (headerState === 'fixed' && footerState === 'fixed') {
      this.scrollView.nativeElement.height = scrollHeight;
      this.contentView.nativeElement.height = scrollHeight;
    }
    if (headerState === 'flow' && footerState === 'fixed') {
      this.contentView.nativeElement.height = contentHeight;
    }
    if (headerState === 'float' && footerState === 'fixed') {
      this.contentView.nativeElement.height = contentHeight;
    }
  }

  private watchKeyboard(pageView, pageHeight) {
    this.keyboardService.trackKeyboard();
    this.keyboardSubscription = this.keyboardService
      .isKeyboardShowing$()
      .pipe(throttleTime(150))
      .subscribe((isShowing) => {
        setTimeout(() => {
          const pageOffset = pageHeight + 42 - this.keyboardService.getKeyboardSize();
          pageView.height = isShowing ? pageOffset : pageHeight;
          // pageView.verticalAlignment = isShowing ? 'top' : 'stretch';
        }, 0);
      });
  }

  private watchScroll(scrollView: ScrollView, scrollHeight) {
    this.scrollSubscription = this.scrollService
      .watchScrollPosition$()
      .pipe(
        skip(1),
        filter((position) => position.y > 0)
      )
      .subscribe((position) => {
        const offset = position.y + scrollView.verticalOffset;
        scrollView.scrollToVerticalOffset(offset - scrollHeight / 3, true);
      });
  }

  private markViewDebug() {
    this.headerView.nativeElement.className = 'debug';
    this.footerView.nativeElement.className = 'debug';
    this.contentView.nativeElement.className = 'debug';
    this.scrollView.nativeElement.className = 'debug';
  }
}
