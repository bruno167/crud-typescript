"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const sqlite3 = __importStar(require("sqlite3"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const db = new sqlite3.Database('customers.db');
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT)');
});
app.get('/customers', (req, res) => {
    db.all('SELECT * FROM customers', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            res.send(rows);
        }
    });
});
app.post('/customers', (req, res) => {
    const { name, phone, email } = req.body;
    db.run('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [name, phone, email], (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            res.send('Customer added successfully');
        }
    });
});
app.put('/customers/:id', (req, res) => {
    const { name, phone, email } = req.body;
    const id = req.params.id;
    db.run('UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?', [name, phone, email, id], (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            res.send('Customer updated successfully');
        }
    });
});
app.delete('/customers/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM customers WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            res.send('Customer deleted successfully');
        }
    });
});
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
