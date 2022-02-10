import { Inject, forwardRef, Injectable, OnDestroy } from '@angular/core';

import { Frame, Screen, Application } from '@nativescript/core';

// import * as application from '@nativescript/core/application';

import { interval, Observable, BehaviorSubject, Subscription } from 'rxjs';

import { distinctUntilChanged, skipWhile, take } from 'rxjs/operators';

declare var android;
declare var UIKeyboardDidShowNotification;
declare var UIKeyboardDidHideNotification;

function notifyKeyboard(isShown) { KeyboardService.keyboardSubject.next(isShown); }

@Injectable({ providedIn: 'root' })
export class KeyboardService implements OnDestroy {

  static keyboardSubject = new BehaviorSubject(false);
  private keyboardShowing$: Observable<boolean> = KeyboardService.keyboardSubject.asObservable();

  private keyboardSubscription: Subscription;

  private keyboardSize;

  constructor() {
    this.trackKeyboard();
  }

  ngOnDestroy() {
    if (this.keyboardSubscription) { this.keyboardSubscription.unsubscribe(); }
    KeyboardService.keyboardSubject.next(null);
  }

  public isKeyboardShowing$() { return this.keyboardShowing$.pipe(distinctUntilChanged()); }

  public trackKeyboard() {
    if (global.android) {
      this.trackAndroidKeyboard();
    } else {
      this.trackiOSKeyboard();
    }
  }

  private trackAndroidKeyboard() {
    this.keyboardSubscription = interval(500)
      .pipe(
        skipWhile(() => Frame.topmost().currentPage === null),
        take(1),
      )
      .subscribe(() => this.registerAndroidListener());
  }

  private registerAndroidListener() {
    const cv = Frame.topmost().currentPage.android;
    cv.getViewTreeObserver().addOnGlobalLayoutListener(new android.view.ViewTreeObserver.OnGlobalLayoutListener({
      onGlobalLayout: function() {
        // Grab the Current Screen Height
        const rect = new android.graphics.Rect();
        cv.getWindowVisibleDisplayFrame(rect);
        const screenHeight = cv.getRootView().getHeight();
        const missingSize = screenHeight - rect.bottom;

        this.keyboardSize = missingSize / Screen.mainScreen.scale;

        if (missingSize > (screenHeight * 0.15)) {
          notifyKeyboard(true);
        } else {
          notifyKeyboard(false);
        }
      }
    }));
  }

  private trackiOSKeyboard() {
    Application.ios.addNotificationObserver(UIKeyboardDidShowNotification, () => notifyKeyboard(true));
    Application.ios.addNotificationObserver(UIKeyboardDidHideNotification, () => notifyKeyboard(false));
  }

  public getKeyboardSize() {
       const rect = new android.graphics.Rect();
       const cv = Frame.topmost().currentPage.android;
       cv.getWindowVisibleDisplayFrame(rect);
       const screenHeight = cv.getRootView().getHeight();
       const missingSize = screenHeight - rect.bottom;
       const keyboardSize = missingSize / Screen.mainScreen.scale;
       return keyboardSize;
    }

  // public getKeyboardSize() {
  //   const keyboardSize = this.keyboardSize || (0.4 * Screen.mainScreen.heightDIPs);
  //   return keyboardSize;
  // }

}
