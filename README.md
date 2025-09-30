💰 Secure Multi-User Expense Tracker
An efficient, full-stack web application designed to help users securely manage and visualize their personal expenses. Built with the MERN stack's core components (MongoDB, Express, Node.js) and vanilla JavaScript for the frontend.

✨ Features
Multi-User Authentication: Secure user registration and login using JSON Web Tokens (JWT) and bcrypt password hashing.

Data Scoping: Expenses are strictly filtered so that users can only view, add, or delete their own data.

Intuitive Interface: A simple, single-page interface built with HTML, CSS, and plain JavaScript.

Real-time Summary: Displays an Overall Summary and dynamically updating Expense History table.

RESTful API: A clean API built on Express.js for managing users and expenses.

🛠️ Tech Stack
Component	Technology	Role
Backend	Node.js, Express.js	Handles routing, middleware, and application logic.
Database	MongoDB (via Mongoose)	Flexible, NoSQL data storage for users and expenses.
Security	JWT & bcryptjs	Secures API endpoints and hashes passwords.
Frontend	HTML, CSS, Vanilla JavaScript	Handles user interface, authentication flows, and API requests.

Export to Sheets
⚙️ Local Setup and Installation
Follow these steps to get a copy of the project running on your local machine.

Prerequisites
Node.js (LTS version recommended)

MongoDB connection string (e.g., from MongoDB Atlas)

Git

Step 1: Clone the Repository
Bash

git clone https://github.com/YourUsername/expense-tracker.git
cd expense-tracker
Step 2: Install Dependencies
This command installs all packages listed in package.json.

Bash

npm install
Step 3: Configure Environment Variables
Create a file named .env in the root directory and add your configuration details:

Code snippet

# MongoDB Connection String from MongoDB Atlas
MONGO_URI="your_mongodb_atlas_connection_string_here"

# A long, complex, random string for JWT signing
JWT_SECRET="your_highly_secure_jwt_secret_key"
Step 4: Run the Application
Start the server in development mode (using nodemon if installed):

Bash

npm run dev
# Server will start on http://localhost:3000
🖥️ Usage
Access: Open your browser to http://localhost:3000/.

Register: Create a new user account.

Login: Log in with your new credentials to receive a JWT token (stored locally).

Track Expenses: The application will display the main Expense View, allowing you to add, view, and manage your personalized expense data securely.

🤝 Contribution
Feel free to fork the repository, open issues, or submit pull requests to suggest new features or improvements!
