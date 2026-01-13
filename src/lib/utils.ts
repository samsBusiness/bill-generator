import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import jwt from "jsonwebtoken";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function price_in_words(price: any) {
  const sglDigit = [
      "Zero",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ],
    dblDigit = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ],
    tensPlace = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ],
    handle_tens = function (dgt: any, prevDgt: any) {
      return 0 == dgt
        ? ""
        : " " + (1 == dgt ? dblDigit[prevDgt] : tensPlace[dgt]);
    },
    handle_utlc = function (dgt: any, nxtDgt: any, denom: any) {
      return (
        (0 != dgt && 1 != nxtDgt ? " " + sglDigit[dgt] : "") +
        (0 != nxtDgt || dgt > 0 ? " " + denom : "")
      );
    };

  let str = "",
    digitIdx = 0,
    digit = 0,
    nxtDigit = 0;
  const words = [];
  if (((price += ""), isNaN(parseInt(price)))) str = "";
  else if (parseInt(price) > 0 && price.length <= 10) {
    for (digitIdx = price.length - 1; digitIdx >= 0; digitIdx--)
      switch (
        ((digit = price[digitIdx] - 0),
        (nxtDigit = digitIdx > 0 ? price[digitIdx - 1] - 0 : 0),
        price.length - digitIdx - 1)
      ) {
        case 0:
          words.push(handle_utlc(digit, nxtDigit, ""));
          break;
        case 1:
          words.push(handle_tens(digit, price[digitIdx + 1]));
          break;
        case 2:
          words.push(
            0 != digit
              ? " " +
                  sglDigit[digit] +
                  " Hundred" +
                  (0 != price[digitIdx + 1] && 0 != price[digitIdx + 2]
                    ? " and"
                    : "")
              : ""
          );
          break;
        case 3:
          words.push(handle_utlc(digit, nxtDigit, "Thousand"));
          break;
        case 4:
          words.push(handle_tens(digit, price[digitIdx + 1]));
          break;
        case 5:
          words.push(handle_utlc(digit, nxtDigit, "Lakh"));
          break;
        case 6:
          words.push(handle_tens(digit, price[digitIdx + 1]));
          break;
        case 7:
          words.push(handle_utlc(digit, nxtDigit, "Crore"));
          break;
        case 8:
          words.push(handle_tens(digit, price[digitIdx + 1]));
          break;
        case 9:
          words.push(
            0 != digit
              ? " " +
                  sglDigit[digit] +
                  " Hundred" +
                  (0 != price[digitIdx + 1] || 0 != price[digitIdx + 2]
                    ? " and"
                    : " Crore")
              : ""
          );
      }
    str = words.reverse().join("");
  } else str = "";
  return str.length > 1 ? str + " only." : str;
}

export function flattenObjectWithoutDelimiter(obj: any, result: any = {}) {
  for (const key in obj) {
    if (obj.hasOwnProperty.call(obj, key)) {
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObjectWithoutDelimiter(obj[key], result);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

export const roundto2decimal = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const getFinYear = (date: Date = new Date()) => {
  const currentDate = new Date(date);
  // Anchor April 1st to the year of the provided date (not the system year)
  const april1stOfYear = new Date(currentDate.getFullYear(), 3, 1);
  // Normalize times to avoid timezone/time-of-day edge cases
  april1stOfYear.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const currentYear =
    currentDate >= april1stOfYear
      ? currentDate.getFullYear()
      : currentDate.getFullYear() - 1;

  return (
    currentYear.toString().substring(2) +
    "-" +
    (currentYear + 1).toString().substring(2)
  );
};

export const verifyToken = (token: string) => {
  const JWT_SECRET = "alimanbg";
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      // Handle token expiration error
      console.log("Token has expired. Please login again.");
    } else if (error instanceof jwt.JsonWebTokenError) {
      // Handle invalid token error
      console.log("Invalid token. Please login again.");
    } else {
      // Handle other errors
      console.error("Error verifying token:", error.message);
    }
    return null;
  }
};
