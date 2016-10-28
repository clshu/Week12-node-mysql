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

var remainingQuantity;
var originalResult;

// Functions

//
// Display Products without stock_quantity
// Use printf to format the line
//
function displayProducts(result) {
  var str;
  var idLength = 7;
  var nameLength = 38;
  

  console.log('+---------+----------------------------------------+-----------+');
  console.log('| item_id | product_name                           |   price   |');
  console.log('+---------+----------------------------------------+-----------+');
  result.forEach(function (item) {
    str = printf('| %7s | %38s | % 9.2f |', my_util.pad(item.item_id, idLength), my_util.pad(item.product_name, nameLength), item.price);
    console.log(str);
  });
  console.log('+---------+----------------------------------------+-----------+');
}

//
// Ask Customer Questions with inquirer
//
function askCustomerInput (list) {

  inquirer.prompt([

   {
      type: "input",
      message: "Enter item_id of the product you want to buy: ",
      name: "item_id",
    },

   {
     type: "input",
     message: "Enter the quantity you want to buy: ",
     name: "quantity",
     // validate it's a number
     validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
   }
  ]).then(function (request) {
    // Validate item_id first
    if (list.indexOf(request.item_id.toUpperCase()) == -1) {
      console.log('\nInvalid item_id: ' + request.item_id + '\n');
      askCustomerInput(list);
    } else {
      // Find the product from database by its item_id, input by the customer
      connection.query('SELECT department_name, stock_quantity, price FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        if (err) {
          console.error(err);
          connection.end();
          return;
        } 
        // Deep copy the result for the later use
        originalResult = Object.assign({}, result[0]);
        // Calculate the remaining quantity
        remainingQuantity = result[0].stock_quantity - parseInt(request.quantity);
        // Calculate the sales
        var sales = result[0].price * parseInt(request.quantity);
 
        if (remainingQuantity < 0) {
          // Validate the available quantity
          console.log('\nInsufficient quantity! Request ' + request.quantity + ' units, only ' + result[0].stock_quantity + ' units available.\n');
          askCustomerInput(list);
        } else {
          //
          // Update Products, Departments at the same time, it's implicitely INNER JOIN by WHERE condition
          // Products.stock_quantity = remainingQuantity, 
          // Departments.product_sales = Departments.product_sales + sales
          //

          var updateSQL = 'UPDATE Products, Departments ';
          updateSQL += 'SET Products.stock_quantity = ?, Departments.product_sales =  Departments.product_sales + ? ';
          updateSQL += 'WHERE Products.department_name = Departments.department_name AND Products.item_id = ? AND Departments.department_name = ?';
          connection.query(updateSQL, [remainingQuantity, sales, request.item_id, result[0].department_name], function(err, updateResult) {
            if (err) {
              console.error(err);
              connection.end();
              return;
            }
            // Verify the result
            connection.query('SELECT product_name, stock_quantity FROM Products WHERE item_id=?', [request.item_id], function(err, newResult) {
              if (err) {
               console.error(err);
               connection.end();
               return;
              }

              console.log('\nRequested item_id: ' + request.item_id.toUpperCase() + ' | Name: ' + newResult[0].product_name);
              console.log('Requested Quantity: ' + request.quantity + ' Available Quantity: ' + originalResult.stock_quantity + ' Remaining Quantity: ' + newResult[0].stock_quantity);
              console.log('Cost: $' + sales);
              console.log('');
              connection.end();
              return;
            });
          });
        }
      });  
    }
    
  });
}
//
// Main program
// 
// Display all products for sales, without stock_quantity
//
connection.query('SELECT item_id, product_name, price FROM Products', function(err, result) {
  if (err) {
    console.error(err);
    connection.end();
    return;
  }
  // Display Products
  displayProducts(result);
  // Cerate a list of item_id from result for UI
  // to validate the user input
  var list = my_util.itemIdList(result);
  // Call UI
  askCustomerInput(list);

});

