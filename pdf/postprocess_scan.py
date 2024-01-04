"""
This script is used to process a PDF file, extract images, allow the user to edit them,
and then reinsert them back into the PDF.
"""

import os
from argparse import ArgumentParser

from pikepdf import Name, Pdf, PdfImage


def process_pdf(in_pdf_file, out_pdf_file):
    input_pdf = Pdf.open(in_pdf_file)

    images = []

    for page_num, page in enumerate(input_pdf.pages):
        images.append([])
        for image_num, image_name in enumerate(page.images.keys()):
            pdfimage = PdfImage(page.images[image_name])
            image_file = pdfimage.extract_to(fileprefix=f"{page_num}_{image_num}")
            images[page_num].append((pdfimage, image_file))

    # wait for user to press enter
    input("Press enter once the you finished editing the images...\n")

    for page_num, page in enumerate(input_pdf.pages):
        for image_num, image in enumerate(images[page_num]):
            pdfimage, image_file = image
            with open(image_file, "rb") as f:
                rawdata = f.read()
            pdfimage.obj.write(rawdata, filter=Name(pdfimage.obj.Filter))

    input_pdf.save(out_pdf_file)

    delete = input("Delete temporary files? [y/n] ")
    if delete == "y":
        for page_num, page in enumerate(input_pdf.pages):
            for image_num, image in enumerate(images[page_num]):
                pdfimage, image_file = image
                os.remove(image_file)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("input", help="input PDF file")
    parser.add_argument("output", help="output PDF file")
    args = parser.parse_args()
    process_pdf(args.input, args.output)
