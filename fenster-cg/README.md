# fenster-cg

A minimal macOS window + rendering demo written in plain C, with no Objective-C source code.

`app.h` is a tiny single-header "game framework" that boots a Cocoa app and window entirely from C by calling `objc_msgSend` directly (via the `msg`/`msg1`/`msg4`/`cls` macros) and creating `NSWindow`/`NSView` subclasses at runtime with the Objective-C runtime API. It provides:

- `app_open()` – create a window with a title, size, and a custom view whose `drawRect:` calls your code
- `app_loop()` – pump the event loop, tracking mouse position/buttons and key state (Escape quits the demo)
- `app_close()` – tear the window down

Your program just implements one function:

```c
void app_draw(CGContextRef ctx, struct app *a);
```

and draws with Core Graphics. The demo in `main.c` fills the background, draws a blue rectangle, a red square that follows the mouse, and some text — at roughly 60 FPS.

## Build & run

```sh
./build.sh   # clang main.c -framework Cocoa -framework CoreGraphics -o demo
./demo
```

Requires macOS with the Xcode command line tools (clang + frameworks).
