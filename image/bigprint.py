"""
This script is used to split an input image into multiple pages for printing.
"""

import math
from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageDraw


def create_print_pages(file, output_size, page_size, ppc, output, outer_padding=0, inner_padding=0, fit="crop"):
    im = Image.open(file)

    full_w_cm, full_h_cm = output_size
    page_w_cm, page_h_cm = page_size

    assert page_w_cm <= full_w_cm and page_h_cm <= full_h_cm, "Page size must be smaller than output size"

    n_cols = full_w_cm // page_w_cm
    n_rows = full_h_cm // page_h_cm

    page_w_px = math.ceil(page_w_cm * ppc)
    page_h_px = math.ceil(page_h_cm * ppc)

    full_w_px = n_cols * page_w_px
    full_h_px = n_rows * page_h_px
    full_im = Image.new("RGB", (full_w_px, full_h_px), "white")

    aspect_full = full_w_px / full_h_px
    aspect_im = im.width / im.height

    if (aspect_full < aspect_im) ^ (fit == "crop"):
        h = math.ceil(full_w_px / aspect_im)
        full_im.paste(im.resize((full_w_px, h)), (0, (full_h_px - h) // 2))
    else:
        w = math.ceil(full_h_px * aspect_im)
        full_im.paste(im.resize((w, full_h_px)), ((full_w_px - w) // 2, 0))

    if outer_padding > 0:
        outer_padding_px = math.ceil(outer_padding * ppc)
        full_im_padded = Image.new("RGB", full_im.size, "white")
        full_im_padded.paste(
            full_im.resize((full_w_px - 2 * outer_padding_px, full_h_px - 2 * outer_padding_px)),
            (outer_padding_px, outer_padding_px),
        )
        full_im = full_im_padded

    print(f"Number of pages: {n_cols}x{n_rows} ({n_cols * n_rows} total), {n_cols * page_w_cm}x{n_rows * page_h_cm} cm")
    print(f"Output size: {full_w_px}x{full_h_px} px, Page size: {page_w_px}x{page_h_px} px")

    output_dir = Path(output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # split into pages
    pages = []
    index = 1
    for i in range(n_cols):
        pages.append([])
        for j in range(n_rows):
            x = i * page_w_px
            y = j * page_h_px

            page = full_im.crop((x, y, x + page_w_px, y + page_h_px))

            if inner_padding != 0:
                inner_padding_px = math.ceil(inner_padding * ppc)
                if inner_padding_px > 0:
                    # add extra white padding to the page
                    page_padded = Image.new("RGB", page.size, "white")
                    page_padded.paste(
                        page.resize((page_w_px - 2 * inner_padding_px, page_h_px - 2 * inner_padding_px)),
                        (inner_padding_px, inner_padding_px),
                    )
                    page = page_padded
                else:
                    # add white padding on top of the image
                    draw = ImageDraw.Draw(page)
                    draw.rectangle([0, 0, page_w_px, page_h_px], outline="white", width=-inner_padding_px)

            page.save(output_dir / f"page_{index:02d}_{i+1}x{j+1}.png")
            pages[i].append(page)
            index += 1

    # create a preview
    preview = Image.new("RGB", (full_w_px + n_cols + 1, full_h_px + n_rows + 1), "black")
    draw = ImageDraw.Draw(preview)
    for i in range(n_cols):
        for j in range(n_rows):
            x = i * page_w_px + i
            y = j * page_h_px + j
            preview.paste(pages[i][j], (x, y))

    preview.show()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("file", help="Image file")
    parser.add_argument("--output-size", type=int, nargs=2, required=True, help="Size of the output mosaic in cm")
    parser.add_argument("--page-size", type=int, nargs=2, required=True, help="Size of each page in cm")
    parser.add_argument("--output", "-o", required=True, help="Output directory to save the pages")
    parser.add_argument("--ppc", type=int, default=300, help="PPC (pixels per cm) of the output mosaic")
    parser.add_argument("--outer-padding", type=float, default=0, help="Outer padding in cm")
    parser.add_argument(
        "--inner-padding",
        type=float,
        default=0,
        help="Inner padding in cm. Positive values add extra passing, negative values add padding on top of the image",
    )
    parser.add_argument("--fit", choices=["fill", "crop"], default="crop", help="How to fit the image into the output")

    args = parser.parse_args()
    create_print_pages(
        args.file,
        args.output_size,
        args.page_size,
        args.ppc,
        args.output,
        args.outer_padding,
        args.inner_padding,
        args.fit,
    )
