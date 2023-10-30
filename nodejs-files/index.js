const fs = require("fs").promises;
const path = require("path");

async function calculateSalesTotal(salesFiles) {
  let salesTotal = 0;

  for (file of salesFiles) {
    // read the file and parse the contents as JSON
    const data = JSON.parse(await fs.readFile(file));
    // add the amount in the data.total field to the salesTotal variable.
    salesTotal += data.total;
  }

  return salesTotal;
}


async function findSalesFiles(folderName) {
  // this array will hold sales files as they are found
  let salesFiles = [];

  async function findFiles(folderName) {
    // read all the items in the current folder
    const items = await fs.readdir(folderName, { withFileTypes: true });

    // iterate over each found item
    for (item of items) {
      // if the item is a directory, it will need to be searched for files
      if (item.isDirectory()) {
        // search this directory for files (this is recursion!)
        await findFiles(path.join(folderName,item.name));
      } else {
        // Make sure the discovered file is a sales.json file
        if (path.extname(item.name) === ".json") {
          // store the file path in the salesFiles array
          await salesFiles.push(path.join(folderName, item.name));
        }
      }
    }
  }

  // find the sales files
  await findFiles(folderName);

  // return the array of found file paths
  return salesFiles;
}

async function main() {
  const salesDir = path.join(__dirname, "stores");
  const salesTotalsDir = path.join(__dirname, "salesTotals")

  // create the salesTotal directory if it doesn't exist
  try {
    await fs.mkdir(salesTotalsDir);
  } catch {
    console.log(`${salesTotalsDir} already exists.`)
  }

  // find paths to all the sales files
  const salesFiles = await findSalesFiles(salesDir);

  // read through each sales file to calculate the sales total
  const salesTotal = await calculateSalesTotal(salesFiles);

  // write the total to a "totals.json" file
  await fs.writeFile(
    path.join(salesTotalsDir, "totals.txt"), 
    `${salesTotal}\r\n`,
    {flag: "a"}
    );
}

main();