# 📘 Book API

A simple RESTful API built with **Node.js**, **Express.js**, and **SQLite** for managing a collection of books.  
Includes unit testing, integration testing, static code analysis, and CI/CD pipeline.

---

## 🚀 Features

- 📚 Create and retrieve books via REST endpoints
- 🧪 Unit & Integration tests using Jest and Supertest
- 📈 Code coverage with threshold enforcement
- 🧹 Static code analysis using ESLint
- 🔐 Git hooks with Husky (pre-commit checks)
- 🤖 GitHub Actions for automated CI pipeline

---

## 📦 Tech Stack

| Category       | Tool/Library       |
|----------------|--------------------|
| Web Framework  | Express.js         |
| Database       | SQLite3            |
| Testing        | Jest, Supertest    |
| Linting        | ESLint             |
| Pre-commit     | Husky              |
| CI/CD          | GitHub Actions     |

---

## 📁 Project Structure
book-api/
├── src/ # Application code (Express routes, DB)
├── tests/ # Unit and integration tests
├── .github/workflows/ # GitHub Actions workflows
├── jest.config.mjs # Jest config with babel support
├── babel.config.js # Babel config for ESM support
├── .eslintrc.js / eslint.config.js # ESLint config
├── package.json # Project metadata & scripts
└── README.md # This file


---

## ⚙️ Requirements

- Node.js v20+
- npm v9+

---

## 🧩 Installation & Usage

```bash
# Clone the repository
git clone https://github.com/yourusername/book-api.git
cd book-api

# Install dependencies
npm install

# Start the app (default: http://localhost:3000)
npm start
```

## 🧪 Testing
```bash
# Run all tests
npm run test

# Run all tests with coverage
npm run test-coverage

# Run only ESLint (static code analysis)
npm run lint
```
---

## 🤖 CI/CD with GitHub Actions

Each push or pull request to `main` or `staging` will automatically:

- 🔍 Run **ESLint**
- ✅ Run **unit and integration tests**
- 📊 Enforce **test coverage thresholds**
- ❌ **Fail the pipeline** if any step fails

📁 CI configuration file: [`.github/workflows/test.yml`](.github/workflows/test.yml)

---

## 📜 License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](./LICENSE) file for details.

---

## 👨‍💻 Author

**Rafi**  
🔗 [github.com/rafifirmansyah28](https://github.com/rafifirmansyah28)  
📬 [rafifirmansyah287@gmail.com](mailto:rafifirmansyah287@gmail.com)
