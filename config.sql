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