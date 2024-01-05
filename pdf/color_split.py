"""
This script is used to split a PDF file into two PDF files, one containing all color pages
and one containing all black and white pages.
Useful if printing a PDF file with a color printer, but only some pages are colored.
"""

from argparse import ArgumentParser
from pathlib import Path

import numpy as np
from pdf2image.pdf2image import convert_from_path
from pikepdf import Pdf
from PIL import ImageChops


def contains_color(image, tolerance=0, threshold=0):
    """
    Returns True if the image contains any color pixels.
    """
    grayscale = image.convert("L").convert("RGB")

    diff = ImageChops.difference(image, grayscale)
    diff = np.array(diff)

    colored_pixels = int(np.sum(diff > tolerance))
    total_pixels = int(np.prod(diff.shape))

    return colored_pixels / total_pixels > threshold


def anjust_for_double_sided(colored_map):
    """
    Adjusts the colored map for double sided printing.
    If one side of a page is colored, the other side is included as well.
    """
    for i in range(0, len(colored_map) - 1, 2):
        if colored_map[i] or colored_map[i + 1]:
            colored_map[i] = True
            colored_map[i + 1] = True

    return colored_map


def split_pdf(pdf_file, double_sided=False):
    print("> Rendering PDF...")
    pages_rendered = convert_from_path(pdf_file, dpi=150)
    print("> Detecting color pages...")
    colored = [contains_color(page) for page in pages_rendered]
    print(f"> Detected {sum(colored)} color pages.")

    if double_sided:
        colored = anjust_for_double_sided(colored)

    color_pdf = Pdf.new()
    bw_pdf = Pdf.new()
    input_pdf = Pdf.open(pdf_file)

    assert len(colored) == len(input_pdf.pages)

    for is_colored, page in zip(colored, input_pdf.pages):
        if is_colored:
            color_pdf.pages.append(page)
        else:
            bw_pdf.pages.append(page)

    basename = Path(pdf_file).stem
    color_pdf.save(f"{basename}_color.pdf")
    bw_pdf.save(f"{basename}_bw.pdf")

    colored_pages_count = sum(colored)
    bw_pages_count = len(colored) - colored_pages_count

    print(f"Saved {colored_pages_count} color pages to `{basename}_color.pdf`")
    print(f"Saved {bw_pages_count} black and white pages to `{basename}_bw.pdf`")


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("input", help="PDF file to split")
    parser.add_argument("--ds", action="store_true", help="Adjust for double sided printing")
    args = parser.parse_args()
    split_pdf(args.input, double_sided=args.ds)
