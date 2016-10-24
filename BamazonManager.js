const mysql     = require('mysql');
const inquirer  = require('inquirer');
const printf    = require('printf');
const my_util   = require('./my_util');

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : '',
  database : 'Bamazon'
});

// Functions

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
  console.log('+------------------------------------------------+---------+-----------+');
}
function viewProducts () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products', function(err, result) {
    displayProducts(result);
    connection.end();
  });

}
function viewLowInventory () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE stock_quantity < 5', function(err, result) {
    displayProducts(result);
    connection.end();
  });

}

function addInventoryWrapper () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products', function(err, result) {
    displayProducts(result);
    addInventory();
  });
}

function addInventory () {
  
  inquirer.prompt([
    {
      type: "input",
      message: "Enter Product Item ID to Add More: ",
      name: "item_id",
    },
    {
      type: "input",
      message: "Enter Quantity: ",
      name: "quantity",
    }
  ]).then(function (request) {
    connection.query('UPDATE Products SET ? WHERE item_id=?',[{
     stock_quantity: request.quantity
    }, request.item_id], function (error, result) {
      if (error) {
        console.log(error)
        connection.end();
        return ;
      }

      console.log('\nUpdating Product is a SUCCESS!\n');

      connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        displayProducts(result);
        connection.end();
      });

    });
  });
}

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
    },
    {
      type: "input",
      message: "Quantity: ",
      name: "quantity",
    }
  ]).then(function (request) {
    connection.query('INSERT INTO Products SET ?',{
     item_id: request.item_id,
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

      connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        displayProducts(result);
        connection.end();
      });

    });
  });

}

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

// Main 

askManagerInput();
