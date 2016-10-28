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
// Display Departments
// Use printf to format the lines
// total_profit is calculated on the fly
//
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
//
// Display Departments in shorter form
// Use printf to format the lines
// This is to verify the Add Department result, so no total_profit, as it's not part of table
// 
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

//
// Get all rows in Departments table
// total_profit is calculated on the fly by doing (product_sales - overhead_cost)
//
function viewProductSales () {
  connection.query('SELECT department_id, department_name, overhead_cost, product_sales, (product_sales - overhead_cost) AS total_profit FROM Departments', function(err, result) {
    if (err) {
        console.log(err)
        connection.end();
        return ;
    }
    // Display result
    displayDepartments(result);
    connection.end();
  });

}

//
// Create a new department in Departments table
//
function createNewDepartment () {
  // Ask execute for the department_name and overhead_cost of the new department
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
    //
    // Insert new record with department_name and overhead_cost
    // department_id is auto incremented, and product_sales is not updated by
    // customers yet, so it will be default to 0.00
    //
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
      // Verify if the Addition is correct by searching its department_name
      connection.query('SELECT department_id, department_name, overhead_cost, product_sales FROM Departments WHERE department_name=?', request.department_name, function(err, result) {
        if (err) {
          console.error(err);
          connection.end();
          return;
        }
        // Display the new department
        displayDepartmentsShort(result);
        connection.end();
      });

    });
  });

}
//
// Ask the execute which action to take by using inquirer
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
