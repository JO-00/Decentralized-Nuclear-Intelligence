import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

type Entry = { owner_address: string; contract_address: string };

const contracts: Entry[] = [
    { owner_address: "0.0.10871818", contract_address: "0.0.10961608" }
];

app.get("/get_contracts", (req, res) => {
    res.json(contracts);
});

app.post("/save_contract", (req, res) => {
    const { owner, contract } = req.body as { owner: string; contract: string };
    if (!owner || !contract) return res.status(400).json({ error: "owner and contract required" });

    contracts.push({ owner_address: owner, contract_address: contract });
    res.json(true);
});

app.listen(5000, () => console.log('listening on 5000'));