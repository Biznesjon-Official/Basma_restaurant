import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// Format currency for export
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date for export
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ==================== PDF EXPORT ====================

interface PDFExportOptions {
  title: string
  subtitle?: string
  headers: string[]
  data: any[][]
  filename?: string
}

export const exportToPDF = (options: PDFExportOptions) => {
  const { title, subtitle, headers, data, filename = 'hisobot.pdf' } = options

  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text(title, 14, 20)

  // Subtitle
  if (subtitle) {
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(subtitle, 14, 28)
  }

  // Table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: subtitle ? 35 : 28,
    styles: {
      font: 'helvetica',
      fontSize: 10,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(150)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Sahifa ${i} / ${pageCount} - BASMA Osh Markazi`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  doc.save(filename)
}

// ==================== EXCEL EXPORT ====================

interface ExcelExportOptions {
  sheetName: string
  data: any[]
  filename?: string
}

export const exportToExcel = (options: ExcelExportOptions) => {
  const { sheetName, data, filename = 'hisobot.xlsx' } = options

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

// ==================== RECEIPT PDF ====================

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptData {
  orderNumber: string
  tableNumber: number
  waiter: string
  date: Date
  items: ReceiptItem[]
  subtotal: number
  tax?: number
  serviceCharge?: number
  total: number
  paymentType: string
}

export const exportReceipt = (data: ReceiptData) => {
  const doc = new jsPDF({
    format: [80, 200], // 80mm width (thermal printer)
  })

  let y = 10

  // Header
  doc.setFontSize(16)
  doc.text('BASMA OSH MARKAZI', 40, y, { align: 'center' })
  y += 8

  doc.setFontSize(8)
  doc.text('Toshkent, O\'zbekiston', 40, y, { align: 'center' })
  y += 5
  doc.text('Tel: +998 90 123 45 67', 40, y, { align: 'center' })
  y += 8

  // Divider
  doc.line(5, y, 75, y)
  y += 5

  // Order info
  doc.setFontSize(9)
  doc.text(`Chek: #${data.orderNumber}`, 5, y)
  y += 5
  doc.text(`Stol: ${data.tableNumber}`, 5, y)
  y += 5
  doc.text(`Ofitsiant: ${data.waiter}`, 5, y)
  y += 5
  doc.text(`Sana: ${formatDate(data.date)}`, 5, y)
  y += 8

  // Divider
  doc.line(5, y, 75, y)
  y += 5

  // Items
  doc.setFontSize(8)
  data.items.forEach((item) => {
    doc.text(item.name, 5, y)
    y += 4
    doc.text(
      `${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`,
      5,
      y
    )
    y += 6
  })

  // Divider
  doc.line(5, y, 75, y)
  y += 5

  // Totals
  doc.setFontSize(9)
  doc.text('Jami:', 5, y)
  doc.text(formatCurrency(data.subtotal), 75, y, { align: 'right' })
  y += 5

  if (data.tax) {
    doc.text('Soliq:', 5, y)
    doc.text(formatCurrency(data.tax), 75, y, { align: 'right' })
    y += 5
  }

  if (data.serviceCharge) {
    doc.text('Xizmat to\'lovi:', 5, y)
    doc.text(formatCurrency(data.serviceCharge), 75, y, { align: 'right' })
    y += 5
  }

  // Divider
  doc.line(5, y, 75, y)
  y += 5

  // Total
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('JAMI:', 5, y)
  doc.text(formatCurrency(data.total), 75, y, { align: 'right' })
  y += 8

  // Payment type
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`To'lov turi: ${data.paymentType}`, 5, y)
  y += 8

  // Footer
  doc.setFontSize(8)
  doc.text('Rahmat! Yana kuting!', 40, y, { align: 'center' })
  y += 5
  doc.text('www.basma-osh.uz', 40, y, { align: 'center' })

  doc.save(`chek-${data.orderNumber}.pdf`)
}

// ==================== REPORTS EXPORT ====================

export const exportTopSellingReport = (data: any[], period: string) => {
  // PDF
  const pdfData = data.map((item, index) => [
    (index + 1).toString(),
    item.menuItem?.name || 'N/A',
    item.totalQuantity.toString(),
    formatCurrency(item.totalRevenue),
  ])

  exportToPDF({
    title: 'Eng ko\'p sotilgan taomlar',
    subtitle: `Davr: ${period}`,
    headers: ['#', 'Taom', 'Soni', 'Daromad'],
    data: pdfData,
    filename: `top-selling-${period}.pdf`,
  })

  // Excel
  const excelData = data.map((item, index) => ({
    '#': index + 1,
    'Taom': item.menuItem?.name || 'N/A',
    'Kategoriya': item.menuItem?.category || 'N/A',
    'Soni': item.totalQuantity,
    'Daromad': item.totalRevenue,
  }))

  exportToExcel({
    sheetName: 'Top Selling',
    data: excelData,
    filename: `top-selling-${period}.xlsx`,
  })
}

export const exportStaffPerformanceReport = (data: any[], period: string) => {
  // PDF
  const pdfData = data.map((staff, index) => [
    (index + 1).toString(),
    staff.waiter?.fullName || 'N/A',
    staff.totalOrders.toString(),
    formatCurrency(staff.totalRevenue),
    formatCurrency(staff.averageOrderValue),
  ])

  exportToPDF({
    title: 'Xodimlar samaradorligi (KPI)',
    subtitle: `Davr: ${period}`,
    headers: ['#', 'Xodim', 'Buyurtmalar', 'Daromad', 'O\'rtacha'],
    data: pdfData,
    filename: `staff-kpi-${period}.pdf`,
  })

  // Excel
  const excelData = data.map((staff, index) => ({
    '#': index + 1,
    'Xodim': staff.waiter?.fullName || 'N/A',
    'Buyurtmalar': staff.totalOrders,
    'Daromad': staff.totalRevenue,
    'O\'rtacha buyurtma': staff.averageOrderValue,
  }))

  exportToExcel({
    sheetName: 'Staff KPI',
    data: excelData,
    filename: `staff-kpi-${period}.xlsx`,
  })
}

export const exportCustomersReport = (data: any[]) => {
  // PDF
  const pdfData = data.map((customer, index) => [
    (index + 1).toString(),
    customer.name || 'N/A',
    customer.phone || 'N/A',
    customer.totalOrders.toString(),
    formatCurrency(customer.totalSpent),
    customer.isVIP ? 'VIP' : '',
  ])

  exportToPDF({
    title: 'Mijozlar bazasi',
    subtitle: `Jami: ${data.length} ta mijoz`,
    headers: ['#', 'Ism', 'Telefon', 'Buyurtmalar', 'Xarajat', 'Holat'],
    data: pdfData,
    filename: 'customers.pdf',
  })

  // Excel
  const excelData = data.map((customer, index) => ({
    '#': index + 1,
    'Ism': customer.name || 'N/A',
    'Telefon': customer.phone || 'N/A',
    'Buyurtmalar': customer.totalOrders,
    'Jami xarajat': customer.totalSpent,
    'VIP': customer.isVIP ? 'Ha' : 'Yo\'q',
  }))

  exportToExcel({
    sheetName: 'Mijozlar',
    data: excelData,
    filename: 'customers.xlsx',
  })
}

export const exportExpensesReport = (data: any[], startDate?: string, endDate?: string) => {
  // PDF
  const pdfData = data.map((expense, index) => [
    (index + 1).toString(),
    formatDate(expense.date),
    expense.category || 'N/A',
    expense.description || 'N/A',
    formatCurrency(expense.amount),
  ])

  const subtitle = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : 'Barcha chiqimlar'

  exportToPDF({
    title: 'Chiqimlar hisoboti',
    subtitle,
    headers: ['#', 'Sana', 'Kategoriya', 'Tavsif', 'Summa'],
    data: pdfData,
    filename: 'expenses.pdf',
  })

  // Excel
  const excelData = data.map((expense, index) => ({
    '#': index + 1,
    'Sana': formatDate(expense.date),
    'Kategoriya': expense.category || 'N/A',
    'Tavsif': expense.description || 'N/A',
    'Summa': expense.amount,
    'Doimiy': expense.isRecurring ? 'Ha' : 'Yo\'q',
  }))

  exportToExcel({
    sheetName: 'Chiqimlar',
    data: excelData,
    filename: 'expenses.xlsx',
  })
}
