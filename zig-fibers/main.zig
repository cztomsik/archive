// Minimal fibers PoC with MUSL setjmp() + longjmp()
// libc longjmp() anywhere except "up" is undefined behavior so we bundle MUSL
//
// zig run main.zig

const std = @import("std");
const jmp_buf = [192]u8;

// Keep it OUT of the main stack.
var fib: Fiber = undefined;

pub fn main() !void {
    fib.init(foo);

    var i: usize = 0;
    while (i < 5) : (i += 1) {
        fib.@"resume"();
    }
}

fn foo() callconv(.C) void {
    for (0..5) |i| {
        std.debug.print("foo: {}\n", .{i});
        Fiber.yield();
    }
}

const Fiber = extern struct {
    env: jmp_buf,
    stack: [4 * 1024]u8,

    threadlocal var curr: ?*Fiber = null;
    var tmp: jmp_buf = undefined;

    fn init(self: *Fiber, fun: *const fn () callconv(.C) void) void {
        const sp: **anyopaque = @ptrCast(@alignCast(&self.env[104]));
        sp.* = @ptrFromInt(@intFromPtr(&self.stack[0]) + self.stack.len); // Stack growing DOWN

        const entry: *@TypeOf(fun) = @ptrCast(@alignCast(&self.env[88]));
        entry.* = fun;
    }

    noinline fn @"resume"(self: *Fiber) void {
        if (setjmp(&tmp) != 0) return;
        curr = self;
        longjmp(&self.env, 1);
    }

    noinline fn yield() void {
        if (setjmp(&curr.?.env) != 0) return;
        longjmp(&tmp, 1);
    }
};

extern fn setjmp(*anyopaque) c_int;
extern fn longjmp(*anyopaque, c_int) noreturn;

// (MIT) https://git.musl-libc.org/cgit/musl/tree/src/setjmp/aarch64
comptime {
    asm (
        \\.global _setjmp
        \\_setjmp:
        \\  stp x19, x20, [x0,#0]
        \\  stp x21, x22, [x0,#16]
        \\  stp x23, x24, [x0,#32]
        \\  stp x25, x26, [x0,#48]
        \\  stp x27, x28, [x0,#64]
        \\  stp x29, x30, [x0,#80]
        \\  mov x2, sp
        \\  str x2, [x0,#104]
        \\  stp  d8,  d9, [x0,#112]
        \\  stp d10, d11, [x0,#128]
        \\  stp d12, d13, [x0,#144]
        \\  stp d14, d15, [x0,#160]
        \\  mov x0, #0
        \\  ret
        \\
        \\.global _longjmp
        \\_longjmp:
        \\  ldp x19, x20, [x0,#0]
        \\  ldp x21, x22, [x0,#16]
        \\  ldp x23, x24, [x0,#32]
        \\  ldp x25, x26, [x0,#48]
        \\  ldp x27, x28, [x0,#64]
        \\  ldp x29, x30, [x0,#80]
        \\  ldr x2, [x0,#104]
        \\  mov sp, x2
        \\  ldp d8 , d9, [x0,#112]
        \\  ldp d10, d11, [x0,#128]
        \\  ldp d12, d13, [x0,#144]
        \\  ldp d14, d15, [x0,#160]
        \\  cmp w1, 0
        \\  csinc w0, w1, wzr, ne
        \\  br x30
    );
}
