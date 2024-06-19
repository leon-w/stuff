"""
This script removes restrictions from the input PDF by simply opening and saving it.
Multiple input PDFs can be provided, in which case they will be merged into a single PDF.
"""

from argparse import ArgumentParser

from pikepdf import Pdf


def remove_restriction(input_pdfs, output_pdf=None):

    if output_pdf is None:
        if len(input_pdfs) == 1:
            print("Saving into the same file...")
            output_pdf = input_pdfs[0]
        else:
            raise ValueError("Output PDF file must be specified when multiple input PDFs are provided")

    pdf = Pdf.new()

    for pdf_file in input_pdfs:
        with Pdf.open(pdf_file) as input_pdf:
            pdf.pages.extend(input_pdf.pages)

    pdf.save(output_pdf)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("input_pdfs", nargs="+", help="The input PDF file(s)")
    parser.add_argument("--output-pdf", "-o", help="The output PDF file")
    args = parser.parse_args()

    remove_restriction(args.input_pdfs, args.output_pdf)
