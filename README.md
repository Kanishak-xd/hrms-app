<p align="left">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Bcrypt-ef9b1d?style=for-the-badge&logo=hackthebox&logoColor=white" alt="Bcrypt" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</p>

# Employee Master Management System

This is a full-stack MEAN stack web application designed to manage employee data efficiently. It includes features such as employee management, department and designation masters, authentication, and role-based access control.

## Technologies Used

- **Frontend:** Angular 20
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcrypt

---

## Features

### Authentication System

- Secure login with email and password
- JWT-based token authentication
- Passwords securely hashed using bcrypt
- Role-based access control (Admin, HR)

### Profile Page

- View employee information entered during registeration
- Read only from this page for all roles
- Columns include:
  Name, Email, Phone Number, Department, Designation, Father’s Name, Mother’s Name, Date of Birth, Date of Joining, PF Number, ESI Number, Bank Account, Bank Name, IFSC Code, Grade and Status

### Employee Master Page

- View all employee records in a table
- Filter/search by employee name, email, or department
- Add, edit, and delete employee data (Only accessible to HR)
- Columns include:
  Name, Email, Phone Number, Department, Designation, Father’s Name, Mother’s Name, Date of Birth, Date of Joining, PF Number, ESI Number, Bank Account, Bank Name, IFSC Code, Grade and Status

### Employee Details Page

- View detailed information of an individual employee
- Edit employee details (Only HR can do so)

### Dashboard Page

- Overview of employee statistics
- Total number of employees
- Accessible by all roles

### Department Master

- Add, edit, and delete departments
- View all departments
- Accessible by HR & Admin
- Columns include:
  Department ID, Department Name, Description, Status, Created On and Updated On

### Designation Master

- Add, edit, and delete designations
- View all job titles
- Accessible by HR & Admin
- Columns include:
  Designation ID, Designation Name, Department, Level, Description, Status, Created On and Updated On

### Company Master

- Add, edit, and delete company information
- View company list
- Only accessible by Admin
- Columns include:
  Company Name, Email, Phone, City, State, Status and Created On

---

## License

This project is licensed under the MIT License.
