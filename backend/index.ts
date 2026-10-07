import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // allow all origins — fine for local dev

app.get("/get_contracts", (req, res) => {
    res.json([
        { owner_address: "0.0.1234567", contract_address: "0.0.10889834" }
    ]);
});

app.listen(5000, () => console.log('listening on 5000'));