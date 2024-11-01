import express from "express";
import bodyParser from "body-parser";
import * as sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('customers.db');

db.serialize(() => {
    db.run(
        'CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT)'
    );
});

app.get('/customers', (req: express.Request, res: express.Response) => {
    db.all('SELECT * FROM customers', (err: Error | null, rows: any[]) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send(rows);
        }
    });
});

app.post('/customers', (req: express.Request, res: express.Response) => {
    const { name, phone, email } = req.body;
    db.run('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [name, phone, email], (err: Error | null) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send('Customer added successfully');
        }
    });
});

app.put('/customers/:id', (req: express.Request, res: express.Response) => {
    const { name, phone, email } = req.body;
    const id = req.params.id;
    db.run('UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?', [name, phone, email, id], (err: Error | null) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send('Customer updated successfully');
        }
    });
});

app.delete('/customers/:id', (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    db.run('DELETE FROM customers WHERE id = ?', [id], (err: Error | null) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send('Customer deleted successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
