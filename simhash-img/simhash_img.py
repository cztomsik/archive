"""Near-duplicate image detection using SimHash."""

import sys
import struct
import hashlib
import numpy as np
from PIL import Image
from skimage.color import rgb2lab

IMG_SIZE = 64
TILE_SIZE = 8
HASH_BITS = 64


def load_and_downscale(path):
    img = Image.open(path).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    return np.array(img, dtype=np.float64) / 255.0


def extract_features(img_rgb):
    lab = rgb2lab(img_rgb)
    tiles_per_side = IMG_SIZE // TILE_SIZE
    features = []
    for ty in range(tiles_per_side):
        for tx in range(tiles_per_side):
            tile = lab[
                ty * TILE_SIZE : (ty + 1) * TILE_SIZE,
                tx * TILE_SIZE : (tx + 1) * TILE_SIZE,
            ]
            features.append(tile[:, :, 0].mean())  # L mean
            features.append(tile[:, :, 1].mean())  # a mean
            features.append(tile[:, :, 2].mean())  # b mean
            features.append(tile[:, :, 0].var())   # L variance (texture)
    return features


def _hash_feature(index, value):
    data = struct.pack("<Id", index, value)
    digest = hashlib.md5(data).digest()
    return struct.unpack("<Q", digest[:8])[0]


def simhash(features):
    v = [0.0] * HASH_BITS
    for i, feat in enumerate(features):
        h = _hash_feature(i, feat)
        for bit in range(HASH_BITS):
            if h & (1 << bit):
                v[bit] += feat
            else:
                v[bit] -= feat
    fingerprint = 0
    for bit in range(HASH_BITS):
        if v[bit] > 0:
            fingerprint |= 1 << bit
    return fingerprint


def hamming_distance(a, b):
    return bin(a ^ b).count("1")


def image_hash(path):
    img = load_and_downscale(path)
    features = extract_features(img)
    return simhash(features)


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python simhash_img.py hash <image>")
        print("  python simhash_img.py compare <image1> <image2>")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "hash":
        h = image_hash(sys.argv[2])
        print(f"{h:016x}")

    elif cmd == "compare":
        h1 = image_hash(sys.argv[2])
        h2 = image_hash(sys.argv[3])
        dist = hamming_distance(h1, h2)
        print(f"Hash 1: {h1:016x}")
        print(f"Hash 2: {h2:016x}")
        print(f"Hamming distance: {dist}/{HASH_BITS}")

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


if __name__ == "__main__":
    main()
