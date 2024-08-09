"""
This script is used to create a mosaic preview of images.
"""

import math
from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageDraw


def create_preview_mosaic(files, size=100, sep=20, max_cols=None, output=None):
    images = []
    labels = []

    for file in files:
        im = Image.open(file)

        w = im.width
        h = im.height
        if w > h:
            im = im.crop(((w - h) // 2, 0, (w + h) // 2, h))
        elif h > w:
            im = im.crop((0, (h - w) // 2, w, (h + w) // 2))

        im = im.resize((size, size))
        images.append(im)

        label = Path(file).stem
        labels.append(label)

    if max_cols is None:
        w = math.ceil(math.sqrt(len(images)))
    else:
        w = min(max_cols, len(images))
    h = math.ceil(len(images) / w)

    mosaic = Image.new("RGB", (w * size + (w + 1) * sep, h * size + (h + 1) * sep), "white")
    draw = ImageDraw.Draw(mosaic)

    for i, (im, label) in enumerate(zip(images, labels)):
        x = i % w
        y = i // w

        mosaic.paste(im, (x * (size + sep) + sep, y * (size + sep) + sep))
        draw.text((x * (size + sep) + sep, y * (size + sep) + size + sep), label, (0, 0, 0))

    if output is None:
        mosaic.show()
    else:
        mosaic.save(output)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("files", nargs="+", help="Image files")
    parser.add_argument("--size", type=int, default=100, help="Size of each image")
    parser.add_argument("--sep", type=int, default=20, help="Separation between images")
    parser.add_argument("--max-cols", type=int, help="Maximum number of columns")
    parser.add_argument("--output", help="Output file to save the mosaic")
    args = parser.parse_args()
    create_preview_mosaic(args.files, args.size, args.sep, args.max_cols, args.output)
