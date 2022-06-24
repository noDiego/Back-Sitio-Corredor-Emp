import PDFDocument = require('pdfkit');

export function generateHr(doc: PDFDocument): void {
  doc.lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(550, doc.y).stroke('#aaaaaa').moveDown(1);
}
