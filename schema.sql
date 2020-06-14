DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE employee (
id INTEGER AUTO_INCREMENT NOT NULL,
first_name VARCHAR(30), 
last_name VARCHAR(30),

-- Should we just NOT NULL all these bitches?
role_id INTEGER,
INDEX role_ind (role_id),
-- CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id)
-- ON DELETE CASCADE,

manager_id INTEGER,
INDEX mang_ind (manager_id),
-- CONSTRAINT fk_employee FOREIGN KEY (manager_id) REFERENCES employee(id)
-- ON DELETE SET NULL,

PRIMARY KEY (id)
);

CREATE TABLE role (
id INTEGER AUTO_INCREMENT,
title VARCHAR(30),
salary	DECIMAL(10,2),

department_id INT,
-- INDEX dept_ind (department_id),
-- CONSTRAINT fk_deptid FOREIGN KEY (department_id) REFERENCES department(id)
-- ON DELETE CASCADE,

PRIMARY KEY (id)
);

CREATE TABLE department (
id INTEGER AUTO_INCREMENT,
name VARCHAR(30),
PRIMARY KEY (id)
);


-- SELECT * FROM employee;
-- SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department  FROM employee e JOIN role r ON e.role_id = r.title JOIN department d ON d.id = r.department_id;

INSERT INTO  employee (first_name, last_name, role_id)
VALUES
	("Jody", "Russell", 1),
    ("Adam", "Porter", 2),
    ("William", "Pritchard", 4);
    
INSERT INTO role (title, salary, department_id)
VALUES 
	("Sales Lead", 60000.00, 1), 
    ("Salesperson", 40000.00, 1), 
    ("Lead Engineer", 100000.00, 2), 
    ("Account Manager", 80000.00, 3), 
    ("Accountant", 85000.00, 3), 
    ("Legal Team Lead", 120000.00, 4);
    -- Does this need to be in this table as well?
    -- ("Manager");

INSERT INTO department (name)
VALUES
	("Sales"), ("Engineering"), ("Finance"), ("Legal");

SELECT * FROM role;
SELECT title FROM role;
SELECT * FROM department;
SELECT * FROM employee;


SELECT e.id, e.first_name, e.last_name, d.name AS department, r.title, r.salary, CONCAT_WS(" ", m.first_name, m.last_name) AS manager 
FROM employee e
LEFT JOIN employee m ON m.id = e.manager_id
INNER JOIN role r ON e.role_id = r.id 
INNER JOIN department d ON r.department_id = d.id 
ORDER BY e.id ASC;

SELECT e.first_name, e.last_name, r.title, d.name FROM employee e INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id WHERE d.name = "Finance";

SELECT id, first_name, last_name, CONCAT_WS(" ", first_name, last_name) AS managers FROM employee;

SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS employees FROM employee;

DELETE FROM employee WHERE id = 5;

INSERT INTO  employee (first_name, last_name, role_id, manager_id)
VALUES ("Test", "Case", 5, 5);

SELECT e.first_name, e.last_name, r.title, d.name FROM employee e INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id WHERE e.manager_id = 1;
