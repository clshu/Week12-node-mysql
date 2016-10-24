CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE Products (
	item_id VARCHAR(20) NOT NULL UNIQUE,
	product_name VARCHAR(40),
	department_name VARCHAR(20),
	price DECIMAL(10,2),
	stock_quantity INTEGER(10),
	PRIMARY KEY(item_id)
);

LOAD DATA INFILE '/Users/chinlong/Desktop/Bootcamp/HW/Week12-node-mysql/products.csv'
INTO TABLE Products
FIELDS TERMINATED BY  ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

CREATE TABLE Departments (
	department_id INT NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(20),
	overhead_cost DECIMAL(10,2) DEFAULT 0.00,
	total_sales DECIMAL(20,2) DEFAULT 0.00,
	PRIMARY KEY(department_id)
) AUTO_INCREMENT = 1000;

LOAD DATA INFILE '/Users/chinlong/Desktop/Bootcamp/HW/Week12-node-mysql/departments.csv'
INTO TABLE Departments
FIELDS TERMINATED BY  ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

