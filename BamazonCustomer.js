const mysql     = require('mysql');
const inquirer  = require('inquirer');
const util      = require('util');

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

function displayProducts(result) {
  var str;
  console.log('+---------+---------------+---------+');
  console.log('| item_id | product_name  | price   |');
  console.log('+---------+-------------------------+');
  result.forEach(function (item) {
    str = util.format('| %s | %s | %d |', item.item_id, item.product_name, item.price);
    console.log(str);
  });
  console.log('+-----------------------------------+');
}

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
     validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
   }
  ]).then(function (request) {

    if (list.indexOf(request.item_id.toUpperCase()) == -1) {
      console.log('Invalid item_id: ' + request.item_id);
      askCustomerInput(list);
    } else {
      connection.query('SELECT stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        if (err) {
          console.error(err);
          connection.end();
          return;
        } 
 
        originalResult = Object.assign({}, result[0]);
  
        remainingQuantity = result[0].stock_quantity - parseInt(request.quantity);
 
        if (remainingQuantity < 0) {
          console.log('Insufficient quantity! Request ' + request.quantity + ' units, only ' + result[0].stock_quantity + ' units available.\n');
          askCustomerInput(list);
        } else {
          connection.query('UPDATE Products SET stock_quantity=? WHERE item_id=?', [remainingQuantity, request.item_id], function(err, updateResult) {
            if (err) {
              console.error(err);
              connection.end();
              return;
            }

            connection.query('SELECT product_name, stock_quantity FROM Products WHERE item_id=?', [request.item_id], function(err, newResult) {
              if (err) {
               console.error(err);
               connection.end();
               return;
              }
              console.log('\nRequested item_id: ' + request.item_id.toUpperCase() + ' | Name: ' + newResult[0].product_name);
              console.log('Request quantity: ' + request.quantity + ' Available Quantity: ' + originalResult.stock_quantity + ' Remaining Quantity: ' + newResult[0].stock_quantity);
              connection.end();
              return;
            });
          });
        }
      });  
    }
    
  });
}

// Main 
// first query opens connection
connection.query('SELECT item_id, product_name, price FROM Products', function(err, result) {
  if (err) {
    console.error(err);
    connection.end();
    return;
  }
  
  displayProducts(result);
  var list = result.map(function(item) {
          return item.item_id;
  });

  askCustomerInput(list);

});

