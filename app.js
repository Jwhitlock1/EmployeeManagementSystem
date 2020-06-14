/////
// require

const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// allow these pulls to be easily pulled into multiple functions
let roles;
let managers;

//to allow us to console log in gray
const colors = require("colors");
colors.enable();

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  // console.log(the big boi employee manager title thing);
  setRoles();
  startEmployee();
});

/////
// start application

// WORKING
// begin questions
const startEmployee = () => {
  inquirer.prompt([
    {
      message: "What would you like to do?",
      type: "list",
      choices: ["View All Employees", "View All Employees By Department", "Add Employee", "Update Employee Role"],
      // optional choices for bonus: "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Employees By Manager"
      name: "startEmployee"
    }
  ]).then(({ startEmployee }) => {
    switch (startEmployee) {
      case "View All Employees":
        viewAll();
        break;
      case "View All Employees By Department":
        viewAllByDepartment();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Update Employee Role":
        updateRole();
        break;
      // bonus cases
      // case "Remove Employee":
      //   removeEmployee();
      //   break; 
      // case "View All Employees By Manager":
      //   viewAllByManager();
      //   break; 
      // case "Update Employee Manager"
      //   updateManager();
      //   break;
    }
  });
};

//WORKING
// have this outside of the add employee process because the roles set never changes
// for the role options bring in the options from a MySQL query of role table 
const setRoles = () => {
  //need to bring in an array of titles/title id and employees/employee id
  var query = "SELECT id, title FROM role";
  connection.query(query, function (err, res) {
    roles = res;
  });
};

/////
// Options

// WORKING
const addEmployee = () => {
  //need to bring in an array of titles/title id and employees/employee id
  var query = "SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS managers FROM employee";
  connection.query(query, function (err, res) {
    managers = res;
    employeeGenerator(roles, managers);
  });
};

// WORKING
// ask for the employees first and last name, as well as role and manager
// for the manager options bring in the options from a MySQL query of employee table
// make a variable for the list of managers that are tied to their employee_id
const employeeGenerator = (roles, managers) => {
  let roleOptions = [];
  let managerOptions = [];

  for (i = 0; i < roles.length; i++) {
    roleOptions.push(Object.values(roles[i].title).join(""));
  };

  for (i = 0; i < managers.length; i++) {
    managerOptions.push(Object.values(managers[i].managers).join(""));
  };

  inquirer.prompt([
    {
      message: "What is the employee's first name?",
      name: "first_name",
      type: "input"
    },
    {
      message: "What is the employee's last name?",
      name: "last_name",
      type: "input"
    },
    {
      message: "What is the employee's role?",
      name: "role_id",
      choices: roleOptions, //roles array
      type: "list"
    },
    {
      message: "Who is the employee's manager?",
      name: "manager_id",
      choices: managerOptions, //managers array
      type: "list"
    }
  ]).then((res) => {
    // console.log(answers); // Undefined
    // console.log(res); // actual answers object
    // console.log(res.role_id); // role chosen

    let role_id;
    let manager_id;

    //for loop to match role chosen to original object and grab role_id
    for (i = 0; i < roles.length; i++) {
      if (roles[i].title === res.role_id) {
        role_id = roles[i].id;
      };
    };

    for (i = 0; i < managers.length; i++) {
      if (managers[i].managers === res.manager_id) {
        manager_id = managers[i].id;
      };
    };
    var query = "INSERT INTO employee SET ?, ?, ?, ?";
    connection.query(query, [{ first_name: res.first_name }, { last_name: res.last_name }, { role_id: role_id }, { manager_id: manager_id }], function (err, res) {
      if (err) throw err;
      startEmployee();
    });
  });
};

// WORKING
// query to search by first name last name
// replace current title
const updateRole = () => {
  var query = "SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS employees FROM employee";
  connection.query(query, function (err, res) {
    let employee = res;
    roleUpdate(roles, employee);
  });
};

const roleUpdate = (roles, employee) => {

  let employeeChoice = [];
  let roleChoices = [];

  for (i = 0; i < employee.length; i++) {
    employeeChoice.push(Object.values(employee[i].employees).join(""));
  };

  for (i = 0; i < roles.length; i++) {
    roleChoices.push(Object.values(roles[i].title).join(""));
  };


  inquirer.prompt([
    {
      message: "Which employee's role do you want to update?",
      name: "employee",
      type: "list",
      choices: employeeChoice
    },
    {
      message: "What is the employee's role?",
      name: "title",
      type: "list",
      choices: roleChoices
    }
  ]).then((answers) => {

    let employee_id;
    let role_id;

    // find role id based off of role name
    for (i = 0; i < roles.length; i++) {
      if (roles[i].title === answers.title) {
        role_id = roles[i].id;
      };
    };

    // find employee id based of of employee name
    for (i = 0; i < employee.length; i++) {
      if (employee[i].employees === answers.employee) {
        employee_id = employee[i].id;
      };
    };

    var query = ("UPDATE employee SET ? WHERE ?");
    connection.query(query, [{ role_id: role_id }, { id: employee_id }], function (err, res) {
      if (err) throw err;
      startEmployee();
    });

  });
};

// WORKING
const viewAll = () => {
  //console log all employees 
  var query = 'SELECT e.id, e.first_name, e.last_name, d.name AS department, r.title, r.salary, CONCAT_WS(" ", m.first_name, m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id ORDER BY e.id ASC';
  connection.query(query, function (err, res) {

    let table = [];

    for (var i = 0; i < res.length; i++) {
      table.push({ id: res[i].id, name: res[i].first_name + " " + res[i].last_name, title: res[i].title, salary: res[i].salary, department: res[i].department, manager: res[i].manager });
    };

    let tableGray = cTable.getTable(table);
    console.log(tableGray.gray);

    startEmployee();
  });
};

// WORKING
const viewAllByDepartment = () => {
  inquirer.prompt([
    // pull options from department table
    {
      message: "Which department would you like to view the employees from?",
      choices: ["Sales", "Engineering", "Finance", "Legal"],
      name: "department",
      type: "list"
    }
  ]).then((answer) => {
    var query = "SELECT e.first_name, e.last_name, r.title, d.name FROM employee e INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id WHERE d.name = ?";
    connection.query(query, [answer.department], function (err, res) {
      let table = [];
      //console log all employees WHERE department = answer.department
      for (var i = 0; i < res.length; i++) {
        table.push({ name: res[i].first_name + " " + res[i].last_name, title: res[i].title, department: res[i].name });
      };

      // NEEDS TO DISPLAY IN GRAY
      let tableGray = cTable.getTable(table);
      console.log(tableGray.gray);

      startEmployee();
    });
  });
};