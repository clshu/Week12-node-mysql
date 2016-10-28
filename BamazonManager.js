const mysql     = require('mysql');
const inquirer  = require('inquirer');
const printf    = require('printf');
const my_util   = require('./my_util'); // Common code for all files

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : '',
  database : 'Bamazon'
});

// Functions

//
// Display Products from SELECT result
// Use printf to format the line
//
function displayProducts(result) {
  var str;
  var idLength = 7;
  var nameLength = 36;
  

  console.log('+---------+--------------------------------------+---------+-----------+');
  console.log('| item_id | product_name                         | quantity|   price   |');
  console.log('+---------+--------------------------------------+---------+-----------+');
  result.forEach(function (item) {
    str = printf('| %7s | %36s | %7d | % 9.2f |', my_util.pad(item.item_id, idLength), my_util.pad(item.product_name, nameLength), item.stock_quantity, item.price);
    console.log(str);
  });
  console.log('+---------+--------------------------------------+---------+-----------+');
}

//
// Get all products from Products table for the manager to view
//
function viewProducts () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }
    // Display products
    displayProducts(result);
    connection.end();
  });

}
//
// Get the products which has stock_quantity < 5
//
function viewLowInventory () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE stock_quantity < 5', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }
    // Display the result
    displayProducts(result);
    connection.end();
  });

}

//
// Add more inventory to an exsiting product
//
function addInventoryWrapper () {
  // Show all products first, so the manager can see
  // which item_id to add more inventory
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }
    displayProducts(result);
    // Create a list of item_id for UI to validate the user input
    var list = my_util.itemIdList(result);
    // Call UI
    addInventory(list);
  });
}

//
// Ask the manager which item_id to add inventory and 
// how many more units to add
//
function addInventory (list) {
  
  inquirer.prompt([
    {
      type: "input",
      message: "Enter Product Item ID to Add More: ",
      name: "item_id",
    },
    {
      type: "input",
      message: "Add More Quantity: ",
      name: "quantity",
      // Validate if it's a number
      validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    }
  ]).then(function (request) {
    // Validate the item_id
    if (list.indexOf(request.item_id.toUpperCase()) == -1) {
      console.log('\nInvalid item_id: ' + request.item_id + '\n');
      addInventory(list);
      return;
    }
    // Update the product of that item_id and
    // SET stock_quantity=stock_quantity +  request.quantity
    connection.query('UPDATE Products SET stock_quantity=stock_quantity + ? WHERE item_id=?',
      [request.quantity, request.item_id], function (error, result) {
      if (error) {
        console.log(error)
        connection.end();
        return ;
      }

      console.log('\nUpdating Product is a SUCCESS!\n');
      // Verify the UPDATE result
      connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        if (err) {
          console.log(err)
          connection.end();
          return ;
        }
        // Display updated result
        displayProducts(result);
        connection.end();
      });

    });
  });
}

//
// Add a new product to Products table
// Ask the manager input item_id, product_name, department_name,
// price, and quantity of the new product
//
function addNewProduct () {

  inquirer.prompt([
    {
      type: "input",
      message: "New Item ID: ",
      name: "item_id",
    },
    {
      type: "input",
      message: "New Product Name: ",
      name: "product_name",
    },
    {
      type: "input",
      message: "New Product's Department Name: ",
      name: "department_name",
    },
    {
      type: "input",
      message: "Price: ",
      name: "price",
      validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    },
    {
      type: "input",
      message: "Quantity: ",
      name: "quantity",
      validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    }
  ]).then(function (request) {
    // Verify if Department exists,
    // if not, abort and ask Executive to add it
    connection.query('SELECT department_name FROM Departments WHERE department_name = ?', request.department_name, function(err, result) {
      if (err) {
          console.log(err)
          connection.end();
          return ;
      }

      if (result.length == 0) {
        console.log('Department ' + request.department_name + ' does not exist.');
        console.log('Ask Executives to Add It!');
        connection.end();
        return ;
      } else {
        // The department exists, then add product
        insertIntoProducts(request);
      }    
    });

  });

}

function insertIntoProducts(request) {
    // INSERT INTO Products table
    connection.query('INSERT INTO Products SET ?',{
     item_id: request.item_id.toUpperCase(),
     product_name: request.product_name,
     department_name: request.department_name,
     price: request.price,
     stock_quantity: request.quantity
    }, function (error, result) {
      if (error) {
        console.log(error)
        connection.end();
        return ;
      }

      console.log('\nAdding New Product is a SUCCESS!\n');
      // Verify INSERT result
      connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        // Display INSERT result
        displayProducts(result);
        connection.end();
      });

    });

}

//
// Ask the manager which action to take
//
function askManagerInput () {

  inquirer.prompt([

   {
      type: "list",
      message: "Select an option:",
      name: "action",
      choices: ['View Products for Sale',
                'View Low Inventory',
                'Add to Inventory',
                'Add New Product']
    }
  ]).then(function (request) {
    switch (request.action) {
      case 'View Products for Sale':
        viewProducts();
        break;
      case 'View Low Inventory':
        viewLowInventory();
        break;
      case 'Add to Inventory':
        addInventoryWrapper();
        break;
      case 'Add New Product':
        addNewProduct();
        break;
    }
  });
}

// Main Program

askManagerInput();
