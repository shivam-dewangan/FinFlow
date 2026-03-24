const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (invoice, business) => {
  return new Promise((resolve, reject) => {
    const pdfDir = path.join(__dirname, '../pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const fileName = `${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const colors = { primary: '#1D9E75', dark: '#0f1a12', gray: '#6b7280', light: '#f0fdf4', border: '#e5e7eb' };

    // Header
    doc.rect(0, 0, 595, 90).fill(colors.primary);
    doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('TAX INVOICE', 40, 20);
    doc.fontSize(10).font('Helvetica').text(business.name, 40, 50);
    if (business.gstin) doc.text(`GSTIN: ${business.gstin}`, 40, 65);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('white')
      .text(invoice.invoiceNumber, 400, 30, { align: 'right' });
    doc.fontSize(10).font('Helvetica')
      .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 400, 55, { align: 'right' });
    if (invoice.dueDate) {
      doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 400, 70, { align: 'right' });
    }

    // Business & Customer info
    doc.fillColor(colors.dark).fontSize(10).font('Helvetica-Bold').text('FROM:', 40, 110);
    doc.font('Helvetica').fontSize(9).fillColor(colors.gray);
    const bAddr = business.address || {};
    doc.text([bAddr.line1, bAddr.city, bAddr.state, bAddr.pincode].filter(Boolean).join(', ') || '', 40, 125);
    if (business.phone) doc.text(`Ph: ${business.phone}`, 40, 140);

    doc.fillColor(colors.dark).fontSize(10).font('Helvetica-Bold').text('BILL TO:', 310, 110);
    doc.font('Helvetica').fontSize(9).fillColor(colors.gray);
    doc.text(invoice.customer.name, 310, 125);
    if (invoice.customer.gstin) doc.text(`GSTIN: ${invoice.customer.gstin}`, 310, 140);
    const cAddr = invoice.customer.address || {};
    doc.text([cAddr.line1, cAddr.city, cAddr.state].filter(Boolean).join(', ') || '', 310, 155);

    // Table header
    const tableY = 195;
    doc.rect(40, tableY, 515, 22).fill(colors.primary);
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
    doc.text('#', 45, tableY + 7);
    doc.text('Description', 60, tableY + 7);
    doc.text('HSN', 230, tableY + 7);
    doc.text('Qty', 275, tableY + 7);
    doc.text('Rate', 310, tableY + 7);
    doc.text('Taxable', 355, tableY + 7);
    doc.text('GST%', 410, tableY + 7);
    doc.text('GST Amt', 450, tableY + 7);
    doc.text('Total', 510, tableY + 7);

    // Line items
    let y = tableY + 22;
    invoice.lineItems.forEach((item, i) => {
      const bg = i % 2 === 0 ? '#f9fafb' : 'white';
      doc.rect(40, y, 515, 20).fill(bg);
      doc.fillColor(colors.dark).fontSize(8.5).font('Helvetica');
      doc.text(String(i + 1), 45, y + 6);
      doc.text(item.description, 60, y + 6, { width: 165 });
      doc.text(item.hsn || '-', 230, y + 6);
      doc.text(String(item.quantity), 275, y + 6);
      doc.text(`₹${item.rate.toFixed(2)}`, 305, y + 6, { width: 45, align: 'right' });
      doc.text(`₹${item.taxableAmount.toFixed(2)}`, 350, y + 6, { width: 55, align: 'right' });
      doc.text(`${item.gstRate}%`, 412, y + 6);
      const gstAmt = item.cgst + item.sgst || item.igst || 0;
      doc.text(`₹${gstAmt.toFixed(2)}`, 445, y + 6, { width: 55, align: 'right' });
      doc.text(`₹${item.totalAmount.toFixed(2)}`, 500, y + 6, { width: 55, align: 'right' });
      y += 20;
    });

    // Totals
    y += 10;
    doc.rect(350, y, 205, 1).fill(colors.border);
    y += 8;
    const addRow = (label, value, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
        .fillColor(bold ? colors.dark : colors.gray);
      doc.text(label, 355, y);
      doc.text(value, 500, y, { width: 55, align: 'right' });
      y += 16;
    };
    addRow('Subtotal:', `₹${invoice.subtotal.toFixed(2)}`);
    if (invoice.totalDiscount > 0) addRow('Discount:', `-₹${invoice.totalDiscount.toFixed(2)}`);
    addRow('Taxable Amount:', `₹${invoice.totalTaxableAmount.toFixed(2)}`);
    if (invoice.totalCgst > 0) addRow('CGST:', `₹${invoice.totalCgst.toFixed(2)}`);
    if (invoice.totalSgst > 0) addRow('SGST:', `₹${invoice.totalSgst.toFixed(2)}`);
    if (invoice.totalIgst > 0) addRow('IGST:', `₹${invoice.totalIgst.toFixed(2)}`);
    if (invoice.roundOff !== 0) addRow('Round Off:', `₹${invoice.roundOff.toFixed(2)}`);
    doc.rect(350, y, 205, 1).fill(colors.border);
    y += 6;
    doc.rect(350, y, 205, 24).fill(colors.primary);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(11);
    doc.text('GRAND TOTAL:', 355, y + 7);
    doc.text(`₹${invoice.grandTotal.toLocaleString('en-IN')}`, 430, y + 7, { width: 120, align: 'right' });

    // Amount in words
    y += 40;
    doc.rect(40, y, 515, 22).fill(colors.light);
    doc.fillColor(colors.primary).fontSize(9).font('Helvetica-Bold')
      .text(`Amount in Words: ${invoice.amountInWords}`, 45, y + 7);

    // Bank details & notes
    y += 35;
    if (business.bankDetails && business.bankDetails.bankName) {
      doc.fillColor(colors.dark).fontSize(9).font('Helvetica-Bold').text('Bank Details:', 40, y);
      doc.font('Helvetica').fillColor(colors.gray).fontSize(8.5);
      const bd = business.bankDetails;
      doc.text(`${bd.bankName} | A/c: ${bd.accountNo} | IFSC: ${bd.ifsc}`, 40, y + 14);
      if (bd.upiId) doc.text(`UPI: ${bd.upiId}`, 40, y + 28);
    }

    // Footer
    doc.rect(0, 780, 595, 60).fill(colors.primary);
    doc.fillColor('white').fontSize(8).font('Helvetica')
      .text('This is a computer generated invoice. No signature required.', 40, 795, { align: 'center', width: 515 });
    doc.text('Thank you for your business!', 40, 810, { align: 'center', width: 515 });

    doc.end();
    stream.on('finish', () => resolve({ filePath, fileName }));
    stream.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };
