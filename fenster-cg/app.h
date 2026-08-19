#ifndef APP_H
#define APP_H

#include <CoreGraphics/CoreGraphics.h>
#include <objc/objc-runtime.h>
#include <stdint.h>

// Cocoa types
typedef long NSInteger;
typedef unsigned long NSUInteger;
#define NSUIntegerMax ULONG_MAX

extern id const NSApp;
extern id const NSDefaultRunLoopMode;

#define msg(r, o, s) ((r(*)(id, SEL))objc_msgSend)(o, sel_getUid(s))
#define msg1(r, o, s, A, a) ((r(*)(id, SEL, A))objc_msgSend)(o, sel_getUid(s), a)
#define msg4(r, o, s, A, a, B, b, C, c, D, d) \
  ((r(*)(id, SEL, A, B, C, D))objc_msgSend)(o, sel_getUid(s), a, b, c, d)
#define cls(x) ((id)objc_getClass(x))

struct app {
  const char *title;
  int width;
  int height;
  int keys[256];
  int mod;
  int x, y;
  int mouse;
  id wnd;
};

// Implement this yourself
void app_draw(CGContextRef ctx, struct app *a);

static void draw_rect(id view, SEL sel, CGRect rect) {
  (void)sel; (void)rect;
  struct app *a = (struct app *)objc_getAssociatedObject(view, "app");
  CGContextRef ctx = msg(CGContextRef, msg(id, cls("NSGraphicsContext"), "currentContext"), "CGContext");
  app_draw(ctx, a);
}

static BOOL should_close(id view, SEL sel, id wnd) {
  (void)view; (void)sel; (void)wnd;
  msg1(void, NSApp, "terminate:", id, NSApp);
  return YES;
}

static int app_open(struct app *a) {
  msg(id, cls("NSApplication"), "sharedApplication");
  msg1(void, NSApp, "setActivationPolicy:", NSInteger, 0);

  a->wnd = msg4(id, msg(id, cls("NSWindow"), "alloc"),
                "initWithContentRect:styleMask:backing:defer:",
                CGRect, CGRectMake(0, 0, a->width, a->height),
                NSUInteger, 3, NSUInteger, 2, BOOL, NO);

  // Window delegate for close
  Class del_class = objc_allocateClassPair((Class)cls("NSObject"), "AppDelegate", 0);
  class_addMethod(del_class, sel_getUid("windowShouldClose:"), (IMP)should_close, "c@:@");
  objc_registerClassPair(del_class);
  id delegate = msg(id, msg(id, (id)del_class, "alloc"), "init");
  msg1(void, a->wnd, "setDelegate:", id, delegate);

  // Custom view with drawRect:
  Class view_class = objc_allocateClassPair((Class)cls("NSView"), "AppView", 0);
  class_addMethod(view_class, sel_getUid("drawRect:"), (IMP)draw_rect, "v@:{CGRect={CGPoint=dd}{CGSize=dd}}");
  objc_registerClassPair(view_class);

  id view = msg(id, msg(id, (id)view_class, "alloc"), "init");
  msg1(void, a->wnd, "setContentView:", id, view);
  objc_setAssociatedObject(view, "app", (id)a, OBJC_ASSOCIATION_ASSIGN);

  msg1(void, a->wnd, "setTitle:", id,
       msg1(id, cls("NSString"), "stringWithUTF8String:", const char *, a->title));
  msg1(void, a->wnd, "makeKeyAndOrderFront:", id, nil);
  msg(void, a->wnd, "center");
  msg1(void, NSApp, "activateIgnoringOtherApps:", BOOL, YES);
  return 0;
}

static int app_loop(struct app *a) {
  msg1(void, msg(id, a->wnd, "contentView"), "setNeedsDisplay:", BOOL, YES);

  id ev = msg4(id, NSApp, "nextEventMatchingMask:untilDate:inMode:dequeue:",
               NSUInteger, NSUIntegerMax, id, NULL, id, NSDefaultRunLoopMode, BOOL, YES);
  if (!ev) return 0;

  NSUInteger type = msg(NSUInteger, ev, "type");
  switch (type) {
    case 1: a->mouse |= 1; break;   // MouseDown
    case 2: a->mouse &= ~1; break;  // MouseUp
    case 5: case 6: {               // MouseMoved, MouseDragged
      CGPoint p = msg(CGPoint, ev, "locationInWindow");
      a->x = (int)p.x;
      a->y = (int)(a->height - p.y);
      break;
    }
    case 10: case 11: {             // KeyDown, KeyUp
      NSUInteger k = msg(NSUInteger, ev, "keyCode");
      a->keys[k & 0xFF] = (type == 10);
      NSUInteger mod = msg(NSUInteger, ev, "modifierFlags") >> 17;
      a->mod = (mod & 0xc) | ((mod & 1) << 1) | ((mod >> 1) & 1);
      break;
    }
  }
  msg1(void, NSApp, "sendEvent:", id, ev);
  return 0;
}

static void app_close(struct app *a) {
  msg(void, a->wnd, "close");
}

#endif
