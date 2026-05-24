import nodemailer from "nodemailer";
import { config } from "@/config";
import { logger } from "@/utils/logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};



export const ALLOWED_CURRENCIES = [
  // Africa
  "DZD", // Algerian Dinar
  "AOA", // Angolan Kwanza
  "XOF", // West African CFA Franc (Benin, Burkina Faso, Guinea-Bissau, Ivory Coast, Mali, Niger, Senegal, Togo)
  "BWP", // Botswana Pula
  "BIF", // Burundian Franc
  "CVE", // Cape Verdean Escudo
  "XAF", // Central African CFA Franc (Cameroon, CAR, Chad, Congo, Equatorial Guinea, Gabon)
  "KMF", // Comorian Franc
  "CDF", // Congolese Franc
  "DJF", // Djiboutian Franc
  "EGP", // Egyptian Pound
  "ERN", // Eritrean Nakfa
  "SZL", // Eswatini Lilangeni
  "ETB", // Ethiopian Birr
  "GMD", // Gambian Dalasi
  "GHS", // Ghanaian Cedi
  "GNF", // Guinean Franc
  "KES", // Kenyan Shilling
  "LSL", // Lesotho Loti
  "LRD", // Liberian Dollar
  "LYD", // Libyan Dinar
  "MGA", // Malagasy Ariary
  "MWK", // Malawian Kwacha
  "MRU", // Mauritanian Ouguiya
  "MUR", // Mauritian Rupee
  "MAD", // Moroccan Dirham
  "MZN", // Mozambican Metical
  "NAD", // Namibian Dollar
  "NGN", // Nigerian Naira
  "RWF", // Rwandan Franc
  "STN", // São Tomé and Príncipe Dobra
  "SCR", // Seychellois Rupee
  "SLL", // Sierra Leonean Leone
  "SOS", // Somali Shilling
  "ZAR", // South African Rand
  "SSP", // South Sudanese Pound
  "SDG", // Sudanese Pound
  "TZS", // Tanzanian Shilling
  "TND", // Tunisian Dinar
  "UGX", // Ugandan Shilling
  "ZMW", // Zambian Kwacha
  "ZWL", // Zimbabwean Dollar

  // Americas
  "ARS", // Argentine Peso
  "AWG", // Aruban Florin
  "BSD", // Bahamian Dollar
  "BBD", // Barbadian Dollar
  "BZD", // Belize Dollar
  "BMD", // Bermudian Dollar
  "BOB", // Bolivian Boliviano
  "BRL", // Brazilian Real
  "CAD", // Canadian Dollar
  "KYD", // Cayman Islands Dollar
  "CLP", // Chilean Peso
  "COP", // Colombian Peso
  "CRC", // Costa Rican Colón
  "CUP", // Cuban Peso
  "DOP", // Dominican Peso
  "XCD", // East Caribbean Dollar
  "SVC", // Salvadoran Colón
  "GTQ", // Guatemalan Quetzal
  "GYD", // Guyanese Dollar
  "HTG", // Haitian Gourde
  "HNL", // Honduran Lempira
  "JMD", // Jamaican Dollar
  "MXN", // Mexican Peso
  "NIO", // Nicaraguan Córdoba
  "PAB", // Panamanian Balboa
  "PYG", // Paraguayan Guaraní
  "PEN", // Peruvian Sol
  "TTD", // Trinidad and Tobago Dollar
  "USD", // US Dollar
  "UYU", // Uruguayan Peso
  "VES", // Venezuelan Bolívar

  // Asia
  "AFN", // Afghan Afghani
  "AMD", // Armenian Dram
  "AZN", // Azerbaijani Manat
  "BHD", // Bahraini Dinar
  "BDT", // Bangladeshi Taka
  "BND", // Brunei Dollar
  "KHR", // Cambodian Riel
  "CNY", // Chinese Yuan
  "GEL", // Georgian Lari
  "HKD", // Hong Kong Dollar
  "INR", // Indian Rupee
  "IDR", // Indonesian Rupiah
  "IRR", // Iranian Rial
  "IQD", // Iraqi Dinar
  "ILS", // Israeli New Shekel
  "JPY", // Japanese Yen
  "JOD", // Jordanian Dinar
  "KZT", // Kazakhstani Tenge
  "KWD", // Kuwaiti Dinar
  "KGS", // Kyrgyzstani Som
  "LAK", // Lao Kip
  "LBP", // Lebanese Pound
  "MOP", // Macanese Pataca
  "MYR", // Malaysian Ringgit
  "MVR", // Maldivian Rufiyaa
  "MNT", // Mongolian Tögrög
  "MMK", // Myanmar Kyat
  "NPR", // Nepalese Rupee
  "KPW", // North Korean Won
  "OMR", // Omani Rial
  "PKR", // Pakistani Rupee
  "PHP", // Philippine Peso
  "QAR", // Qatari Riyal
  "SAR", // Saudi Riyal
  "SGD", // Singapore Dollar
  "KRW", // South Korean Won
  "LKR", // Sri Lankan Rupee
  "SYP", // Syrian Pound
  "TWD", // New Taiwan Dollar
  "TJS", // Tajikistani Somoni
  "THB", // Thai Baht
  "TMT", // Turkmenistani Manat
  "AED", // UAE Dirham
  "UZS", // Uzbekistani Som
  "VND", // Vietnamese Dong
  "YER", // Yemeni Rial

  // Europe
  "ALL", // Albanian Lek
  "EUR", // Euro (Eurozone)
  "BAM", // Bosnia and Herzegovina Convertible Mark
  "BGN", // Bulgarian Lev
  "HRK", // Croatian Kuna
  "CZK", // Czech Koruna
  "DKK", // Danish Krone
  "GBP", // British Pound Sterling
  "HUF", // Hungarian Forint
  "ISK", // Icelandic Króna
  "CHF", // Swiss Franc
  "MDL", // Moldovan Leu
  "MKD", // Macedonian Denar
  "NOK", // Norwegian Krone
  "PLN", // Polish Złoty
  "RON", // Romanian Leu
  "RUB", // Russian Ruble
  "RSD", // Serbian Dinar
  "SEK", // Swedish Krona
  "TRY", // Turkish Lira
  "UAH", // Ukrainian Hryvnia
  "GIP", // Gibraltar Pound
  "HKD", // (also listed under Asia)

  // Oceania
  "AUD", // Australian Dollar
  "FJD", // Fijian Dollar
  "XPF", // CFP Franc (French Polynesia, New Caledonia, Wallis and Futuna)
  "NZD", // New Zealand Dollar
  "PGK", // Papua New Guinean Kina
  "WST", // Samoan Tālā
  "SBD", // Solomon Islands Dollar
  "TOP", // Tongan Paʻanga
  "VUV", // Vanuatu Vatu

  // Special / Supranational
  "XDR", // IMF Special Drawing Rights
  "XAU", // Gold (troy ounce)
  "XAG", // Silver (troy ounce)
] as const;

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const helpers = {
  sendEmail,
   ALLOWED_CURRENCIES,
   slugify
};
