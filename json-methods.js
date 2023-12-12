import fs from "fs";



// Save JSON file
export const saveToJsonFile = (filePath, data) => {
  const jsonString = JSON.stringify(data, null, 2); // The third parameter (2) is for indentation in spaces
  fs.writeFileSync(filePath, jsonString, 'utf-8');
  console.log(`File saved successfully to ${filePath}`);
};

// Read JSON file
export const readFromJsonFile = (filePath) => {
  try {
    const jsonString = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(jsonString);
    console.log('File read successfully.');
    return jsonData;
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    return null;
  }
};

// // Example usage
// const filePath = 'example.json';

// // Sample object to be stored in JSON file
// const myObject = {
//   name: 'John Doe',
//   age: 30,
//   city: 'Example City'
// };

// // Save the object to a JSON file
// saveToJsonFile(filePath, myObject);

// // Read the object from the JSON file
// const retrievedObject = readFromJsonFile(filePath);

// // Output the retrieved object
// console.log('Retrieved Object:', retrievedObject);
