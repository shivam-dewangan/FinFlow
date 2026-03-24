// GST Calculation Utility
const GST_RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

const calculateGST = (items, isInterState = false) => {
  let subtotal = 0, totalDiscount = 0, totalTaxableAmount = 0;
  let totalCgst = 0, totalSgst = 0, totalIgst = 0;

  const processedItems = items.map(item => {
    const taxableAmount = (item.rate * item.quantity) - (item.discount || 0);
    const gstRate = item.gstRate || 18;
    const taxAmount = (taxableAmount * gstRate) / 100;

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
      igst = parseFloat(taxAmount.toFixed(2));
    } else {
      cgst = parseFloat((taxAmount / 2).toFixed(2));
      sgst = parseFloat((taxAmount / 2).toFixed(2));
    }

    const lineTotal = taxableAmount + taxAmount;

    subtotal += item.rate * item.quantity;
    totalDiscount += item.discount || 0;
    totalTaxableAmount += taxableAmount;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return {
      ...item,
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: parseFloat(igst.toFixed(2)),
      totalAmount: parseFloat(lineTotal.toFixed(2))
    };
  });

  const totalTax = parseFloat((totalCgst + totalSgst + totalIgst).toFixed(2));
  const grandTotalExact = totalTaxableAmount + totalTax;
  const grandTotalRounded = Math.round(grandTotalExact);
  const roundOff = parseFloat((grandTotalRounded - grandTotalExact).toFixed(2));

  return {
    lineItems: processedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalTaxableAmount: parseFloat(totalTaxableAmount.toFixed(2)),
    totalCgst: parseFloat(totalCgst.toFixed(2)),
    totalSgst: parseFloat(totalSgst.toFixed(2)),
    totalIgst: parseFloat(totalIgst.toFixed(2)),
    totalTax,
    roundOff,
    grandTotal: grandTotalRounded
  };
};

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertHundreds = (n) => {
    if (n >= 100) return ones[Math.floor(n / 100)] + ' Hundred ' + convertHundreds(n % 100);
    if (n >= 20) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[n];
  };

  if (num === 0) return 'Zero';
  let result = '';
  if (num >= 10000000) { result += convertHundreds(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
  if (num >= 100000) { result += convertHundreds(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
  if (num >= 1000) { result += convertHundreds(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  if (num > 0) result += convertHundreds(num);
  return 'Rupees ' + result.trim() + ' Only';
};

const validateGSTIN = (gstin) => {
  if (!gstin) return false;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};

const getGSTRates = () => GST_RATES;

module.exports = { calculateGST, numberToWords, validateGSTIN, getGSTRates };
