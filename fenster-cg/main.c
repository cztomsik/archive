#include "app.h"
#include <unistd.h>

void app_draw(CGContextRef ctx, struct app *a) {
  // Clear
  CGContextSetRGBFillColor(ctx, 0.1, 0.1, 0.12, 1.0);
  CGContextFillRect(ctx, CGRectMake(0, 0, a->width, a->height));

  // Blue rect
  CGContextSetRGBFillColor(ctx, 0.2, 0.5, 1.0, 1.0);
  CGContextFillRect(ctx, CGRectMake(50, 50, 200, 100));

  // Red rect at mouse
  CGContextSetRGBFillColor(ctx, 1.0, 0.3, 0.3, 1.0);
  CGContextFillRect(ctx, CGRectMake(a->x - 10, a->height - a->y - 10, 20, 20));

  // Draw text
  CGContextSetRGBFillColor(ctx, 1.0, 1.0, 1.0, 1.0);
  CGContextSelectFont(ctx, "Helvetica", 24.0, kCGEncodingMacRoman);
  CGContextSetTextMatrix(ctx, CGAffineTransformMakeScale(1.0, 1.0));
  CGContextShowTextAtPoint(ctx, 50, 200, "Hello from C!", 13);
}

int main(void) {
  struct app a = { .title = "CG Demo", .width = 800, .height = 600 };
  app_open(&a);

  while (app_loop(&a) == 0) {
    if (a.keys[53]) break; // Escape (keycode 53)
    usleep(16000);     // Sleep for ~16ms (~60 FPS)
  }

  app_close(&a);
  return 0;
}
