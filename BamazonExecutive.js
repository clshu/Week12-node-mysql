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

function displayDepartmentsShort(result) {
  var str;
  var nameLength = 20;
  

  console.log('+---------+----------------------+---------+-------------+');
  console.log('| dept_id | department_name      | overhead|product sales|');
  console.log('+---------+----------------------+---------+-------------+');
  result.forEach(function (item) {
    str = printf('| %7d | %20s | %7d | % 11.2f |', item.department_id, my_util.pad(item.department_name, nameLength), item.overhead_cost, item.product_sales);
    console.log(str);
  });
  console.log('+---------+----------------------+---------+-------------+');
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

function createNewDepartment () {

  inquirer.prompt([
    {
      type: "input",
      message: "New Department Name: ",
      name: "department_name",
    },
    {
      type: "input",
      message: "Department Overhead Cost: ",
      name: "overhead_cost",
      validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    }
  ]).then(function (request) {
    connection.query('INSERT INTO Departments SET ?',{
     department_name: request.department_name,
     overhead_cost: request.overhead_cost
    }, function (error, result) {
      if (error) {
        console.log(error)
        connection.end();
        return ;
      }

      console.log('\nAdding New Department is a SUCCESS!\n');

      connection.query('SELECT department_id, department_name, overhead_cost, product_sales FROM Departments WHERE department_name=?', request.department_name, function(err, result) {
        if (err) {
          console.error(err);
          connection.end();
          return;
        }
        // Verify INSERT
        displayDepartmentsShort(result);
        connection.end();
      });

    });
  });

}
//
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
        createNewDepartment();
        break;
 
    }
  });
}

// Main 

askExecutiveInput();
