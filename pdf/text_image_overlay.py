"""
This script overlays an image on the text matches in the input PDF.
The text to search for and the image to overlay are provided as arguments.
This has no practical use and is only used for fun.
"""

from argparse import ArgumentParser
from pathlib import Path

import pymupdf


def overlay_images_on_matches(doc, query, image_filename):
    for page in doc:
        wlist = page.get_text("words", delimiters=None)
        for w in wlist:
            if query in w[4].lower():
                rect = pymupdf.Rect(w[:4])
                page.insert_image(rect, filename=image_filename, keep_proportion=False)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("filename", help="PDF file to process")
    parser.add_argument("--text", help="Text to search for")
    parser.add_argument("--image", help="Image to overlay")
    args = parser.parse_args()

    doc = pymupdf.open(args.filename)

    overlay_images_on_matches(doc, args.text.lower(), args.image)

    # save the modified PDF with a new name by adding a suffix
    new_filename = Path(args.filename).stem + "_overlay.pdf"
    doc.save(new_filename)
