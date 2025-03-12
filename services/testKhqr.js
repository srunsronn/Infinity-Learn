import {
  BakongKHQR,
  khqrData,
  IndividualInfo,
  MerchantInfo,
} from "bakong-khqr";

// ✅ Fix 1: Use KHR (Riels) instead of USD
const optionalData = {
  currency: khqrData.currency.khr, // ✅ Changed to KHR
  amount: 100500, // ✅ Convert USD 100.5 → KHR 100,500
  mobileNumber: "85512233455",
  storeLabel: "Coffee Shop",
  terminalLabel: "Cashier_1",
  purposeOfTransaction: "oversea",
  languagePreference: "km",
  merchantNameAlternateLanguage: "ចន ស្មីន",
  merchantCityAlternateLanguage: "សៀមរាប",
  upiMerchantAccount: "0001034400010344ABCDEFGHJIKLMNO",
};

// ✅ Fix 2: Use Proper UNIX Timestamp (Milliseconds) for Expiration
const expirationTime = Date.now() + 5 * 60 * 1000; // ✅ 5 minutes from now (milliseconds)
optionalData.expirationTimestamp = expirationTime; // ✅ Store as 13-digit UNIX timestamp

// ✅ Test Individual KHQR
const individualInfo = new IndividualInfo(
  "jonh_smith@devb", // ✅ Test Bakong Account ID
  "Jonh Smith", // ✅ Test Name
  "PHNOM PENH", // ✅ Test City
  optionalData
);

const KHQR = new BakongKHQR();
const individual = KHQR.generateIndividual(individualInfo);

console.log("\n✅ Individual KHQR Response:");
console.log(individual); // ✅ Print full response for debugging

if (individual && individual.data && individual.data.qr) {
  console.log("QR Code: " + individual.data.qr);
  console.log("MD5 Hash: " + individual.data.md5);
} else {
  console.error("❌ Error: KHQR Generation Failed for Individual.");
}

// ✅ Test Merchant KHQR
const merchantInfo = new MerchantInfo(
  "khqr@devb", // ✅ Merchant KHQR ID
  "Jonh Smith", // ✅ Merchant Name
  "PHNOM PENH", // ✅ Merchant City
  "123456", // ✅ Merchant Account Number
  "Dev Bank", // ✅ Acquiring Bank
  optionalData
);

const merchant = KHQR.generateMerchant(merchantInfo);

console.log("\n✅ Merchant KHQR Response:");
console.log(merchant); // ✅ Print full response for debugging

if (merchant && merchant.data && merchant.data.qr) {
  console.log("QR Code: " + merchant.data.qr);
  console.log("MD5 Hash: " + merchant.data.md5);
} else {
  console.error("❌ Error: KHQR Generation Failed for Merchant.");
}
