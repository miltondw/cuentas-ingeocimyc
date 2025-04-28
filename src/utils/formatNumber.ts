export const formatNumber = (value: number | string | undefined | null) =>
  value === "" || value === null || value === undefined || isNaN(Number(value))
    ? ""
    : Number(value).toLocaleString("en-US");

export const parseNumber = (value: string | undefined) =>
  value ? value.replace(/,/g, "") : "";
