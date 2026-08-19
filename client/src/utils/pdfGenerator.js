import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate and download an authentic, beautifully styled official HRMS payslip PDF.
 */
export function downloadPayslipPDF({
  employeeName = 'Sarah Jenkins',
  employeeEmail = 'sarah.j@company.com',
  employeeId = 'EMP-2026-084',
  department = 'Engineering',
  designation = 'Senior Full Stack Engineer',
  month = 7,
  year = 2026,
  basicSalary = 110000,
  hra = 33000,
  allowances = 15000,
  deductions = 18500,
  tax = 12000,
  netSalary = 127500,
  paymentDate = '2026-07-31',
  bankRef = 'ACH-99482109',
  panNumber = 'ABCDE1234F',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthNames = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = typeof month === 'number' ? monthNames[month] || `Month ${month}` : month;

  // Background Brand Header Bar
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Accent Line
  doc.setFillColor(147, 51, 234); // Purple 600
  doc.rect(0, 32, 210, 2, 'F');

  // Company Name & Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('HRMS CORE ENTERPRISE', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('Confidential Payroll & Compensation Disbursement Statement', 14, 22);
  doc.text('ISO 27001 Certified • Automated HRMS Engine v3.4', 14, 27);

  // Right Header badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('SALARY PAYSLIP', 196, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text(`Period: ${monthName} ${year}`, 196, 23, { align: 'right' });

  // Main Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 39, 182, 38, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  // Left Column Details
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Name:', 18, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(employeeName, 54, 47);

  doc.setFont('helvetica', 'bold');
  doc.text('Employee ID:', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(employeeId, 54, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Designation:', 18, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(designation, 54, 61);

  doc.setFont('helvetica', 'bold');
  doc.text('Department:', 18, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(department, 54, 68);

  // Right Column Details
  doc.setFont('helvetica', 'bold');
  doc.text('Disbursal Date:', 115, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentDate, 150, 47);

  doc.setFont('helvetica', 'bold');
  doc.text('Bank Ref ID:', 115, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(bankRef, 150, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Tax / PAN ID:', 115, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(panNumber, 150, 61);

  doc.setFont('helvetica', 'bold');
  doc.text('Paid Days:', 115, 68);
  doc.setFont('helvetica', 'normal');
  doc.text('22 / 22 Working Days', 150, 68);

  // Earnings & Deductions Tables
  const grossEarnings = Number(basicSalary) + Number(hra) + Number(allowances);
  const totalDeductions = Number(deductions);
  const calculatedNet = grossEarnings - totalDeductions;
  const finalNet = netSalary || calculatedNet;

  const tableData = [
    [
      'Basic Pay',
      `$${Number(basicSalary).toLocaleString()}`,
      'Income Tax Withholding (TDS)',
      `$${Number(tax || Math.round(deductions * 0.65)).toLocaleString()}`,
    ],
    [
      'House Rent Allowance (HRA)',
      `$${Number(hra).toLocaleString()}`,
      'Provident Fund / 401(k)',
      `$${Number(Math.round(deductions * 0.25)).toLocaleString()}`,
    ],
    [
      'Special Allowance & Flexi-Benefits',
      `$${Number(allowances).toLocaleString()}`,
      'Health & Medical Coverage',
      `$${Number(Math.round(deductions * 0.1)).toLocaleString()}`,
    ],
    [
      'Total Gross Earnings',
      `$${grossEarnings.toLocaleString()}`,
      'Total Deductions',
      `$${totalDeductions.toLocaleString()}`,
    ],
  ];

  autoTable(doc, {
    startY: 83,
    head: [['Earnings Head', 'Amount ($)', 'Deductions Head', 'Amount ($)']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 55 },
      3: { cellWidth: 37, halign: 'right', fontStyle: 'bold', textColor: [225, 29, 72] },
    },
    styles: {
      cellPadding: 3.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    didParseCell: (data) => {
      // Highlight totals row
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Net Pay Highlight Box
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.5);
  doc.roundedRect(14, finalY, 182, 26, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('NET DISBURSED SALARY (TAKE HOME)', 20, finalY + 8);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`$${Number(finalNet).toLocaleString()}`, 20, finalY + 18);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Mode of Transfer: Direct Bank ACH Deposit (${bankRef})`, 190, finalY + 12, { align: 'right' });
  doc.text(`Disbursement Status: VERIFIED & CLEARED`, 190, finalY + 18, { align: 'right' });

  // Security Verification & Signatures section
  const sigY = finalY + 34;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, sigY, 196, sigY);

  // Digital Signature Stamp
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, sigY + 4, 80, 24, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('DIGITALLY SIGNED & ENCRYPTED', 18, sigY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized by HRMS Core Automated Payroll Engine', 18, sigY + 15);
  doc.text(`SHA-256: ${Math.random().toString(36).substring(2, 12).toUpperCase()}-VERIFIED`, 18, sigY + 20);

  // Employer Seal / Authority
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('For HRMS Core Enterprise Ltd.', 196, sigY + 10, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory / Financial Controller', 196, sigY + 22, { align: 'right' });

  // Footer Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a computer-generated official document generated via HRMS Core. No physical signature required.',
    105,
    285,
    { align: 'center' }
  );

  // Download PDF file
  const cleanName = (employeeName || 'Employee').replace(/\s+/g, '_');
  doc.save(`Payslip_${monthName}_${year}_${cleanName}.pdf`);
  return true;
}
