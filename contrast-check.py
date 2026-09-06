import sys, re

def lum(hexcol):
    h = hexcol.lstrip('#')
    ch = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in ch]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]

def ratio(fg, bg):
    a, b = lum(fg), lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

def check(label, fg, bg, size, bold=False):
    r = ratio(fg, bg)
    large = size >= 18 or (bold and size >= 14)
    aa = 3.0 if large else 4.5
    aaa = 4.5 if large else 7.0
    grade = "AAA" if r >= aaa else ("AA " if r >= aa else "FAIL")
    print(f"{grade}  {r:5.2f}:1  {label:<34} {fg} on {bg}  ({size:.0f}px{' bold' if bold else ''})")
    return r >= aa

if __name__ == "__main__":
    pairs = eval(open(sys.argv[1]).read())
    ok = True
    for p in pairs:
        ok &= check(*p)
    print()
    print("ALL PASS AA" if ok else "SOME FAIL AA")
