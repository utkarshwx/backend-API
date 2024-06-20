import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

interface Submission {
    name: string;
    email: string;
    phone: string;
    githublink: string;
    stopwatchlink: string;
}

const dbFilePath = path.join(__dirname, 'db.json');

app.get('/ping', (req: Request, res: Response) => {
    res.json({ success: true });
});

app.post('/submit', (req: Request, res: Response) => {
    const newSubmission: Submission = req.body;

    try {
        if (!fs.existsSync(dbFilePath)) {
            fs.writeFileSync(dbFilePath, JSON.stringify([]));
        }

        const submissions: Submission[] = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
        submissions.push(newSubmission);
        fs.writeFileSync(dbFilePath, JSON.stringify(submissions));

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error while processing submission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/read', (req: Request, res: Response) => {
    const index = parseInt(req.query.index as string);

    if (isNaN(index)) {
        return res.status(400).json({ error: 'Invalid index' });
    }

    try {
        if (!fs.existsSync(dbFilePath)) {
            return res.status(404).json({ error: 'No submissions found' });
        }

        const submissions: Submission[] = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

        if (index < 0 || index >= submissions.length) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json(submissions[index]);
    } catch (error) {
        console.error('Error while reading submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
