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

function displayDepartments(result) {
  var str;
  var nameLength = 20;
  

  console.log('+---------+----------------------+---------+-------------+-------------+');
  console.log('| dept_id | department_name      | overhead|product sales|total profit |');
  console.log('+---------+----------------------+---------+-------------+-------------+');
  result.forEach(function (item) {
    str = printf('| %7d | %20s | %7d | % 11.2f | %11.2f |', item.department_id, my_util.pad(item.department_name, nameLength), item.overhead_cost, item.product_sales, item.total_profit);
    console.log(str);
  });
  console.log('+---------+----------------------+---------+-------------+-------------+');
}
function viewProductSales () {
  connection.query('SELECT department_id, department_name, overhead_cost, product_sales, (product_sales - overhead_cost) AS total_profit FROM Departments', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }

    displayDepartments(result);
    connection.end();
  });

}
function viewLowInventory () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE stock_quantity < 5', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }
    displayProducts(result);
    connection.end();
  });

}

function addInventoryWrapper () {
  connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }
    displayProducts(result);
    var list = my_util.itemIdList(result);
    addInventory(list);
  });
}

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
      console.log('\nInvalid item_id: ' + request.item_id + '\n');
      addInventory(list);
      return;
    }

    connection.query('UPDATE Products SET stock_quantity=stock_quantity + ? WHERE item_id=?',
      [request.quantity, request.item_id], function (error, result) {
      if (error) {
        console.log(error)
        connection.end();
        return ;
      }

      console.log('\nUpdating Product is a SUCCESS!\n');

      connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        if (err) {
          console.log(err)
          connection.end();
          return ;
        }
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

      connection.query('SELECT item_id, product_name, price, stock_quantity FROM Products WHERE item_id=?', request.item_id, function(err, result) {
        displayProducts(result);
        connection.end();
      });

    });
  });

}
function createNewDeparment () {

}

function askExecutiveInput () {

  inquirer.prompt([

   {
      type: "list",
      message: "Select an option:",
      name: "action",
      choices: ['View Product Sales by Department',
                'Create New Department']
    }
  ]).then(function (request) {
    switch (request.action) {
      case 'View Product Sales by Department':
        viewProductSales();
        break;
      case 'Create New Department':
        createNewDeparment();
        break;
 
    }
  });
}

// Main 

askExecutiveInput();
