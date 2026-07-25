const PDFDocument = require('pdfkit');

function generatePayslipPDF(res, payroll, employee) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=payslip-${employee.name.replace(/\s+/g, '_')}-${payroll.month}-${payroll.year}.pdf`
  );

  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text('HRMS Payroll System', { align: 'center' })
    .moveDown(0.5)
    .fontSize(14)
    .text('Payslip', { align: 'center' })
    .moveDown(1.5);

  // Employee details
  doc
    .fontSize(11)
    .text(`Employee Name: ${employee.name}`)
    .text(`Email: ${employee.email}`)
    .text(`Pay Period: ${payroll.month}/${payroll.year}`)
    .moveDown(1);

  // Line separator
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown(1);

  // Salary breakdown
  doc.fontSize(12).text('Salary Breakdown', { underline: true }).moveDown(0.5);

  doc
    .fontSize(11)
    .text(`Basic Salary:`, 50, doc.y, { continued: true })
    .text(`Rs. ${payroll.basicSalary.toLocaleString()}`, { align: 'right' });

  doc
    .text(`Deductions:`, 50, doc.y, { continued: true })
    .text(`Rs. ${payroll.deductions.toLocaleString()}`, { align: 'right' });

  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .text(`Net Salary:`, 50, doc.y, { continued: true })
    .text(`Rs. ${payroll.netSalary.toLocaleString()}`, { align: 'right' });

  doc.moveDown(2);

  doc
    .fontSize(9)
    .fillColor('gray')
    .text('This is a system-generated payslip and does not require a signature.', {
      align: 'center',
    });

  doc.end();
}

module.exports = generatePayslipPDF;
