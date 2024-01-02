export const parseString = (inputString: string) => {
  // Remove characters other than A-Z and space
  let parsedString = inputString.replace(/[^a-zA-Z ]/g, '');
  // Replace spaces with dashes
  parsedString = parsedString.replace(/\s+/g, '-');
  // Convert to lowercase
  parsedString = parsedString.toLowerCase();
  return parsedString;
}