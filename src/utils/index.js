import axios from "axios";

export const fromAddress = async (address) => {
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",

    {
      params: {
        address,
        key: "AIzaSyCB5ELK-MyT_h_XUxkLz8gVlEIlloseKyo",
      },
    }
  );

  if (response.data.results.length === 0) return false;

  let formatted_address = response.data.results[0].formatted_address;

  const numCommas = (formatted_address.match(/,/g) || []).length;

  if (numCommas >= 3) {
    return true;
  } else {
    return false;
  }
};

export const validateAddress = async (address, index, func) => {
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        address,
        key: "AIzaSyCB5ELK-MyT_h_XUxkLz8gVlEIlloseKyo",
      },
    }
  );

  if (response.data.results.length === 0) return { [index]: false };
  func();
  return { [index]: true };
};
